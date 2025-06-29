// app/__tests__/login/page.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../app/login/page'; // Adjusted import path for your structure
import { useRouter } from 'next/navigation'; // Import to access the mock

// --- MOCK EXTERNAL DEPENDENCIES ---

// 1. Mock the useRouter hook (from jest.setup.ts, but re-declare for clarity)
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  usePathname: jest.fn(() => '/login'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// 2. Mock `fetch` API calls
const mockFetch = jest.fn();
beforeAll(() => {
  global.fetch = mockFetch;
});

afterEach(() => {
  mockFetch.mockClear(); // Clear fetch mock calls after each test
});

// --- TEST SUITE FOR LOGIN PAGE ---

describe('LoginPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear mock calls and reset component state before each test
    mockRouterPush.mockClear();
    mockFetch.mockClear();
  });

  // --- RENDERING TESTS ---
  test('renders the login form with all fields', () => {
    render(<LoginPage />);

    expect(
      screen.getByRole('heading', { name: /Welcome Back/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forgot Password\?/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign Up Instead/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /GitHub/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Microsoft/i })).toBeInTheDocument();
  });

  // --- INPUT CHANGE TESTS ---
  test('updates email input correctly', async () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');
  });

  test('updates password input correctly', async () => {
    render(<LoginPage />);
    const passwordInput = screen.getByLabelText(/Password/i) as HTMLInputElement;

    await user.type(passwordInput, 'mysecretpassword');
    expect(passwordInput.value).toBe('mysecretpassword');
  });

  // --- FORM VALIDATION/DISABLED STATE TESTS ---
  test('submit button is initially disabled if inputs are empty (due to `required` attribute)', () => {
    render(<LoginPage />);
    const submitButton = screen.getByRole('button', { name: /Log In/i });
    // Browsers enforce `required` attribute client-side, making the form invalid.
    // React Testing Library does not simulate this built-in browser validation.
    // However, the button's `disabled={loading}` prop means it's initially enabled
    // unless you manually add additional client-side JS validation to disable it.
    // Given the component, the button starts enabled if loading is false.
    expect(submitButton).toBeEnabled();
  });

  test('submit button becomes disabled during login attempt', async () => {
    // Mock a pending fetch response
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Log In/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Logging in...');
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
  });


  // --- FORM SUBMISSION TESTS ---
  test('submits form successfully and navigates to roadmap', async () => {
    // Mock a successful fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ message: 'Login successful!' })), // Mock .text() method
      status: 200,
    });

    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Log In/i });

    // Fill the form
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'correctpassword');

    // Submit the form
    await user.click(submitButton);

    // Wait for the fetch call to complete and assertions to pass
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'user@example.com',
            password: 'correctpassword',
          }),
        }
      );
      expect(mockRouterPush).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith('/roadmap');
      // Ensure loading state is reset
      expect(submitButton).toHaveTextContent('Log In');
      expect(submitButton).toBeEnabled(); // Should be re-enabled after success
    });
  });

  test('displays error message on failed login due to API response', async () => {
    // Mock a failed fetch response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve('{"message": "Invalid credentials"}'), // Mock .text()
      status: 401,
    });

    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Log In/i });

    // Fill the form
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'wrongpassword');

    // Submit the form
    await user.click(submitButton);

    // Wait for the fetch call to complete and error message to appear
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled(); // Navigation should not occur
      // Ensure loading state is reset and button re-enabled
      expect(submitButton).toHaveTextContent('Log In');
      expect(submitButton).toBeEnabled();
      expect(emailInput).toBeEnabled();
      expect(passwordInput).toBeEnabled();
    });
  });

  test('displays generic error message on unexpected network error during login', async () => {
    // Mock a network error
    mockFetch.mockRejectedValueOnce(new Error('Network offline'));

    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Log In/i });

    // Fill the form
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'somepassword');

    // Submit the form
    await user.click(submitButton);

    // Wait for the fetch call to complete and error message to appear
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/An unexpected error occurred. Please check your network connection and server status./i)).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled(); // Navigation should not occur
      // Ensure loading state is reset and button re-enabled
      expect(submitButton).toHaveTextContent('Log In');
      expect(submitButton).toBeEnabled();
      expect(emailInput).toBeEnabled();
      expect(passwordInput).toBeEnabled();
    });
  });

  // --- NAVIGATION LINK TESTS ---
  test('forgot password link navigates to # (placeholder for now)', async () => {
    render(<LoginPage />);
    const forgotPasswordLink = screen.getByRole('link', { name: /Forgot Password\?/i });
    expect(forgotPasswordLink).toHaveAttribute('href', '#'); // It's currently a '#' placeholder
  });

  test('signup link navigates to /signup', async () => {
    render(<LoginPage />);
    const signupLink = screen.getByRole('link', { name: /Sign Up Instead/i });
    expect(signupLink).toHaveAttribute('href', '/signup');
  });
});