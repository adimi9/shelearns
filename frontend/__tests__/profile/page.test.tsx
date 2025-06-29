// app/__tests__/profile/page.test.tsx

import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '../../app/profile/page'; // Adjusted import path based on your directory structure
import { useRouter } from 'next/navigation';

// --- MOCK EXTERNAL DEPENDENCIES ---

// 1. Mock the useRouter hook from 'next/navigation'
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  usePathname: jest.fn(() => '/profile'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// 2. Mock child UI components to isolate ProfilePage logic
// We'll use data-testid attributes to easily query these mocked components
jest.mock('@/components/profile/animated-avatar', () => ({
  __esModule: true,
  default: jest.fn(({ type, size }) => (
    <div data-testid={`animated-avatar-mock-${type}-${size}`}>Mock Avatar for {type} ({size})</div>
  )),
}));

jest.mock('@/components/profile/avatar-selector', () => ({
  __esModule: true,
  default: jest.fn(({ currentAvatar, onSelect, onClose }) => (
    <div data-testid="avatar-selector-mock">
      Avatar Selector Mock
      <span data-testid="avatar-selector-current-avatar">{currentAvatar}</span>
      <button onClick={() => onSelect('new-avatar-type')} data-testid="avatar-selector-select-button">Select New Avatar</button>
      <button onClick={onClose} data-testid="avatar-selector-close-button">Close Selector</button>
    </div>
  )),
}));

jest.mock('@/components/profile/badge-collection', () => ({
  __esModule: true,
  default: jest.fn(() => (
    <div data-testid="badge-collection-mock">Badge Collection Mock</div>
  )),
}));

jest.mock('@/components/profile/xp-progress', () => ({
  __esModule: true,
  default: jest.fn(({ totalXP, currentLevelXP, nextLevelXP, currentLevel }) => (
    <div data-testid="xp-progress-mock">
      XP Progress Mock: {totalXP} XP, Level: {currentLevel}
    </div>
  )),
}));

jest.mock('@/components/profile/onboarding-responses', () => ({
  __esModule: true,
  default: jest.fn(({ responses }) => (
    <div data-testid="onboarding-responses-mock">
      Onboarding Responses Mock: Interest: {responses.interest}
    </div>
  )),
}));

jest.mock('@/components/profile/password-change', () => ({
  __esModule: true,
  default: jest.fn(({ onClose }) => (
    <div data-testid="password-change-mock">
      Password Change Mock
      <button onClick={onClose} data-testid="password-change-close-button">Close Password Change</button>
    </div>
  )),
}));

// Mock `lucide-react` icons
jest.mock('lucide-react', () => ({
    __esModule: true,
    ArrowLeft: jest.fn(() => <svg data-testid="icon-arrow-left" />),
    Edit: jest.fn(() => <svg data-testid="icon-edit" />),
    Save: jest.fn(() => <svg data-testid="icon-save" />),
    X: jest.fn(() => <svg data-testid="icon-x" />),
    Award: jest.fn(() => <svg data-testid="icon-award" />),
    Star: jest.fn(() => <svg data-testid="icon-star" />),
    KeyRound: jest.fn(() => <svg data-testid="icon-key-round" />),
}));


// 3. Mock `fetch` API calls for profile data
// This is the mock data that the component will "fetch" from the backend.
const mockProfileData = {
  name: "Sarah Johnson",
  email: "sarah.johnson@email.com",
  avatar: "tech-girl",
  joinDate: "January 2025",
  currentLevel: "Beginner",
  totalXP: 1250,
  currentLevelXP: 250,
  nextLevelXP: 500,
  coursesCompleted: 1,
  badgesEarned: 8,
  onboardingResponses: {
    interest: "Front End Web Development",
    motivation: "I want to get my first job as a frontend developer",
    experience: "I know basic HTML/CSS",
    technologies: ["React", "Tailwind CSS", "GitHub", "Vite"],
  },
};

const mockFetch = jest.fn();
beforeAll(() => {
  global.fetch = mockFetch;
});

afterEach(() => {
  mockFetch.mockClear(); // Clear fetch mock calls after each test
});


// --- TEST SUITE FOR PROFILE PAGE ---

describe('ProfilePage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear all mock calls, instances, and mock results before each test
    jest.clearAllMocks();
    // Configure mock fetch to return profile data for each test
    // Assuming the ProfilePage will eventually make a fetch request for user data
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockProfileData),
    });
  });

  // --- RENDERING TESTS ---
  test('renders profile page with fetched data in view mode initially', async () => {
    render(<ProfilePage />);

    // Wait for the async data fetch to complete and component to re-render with data
    await waitFor(() => {
      // Verify profile card elements are visible with mocked data
      expect(screen.getByText(mockProfileData.name)).toBeInTheDocument();
      expect(screen.getByText(mockProfileData.email)).toBeInTheDocument();
      expect(screen.getByText(`Member since ${mockProfileData.joinDate}`)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();

      // Verify AnimatedAvatar is rendered with the fetched avatar type
      expect(screen.getByTestId(`animated-avatar-mock-${mockProfileData.avatar}-large`)).toBeInTheDocument();
      // AvatarSelector and PasswordChange modals should NOT be visible initially
      expect(screen.queryByTestId('avatar-selector-mock')).not.toBeInTheDocument();
      expect(screen.queryByTestId('password-change-mock')).not.toBeInTheDocument();

      // Verify other mocked components are rendered with fetched data
      expect(screen.getByTestId('xp-progress-mock')).toBeInTheDocument();
      expect(screen.getByTestId('badge-collection-mock')).toBeInTheDocument();
      expect(screen.getByTestId('onboarding-responses-mock')).toBeInTheDocument();
      // Check data passed to onboarding responses mock
      expect(screen.getByTestId('onboarding-responses-mock')).toHaveTextContent(`Interest: ${mockProfileData.onboardingResponses.interest}`);


      // Verify Quick Stats section and its content
      expect(screen.getByRole('heading', { name: /Quick Stats/i })).toBeInTheDocument();
      expect(screen.getByText(mockProfileData.badgesEarned.toString())).toBeInTheDocument(); // Badges Earned count
      expect(screen.getByText('Achieved Badges')).toBeInTheDocument();
      expect(screen.getByText(mockProfileData.coursesCompleted.toString())).toBeInTheDocument(); // Completed Courses count
      expect(screen.getByText('Completed Courses')).toBeInTheDocument();
    });
  });

  // --- PROFILE EDITING TESTS ---
  test('toggles to edit mode when "Edit Profile" is clicked', async () => {
    render(<ProfilePage />);
    
    // Wait for initial render with data
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
    });
    const editProfileButton = screen.getByRole('button', { name: /Edit Profile/i });

    await user.click(editProfileButton);

    // Verify inputs and action buttons for edit mode are visible
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();

    // Verify inputs are pre-filled with the fetched data
    expect(nameInput.value).toBe(mockProfileData.name);
    expect(emailInput.value).toBe(mockProfileData.email);

    // Verify original display elements are hidden
    expect(screen.queryByText(mockProfileData.name)).not.toBeInTheDocument();
    expect(screen.queryByText(mockProfileData.email)).not.toBeInTheDocument();
  });

  test('cancels edit mode and reverts to original fetched data when "Cancel" is clicked', async () => {
    render(<ProfilePage />);
    // Wait for data to load
    await waitFor(() => {
        expect(screen.getByText(mockProfileData.name)).toBeInTheDocument();
    });
    const editProfileButton = screen.getByRole('button', { name: /Edit Profile/i });
    await user.click(editProfileButton); // Enter edit mode

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton); // Click cancel

    // Verify original fetched data is displayed again
    expect(screen.getByText(mockProfileData.name)).toBeInTheDocument();
    expect(screen.getByText(mockProfileData.email)).toBeInTheDocument();
    // Verify inputs for edit mode are hidden
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
  });

  test('saves new profile data and exits edit mode when "Save" is clicked', async () => {
    render(<ProfilePage />);
    // Wait for data to load
    await waitFor(() => {
        expect(screen.getByText(mockProfileData.name)).toBeInTheDocument();
    });
    const editProfileButton = screen.getByRole('button', { name: /Edit Profile/i });
    await user.click(editProfileButton); // Enter edit mode

    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const saveButton = screen.getByRole('button', { name: /Save/i });

    // Type new values into the inputs
    const newName = 'Updated Name';
    const newEmail = 'updated.email@example.com';
    await user.clear(nameInput);
    await user.type(nameInput, newName);
    await user.clear(emailInput);
    await user.type(emailInput, newEmail);

    await user.click(saveButton); // Click save

    // Verify new data is displayed and edit mode is exited
    expect(screen.getByText(newName)).toBeInTheDocument();
    expect(screen.getByText(newEmail)).toBeInTheDocument();
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument(); // Inputs are hidden
  });

  // --- AVATAR SELECTION TESTS ---
  test('opens and closes AvatarSelector modal', async () => {
    render(<ProfilePage />);
    // Wait for data to load
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
    // The button has an Edit icon, so we query by its accessible name (which would be 'Edit')
    const editAvatarButton = screen.getByRole('button', { name: /edit/i });
    
    // Open selector
    await user.click(editAvatarButton);
    expect(screen.getByTestId('avatar-selector-mock')).toBeInTheDocument(); // Avatar selector mock should be visible

    // Close selector using the mock's internal close button
    const closeSelectorButton = screen.getByTestId('avatar-selector-close-button');
    await user.click(closeSelectorButton);
    expect(screen.queryByTestId('avatar-selector-mock')).not.toBeInTheDocument(); // Avatar selector mock should be hidden
  });

  test('selects new avatar and updates profile', async () => {
    // We need to re-mock the AnimatedAvatar to ensure we can assert on its props after update
    const AnimatedAvatarMock = require('@/components/profile/animated-avatar').default;

    render(<ProfilePage />);
    // Wait for data to load
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
    const editAvatarButton = screen.getByRole('button', { name: /edit/i });
    
    await user.click(editAvatarButton); // Open selector

    // Before selection, verify initial avatar mock is present and correct type from mockProfileData
    expect(AnimatedAvatarMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: mockProfileData.avatar }),
        {}
    );
    expect(screen.getByTestId('avatar-selector-current-avatar')).toHaveTextContent(mockProfileData.avatar);

    const selectNewAvatarButton = screen.getByTestId('avatar-selector-select-button');
    await user.click(selectNewAvatarButton); // Simulate selecting a new avatar (via mock)

    // After selection, verify profile avatar is updated and selector is closed
    // We check if the AnimatedAvatar mock was called with the new avatar type
    expect(AnimatedAvatarMock).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'new-avatar-type' }), // 'new-avatar-type' is hardcoded in the mock's onSelect
        {}
    );
    expect(screen.queryByTestId('avatar-selector-mock')).not.toBeInTheDocument(); // Selector should be closed
  });

  // --- PASSWORD CHANGE TESTS ---
  test('opens and closes PasswordChange modal', async () => {
    render(<ProfilePage />);
    // Wait for data to load
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /Change Password/i })).toBeInTheDocument();
    });
    const changePasswordButton = screen.getByRole('button', { name: /Change Password/i });

    // Open modal
    await user.click(changePasswordButton);
    expect(screen.getByTestId('password-change-mock')).toBeInTheDocument(); // Password change mock should be visible

    // Close modal using the mock's internal close button
    const closePasswordChangeButton = screen.getByTestId('password-change-close-button');
    await user.click(closePasswordChangeButton);
    expect(screen.queryByTestId('password-change-mock')).not.toBeInTheDocument(); // Password change mock should be hidden
  });
});
