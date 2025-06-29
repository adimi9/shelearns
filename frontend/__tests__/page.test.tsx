import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../app/page'; // Adjust the import path as needed
import { useRouter } from 'next/navigation'; // Import to access the mock

// Mock the useRouter hook to track navigation calls
// This mock is set up in jest.setup.js, but we re-import it here to ensure types and clear mocks if needed per test.
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

describe('Home Page', () => {
  beforeEach(() => {
    // Clear mock calls before each test to ensure isolation
    mockRouterPush.mockClear();
  });

  // --- Accessibility and Basic Rendering Tests ---
  test('renders the main heading', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', {
        name: /One platform\. A million paths into tech\./i,
      })
    ).toBeInTheDocument();
  });

  test('renders the navigation links', () => {
    render(<Home />);
    expect(screen.getByRole('link', { name: /Features/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Courses/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /About/i })).toBeInTheDocument();
  });

  test('renders the "Login" button', () => {
    render(<Home />);
    expect(
      screen.getByRole('button', { name: /Login/i })
    ).toBeInTheDocument();
  });

  test('renders the "Start your learning path" link', () => {
    render(<Home />);
    expect(
      screen.getByRole('link', { name: /Start your learning path/i })
    ).toBeInTheDocument();
  });

  test('renders all feature titles', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', { name: /Learn on your terms/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Built-in AI assistant/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Adaptive learning paths/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Progress that means something/i })
    ).toBeInTheDocument();
  });

  test('renders all empowerment quotes', () => {
    render(<Home />);
    expect(
      screen.getByText(/"I don't learn well from hour-long videos\."/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/"I want to code, but I don't know where to start\."/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/"I have limited time — I need every lesson to count"/i)
    ).toBeInTheDocument();
  });

  test('renders the "Join thousands of women in tech" button', () => {
    render(<Home />);
    expect(
      screen.getByRole('button', { name: /Join thousands of women in tech/i })
    ).toBeInTheDocument();
  });

  // --- Interaction Tests ---
  test('clicking "Login" button navigates to /login', async () => {
    const user = userEvent.setup();
    render(<Home />);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    await user.click(loginButton);
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith('/login');
  });

  test('clicking "Start your learning path" link navigates to /signup', async () => {
    const user = userEvent.setup();
    render(<Home />);
    const startLearningLink = screen.getByRole('link', {
      name: /Start your learning path/i,
    });

    await user.click(startLearningLink);
    // For Link components, React Testing Library simulates a native click
    // which doesn't directly call `router.push`. Instead, it changes `window.location.href`.
    // We can verify the `href` attribute on the link.
    // If you explicitly need to test the router.push for the Link, you'd mock the Link component itself
    // to call the mocked router.push. For a simple link, checking its href is often sufficient.
    expect(startLearningLink).toHaveAttribute('href', '/signup');
  });

  test('clicking "Join thousands of women in tech" button navigates to /onboarding', async () => {
    const user = userEvent.setup();
    render(<Home />);
    const joinButton = screen.getByRole('button', {
      name: /Join thousands of women in tech/i,
    });

    await user.click(joinButton);
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith('/onboarding');
  });
});