// app/__tests__/roadmap/page.test.tsx

import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoadmapPage from '../../app/roadmap/page'; // Adjusted import path based on your directory structure
import { useRouter } from 'next/navigation';

// --- MOCK EXTERNAL DEPENDENCIES ---

// 1. Mock the useRouter hook from 'next/navigation'
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  usePathname: jest.fn(() => '/roadmap'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// 2. Mock the CourseOverview component
// This mock helps us verify the props passed to it without rendering its full complexity.
// It exposes buttons with data-testids that we can click to trigger the handlers.
jest.mock('@/components/roadmap/course-overview', () => ({
  __esModule: true,
  default: jest.fn(({ title, description, stats, progress, lastCourse, hasStarted, onStartCourse, onContinueCourse }) => (
    <div data-testid="course-overview-mock">
      <h2 data-testid="overview-title">{title}</h2>
      <p data-testid="overview-description">{description}</p>
      <span data-testid="overview-progress">{progress}%</span>
      <span data-testid="overview-last-course">{lastCourse}</span>
      {/* Buttons to trigger the passed handlers */}
      <button onClick={onStartCourse} data-testid="overview-start-button">
        Start Course Trigger
      </button>
      <button onClick={onContinueCourse} data-testid="overview-continue-button">
        Continue Course Trigger
      </button>
      <div data-testid="overview-stats">
        Videos: {stats.videos}, Articles: {stats.articles}, Quizzes: {stats.quizzes}, Estimated Hours: {stats.estimatedHours}
      </div>
    </div>
  )),
}));

// 3. Mock the CourseCard component
// Similarly, this mock helps verify props for each course card.
jest.mock('@/components/roadmap/course-card', () => ({
  __esModule: true,
  default: jest.fn(({ title, courseDescription, index, courseId, level, progress, stats, hasStarted, getLevelColor, getLevelTextColor }) => (
    <div data-testid={`course-card-mock-${courseId}`}>
      <h3 data-testid={`course-card-title-${courseId}`}>{index}. {title}</h3>
      <p data-testid={`course-card-description-${courseId}`}>{courseDescription}</p>
      {/* Simulate the color application using inline styles for testing purposes, for property verification */}
      <span data-testid={`course-card-level-${courseId}`} style={{ background: getLevelColor(level), color: getLevelTextColor(level) }}>{level}</span>
      <span data-testid={`course-card-progress-${courseId}`}>{progress}%</span>
      <span data-testid={`course-card-started-${courseId}`}>{hasStarted ? 'Started' : 'Not Started'}</span>
      <span data-testid={`course-card-stats-${courseId}`}>
        Videos: {stats.videos}, Articles: {stats.articles}, Quizzes: {stats.quizzes}, Estimated Hours: {stats.estimatedHours}
      </span>
    </div>
  )),
}));

// 4. Mock `fetch` API calls for the RoadmapPage data
const mockBackendData = {
  "roadmap_title": "Computer Security Learning Journey",
  "intro_paragraph": "**Based on your interest in Computer Security, particularly to enhance your capabilities in writing secure code,** we've curated a selection of courses that cover essential security principles, web application security, secure development practices, cloud security, and identity management. **By the end of this roadmap, you will be equipped with the skills to integrate security into your development processes and manage security in cloud environments.**",
  "recommended_courses": [
    {
      "name": "Introduction to Cybersecurity",
      "description": "This course covers fundamental cybersecurity concepts, including the CIA Triad, threats, vulnerabilities, and common attack vectors. It's an essential starting point for understanding the basic principles and best practices in cybersecurity.",
      "level": "Beginner",
      "stats": {
        "videos": 10,
        "articles": 5,
        "quizzes": 3,
        "estimated_hours": 8,
        "numeric_progress": 45
      }
    },
    {
      "name": "Web Application Security",
      "description": "Focusing on secure coding practices for web applications, this course delves into the OWASP Top 10 vulnerabilities, authentication, and session management issues, crucial for developers integrating security into their web apps.",
      "level": "Intermediate",
      "stats": {
        "videos": 15,
        "articles": 8,
        "quizzes": 4,
        "estimated_hours": 12,
        "numeric_progress": 10
      }
    },
    {
      "name": "Secure Software Development (DevSecOps)",
      "description": "This course provides insights into integrating security into the Software Development Life Cycle (SDLC), covering threat modeling, SAST, DAST, and secure coding guidelines essential for any developer’s toolkit.",
      "level": "Intermediate",
      "stats": {
        "videos": 12,
        "articles": 7,
        "quizzes": 3,
        "estimated_hours": 10,
        "numeric_progress": 100
      }
    },
    {
      "name": "Cloud Security",
      "description": "Learn about cloud security essentials including the shared responsibility model, IAM in the cloud, and container security basics. This course is crucial if you're working with AWS or Azure, offering insights into securing cloud environments.",
      "level": "Intermediate",
      "stats": {
        "videos": 18,
        "articles": 9,
        "quizzes": 5,
        "estimated_hours": 15,
        "numeric_progress": 0
      }
    },
    {
      "name": "Cryptography Basics",
      "description": "Gain an understanding of encryption algorithms, hashing techniques, PKI, and digital signatures, all fundamental to protecting data and ensuring secure communications within your applications.",
      "level": "Beginner",
      "stats": {
        "videos": 8,
        "articles": 4,
        "quizzes": 2,
        "estimated_hours": 7,
        "numeric_progress": 0
      }
    },
    {
      "name": "Identity & Access Management (IAM)",
      "description": "This course explores advanced authentication techniques such as MFA and SSO, alongside authorization models like RBAC and ABAC. It's essential for managing identities and permissions in modern applications.",
      "level": "Intermediate",
      "stats": {
        "videos": 14,
        "articles": 6,
        "quizzes": 4,
        "estimated_hours": 11,
        "numeric_progress": 0
      }
    }
  ],
  "overall_stats": {
    "videos": 77,
    "articles": 39,
    "quizzes": 21,
    "estimated_hours": 63,
    "numeric_progress": 23
  }
};

const mockFetch = jest.fn();
beforeAll(() => {
  global.fetch = mockFetch;
});

afterEach(() => {
  mockFetch.mockClear(); // Clear fetch mock calls after each test
});


// --- TEST SUITE FOR ROADMAP PAGE ---

describe('RoadmapPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear mock calls on useRouter and all other mocks before each test to ensure isolation
    mockRouterPush.mockClear();
    jest.clearAllMocks(); // This clears calls, instances, and mock results for all mocked modules.
                         // Crucial for CourseOverview and CourseCard mocks.
    // Ensure fetch returns the mock data for each test run
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockBackendData),
    });
  });

  // --- RENDERING TESTS ---
  test('renders the roadmap title and introduction correctly via CourseOverview mock after data fetch', async () => {
    render(<RoadmapPage />);

    // Wait for the asynchronous data fetching and rendering to complete
    await waitFor(() => {
      const courseOverviewMock = screen.getByTestId('course-overview-mock');
      expect(within(courseOverviewMock).getByTestId('overview-title')).toHaveTextContent('Computer Security Learning Journey');
      expect(within(courseOverviewMock).getByTestId('overview-description')).toHaveTextContent(/Based on your interest in Computer Security/i);
      expect(within(courseOverviewMock).getByTestId('overview-progress')).toHaveTextContent('23%'); // Overall progress from mockBackendData
      expect(within(courseOverviewMock).getByTestId('overview-last-course')).toHaveTextContent('No course started yet'); // Based on initial mockBackendData
      expect(within(courseOverviewMock).getByTestId('overview-stats')).toHaveTextContent('Videos: 77, Articles: 39, Quizzes: 21, Estimated Hours: 63');
    });

    // Check the main heading for the detailed course overview section
    expect(screen.getByRole('heading', { name: /Detailed Overview of Courses Generated For You/i })).toBeInTheDocument();
  });

  test('renders a minimum of 5 CourseCard components with required sections after data fetch', async () => {
    render(<RoadmapPage />);

    await waitFor(() => {
      // Verify a minimum of 5 course cards are rendered
      const courseCards = screen.getAllByTestId(/course-card-mock-/);
      expect(courseCards.length).toBeGreaterThanOrEqual(5);

      // Iterate through each course card and check for the existence of its sections
      courseCards.forEach((card, index) => {
        const courseId = mockBackendData.recommended_courses[index].name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const currentCard = within(card);

        // Check for existence of the title, description, level, progress, started status, and stats
        expect(currentCard.getByTestId(`course-card-title-${courseId}`)).toBeInTheDocument();
        expect(currentCard.getByTestId(`course-card-description-${courseId}`)).toBeInTheDocument();
        expect(currentCard.getByTestId(`course-card-level-${courseId}`)).toBeInTheDocument();
        expect(currentCard.getByTestId(`course-card-progress-${courseId}`)).toBeInTheDocument();
        expect(currentCard.getByTestId(`course-card-started-${courseId}`)).toBeInTheDocument();
        expect(currentCard.getByTestId(`course-card-stats-${courseId}`)).toBeInTheDocument();

        // Optional: Assert on specific level/progress for at least one card to ensure data mapping
        if (courseId === 'introduction-to-cybersecurity') {
          expect(currentCard.getByTestId(`course-card-progress-${courseId}`)).toHaveTextContent('45%');
          expect(currentCard.getByTestId(`course-card-level-${courseId}`)).toHaveTextContent('beginner');
        }
      });
    });
  });

  // --- INTERACTION TESTS ---

  test('clicking "Start Course Trigger" button navigates to the first course', async () => {
    render(<RoadmapPage />);

    // Wait for the CourseOverview mock to render its button
    const startButton = await screen.findByTestId('overview-start-button');
    expect(startButton).toBeInTheDocument();
    expect(startButton).toHaveTextContent('Start Course Trigger'); // Text from the mock

    await user.click(startButton);

    // Verify that router.push was called exactly once with the expected path
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    // The first course in your mockBackendData is "Introduction to Cybersecurity"
    expect(mockRouterPush).toHaveBeenCalledWith('/learn/introduction-to-cybersecurity');
  });

  test('clicking "Continue Course Trigger" button navigates to the first incomplete started course', async () => {
    render(<RoadmapPage />);

    // Wait for the CourseOverview mock to render its button
    const continueButton = await screen.findByTestId('overview-continue-button');
    expect(continueButton).toBeInTheDocument();

    await user.click(continueButton);

    // Verify that router.push was called exactly once with the expected path.
    // Based on the mockBackendData:
    // "Introduction to Cybersecurity" has 45% progress (started and incomplete).
    // "Web Application Security" has 10% progress (started and incomplete).
    // The `find` method in `handleContinueCourse` will pick the first one it finds.
    expect(mockRouterPush).toHaveBeenCalledTimes(1);
    expect(mockRouterPush).toHaveBeenCalledWith('/learn/introduction-to-cybersecurity');
  });

  // --- EDGE CASE TESTS ---

  test('handles no courses available for start/continue gracefully', async () => {
    // Mock fetch to return no recommended courses
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ...mockBackendData,
        recommended_courses: [], // Empty array for this test
        overall_stats: { ...mockBackendData.overall_stats, numeric_progress: 0 }
      }),
    });

    // Spy on console.log to check if the message is logged
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<RoadmapPage />);

    const startButton = await screen.findByTestId('overview-start-button');
    await user.click(startButton);

    expect(consoleSpy).toHaveBeenCalledWith("No courses available to start.");
    expect(mockRouterPush).not.toHaveBeenCalled(); // Should not navigate

    // For continue, if no courses are available, it should fall back to handleStartCourse
    // which then logs "No courses available to start."
    const continueButton = await screen.findByTestId('overview-continue-button');
    await user.click(continueButton);
    expect(consoleSpy).toHaveBeenCalledWith("No courses to continue or start.");

    consoleSpy.mockRestore(); // Restore original console.log
  });
});
