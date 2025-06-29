import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '../../app/signup/page'; // Adjust the import path as needed
import { useRouter } from 'next/navigation'; // Import to access the mock

// --- MOCK EXTERNAL DEPENDENCIES ---

// 1. Mock the useRouter hook (already in jest.setup.ts, but re-declare for clarity and specific mock functions)
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  usePathname: jest.fn(() => '/signup'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// 2. Mock the PasswordStrength component
// This prevents us from needing to test PasswordStrength's internal logic here,
// and instead, we just ensure it receives the correct `password` prop.
jest.mock('@/components/auth/password-strength', () => ({
  __esModule: true,
  default: jest.fn(({ password }) => (
    <div data-testid="password-strength-mock">{`Password strength for: ${password}`}</div>
  )),
}));

// 3. Mock `fetch` API calls
// We will mock `global.fetch` to control API responses.
const mockFetch = jest.fn();
beforeAll(() => {
  global.fetch = mockFetch;
});

afterEach(() => {
  mockFetch.mockClear(); // Clear fetch mock calls after each test
});

// --- TEST SUITE FOR SIGNUP PAGE ---

describe('SignupPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear mock calls and reset component state before each test
    mockRouterPush.mockClear();
    mockFetch.mockClear();
    // Reset process.env.NEXT_PUBLIC_BACKEND_URL for consistent testing
    process.env.NEXT_PUBLIC_BACKEND_URL = 'http://localhost:8080';
  });

  // --- RENDERING TESTS ---
  test('renders the signup form with all fields', () => {
    render(<SignupPage />);

    expect(
      screen.getByRole('heading', { name: /Create Your Account/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/What should we call you\?/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Your email \(so we can track your progress\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Create a strong password/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Log In Instead/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /github/i })).toBeInTheDocument(); // Finds button by accessible name (even if icon)
  });

  test('renders the password strength component', () => {
    render(<SignupPage />);
    expect(screen.getByTestId('password-strength-mock')).toBeInTheDocument();
  });

  // --- INPUT CHANGE TESTS ---
  test('updates name input correctly', async () => {
    render(<SignupPage />);
    const nameInput = screen.getByLabelText(
      /What should we call you\?/i
    ) as HTMLInputElement;

    await user.type(nameInput, 'Jane Doe');
    expect(nameInput.value).toBe('Jane Doe');
  });

  test('updates email input correctly', async () => {
    render(<SignupPage />);
    const emailInput = screen.getByLabelText(
      /Your email \(so we can track your progress\)/i
    ) as HTMLInputElement;

    await user.type(emailInput, 'jane.doe@example.com');
    expect(emailInput.value).toBe('jane.doe@example.com');
  });

  test('updates password input and passes it to PasswordStrength', async () => {
    const PasswordStrengthMock = require('@/components/auth/password-strength').default;
    render(<SignupPage />);
    const passwordInput = screen.getByLabelText(
      /Create a strong password/i
    ) as HTMLInputElement;

    await user.type(passwordInput, 'SecureP@ss123');
    expect(passwordInput.value).toBe('SecureP@ss123');

    // Verify PasswordStrength component received the updated password
    expect(PasswordStrengthMock).toHaveBeenCalledWith(
      expect.objectContaining({
        password: 'SecureP@ss123',
      }),
      {}
    );
  });

  // --- FORM VALIDATION TESTS ---
  test('submit button is disabled initially', () => {
    render(<SignupPage />);
    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    expect(submitButton).toBeDisabled();
  });

  test('submit button remains disabled if not all password criteria are met', async () => {
    render(<SignupPage />);
    const nameInput = screen.getByLabelText(/What should we call you\?/i);
    const emailInput = screen.getByLabelText(/Your email \(so we can track your progress\)/i);
    const passwordInput = screen.getByLabelText(/Create a strong password/i);
    const submitButton = screen.getByRole('button', { name: /Create Account/i });

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'short'); // Does not meet length criterion

    expect(submitButton).toBeDisabled();
  });

  test('submit button enables when form is valid', async () => {
    render(<SignupPage />);
    const nameInput = screen.getByLabelText(/What should we call you\?/i);
    const emailInput = screen.getByLabelText(/Your email \(so we can track your progress\)/i);
    const passwordInput = screen.getByLabelText(/Create a strong password/i);
    const submitButton = screen.getByRole('button', { name: /Create Account/i });

    await user.type(nameInput, 'Valid Name');
    await user.type(emailInput, 'valid@example.com');
    await user.type(passwordInput, 'StrongP@ss1'); // Meets all criteria

    expect(submitButton).toBeEnabled();
  });

  // --- FORM SUBMISSION TESTS ---
  test('displays error message if form is submitted with invalid data', async () => {
    render(<SignupPage />);
    const submitButton = screen.getByRole('button', { name: /Create Account/i });

    // Try submitting without filling any fields
    await user.click(submitButton);

    expect(screen.getByText(/Please ensure all fields are filled correctly and password criteria are met./i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled(); // No API call should be made
  });

  test('submits form successfully and navigates to onboarding', async () => {
    // Mock a successful fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'Signup successful!' }),
    });

    render(<SignupPage />);
    const nameInput = screen.getByLabelText(/What should we call you\?/i);
    const emailInput = screen.getByLabelText(/Your email \(so we can track your progress\)/i);
    const passwordInput = screen.getByLabelText(/Create a strong password/i);
    const submitButton = screen.getByRole('button', { name: /Create Account/i });

    // Fill the form with valid data
    await user.type(nameInput, 'New User');
    await user.type(emailInput, 'new.user@example.com');
    await user.type(passwordInput, 'ValidP@ss1'); // Meets all criteria

    // Submit the form
    await user.click(submitButton);

    // Verify loading state
    expect(submitButton).toHaveTextContent('Creating Account...');
    expect(submitButton).toBeDisabled();

    // Wait for the fetch call to complete and assertions to pass
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/signup', // Uses the default BASE_BACKEND_URL
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'New User',
            email: 'new.user@example.com',
            password: 'ValidP@ss1',
          }),
        }
      );
      expect(mockRouterPush).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith('/onboarding');
      expect(screen.queryByText(/An unexpected error occurred during signup./i)).not.toBeInTheDocument(); // Error message should not be visible
    });
    // Ensure button state resets after successful navigation (or at least loading clears)
    await waitFor(() => {
        expect(submitButton).toHaveTextContent('Create Account');
    });
  });

  test('displays error message on failed signup due to API error', async () => {
    // Mock a failed fetch response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Email already registered.' }),
    });

    render(<SignupPage />);
    const nameInput = screen.getByLabelText(/What should we call you\?/i);
    const emailInput = screen.getByLabelText(/Your email \(so we can track your progress\)/i);
    const passwordInput = screen.getByLabelText(/Create a strong password/i);
    const submitButton = screen.getByRole('button', { name: /Create Account/i });

    // Fill the form with valid data
    await user.type(nameInput, 'Error User');
    await user.type(emailInput, 'error.user@example.com');
    await user.type(passwordInput, 'ErrorP@ss1'); // Meets all criteria

    // Submit the form
    await user.click(submitButton);

    // Wait for the fetch call to complete and error message to appear
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Email already registered./i)).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Create Account'); // Button text should revert
      expect(submitButton).toBeEnabled(); // Button should be re-enabled if form is still valid
      expect(mockRouterPush).not.toHaveBeenCalled(); // Navigation should not occur on error
    });
  });

  test('displays generic error message on unexpected signup error', async () => {
    // Mock a network error or other unexpected fetch failure
    mockFetch.mockRejectedValueOnce(new Error('Network is down.'));

    render(<SignupPage />);
    const nameInput = screen.getByLabelText(/What should we call you\?/i);
    const emailInput = screen.getByLabelText(/Your email \(so we can track your progress\)/i);
    const passwordInput = screen.getByLabelText(/Create a strong password/i);
    const submitButton = screen.getByRole('button', { name: /Create Account/i });

    // Fill the form with valid data
    await user.type(nameInput, 'Network User');
    await user.type(emailInput, 'network.user@example.com');
    await user.type(passwordInput, 'NetworkP@ss1'); // Meets all criteria

    // Submit the form
    await user.click(submitButton);

    // Wait for the fetch call to complete and error message to appear
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/An unexpected error occurred during signup\./i)).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Create Account'); // Button text should revert
      expect(submitButton).toBeEnabled(); // Button should be re-enabled if form is still valid
      expect(mockRouterPush).not.toHaveBeenCalled(); // Navigation should not occur on error
    });
  });

  // --- NAVIGATION LINK TEST ---
  test('login link navigates to /login', async () => {
    render(<SignupPage />);
    const loginLink = screen.getByRole('link', { name: /Log In Instead/i });
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});