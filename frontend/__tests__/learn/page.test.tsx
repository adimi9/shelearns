// app/__tests__/learning/dashboard.test.tsx

import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LearningDashboard from '../../app/learn/[courseId]/page'; // Adjusted import path based on your directory structure
import { useRouter } from 'next/navigation';

// --- TYPE DEFINITIONS FOR MOCK DATA (Mirroring component's interfaces) ---
interface CourseContent {
  id: string;
  title: string;
  description?: string;
  url?: string;
  readTime?: string;
  duration?: string;
  youtubeId?: string;
  completed?: boolean;
}

interface CourseSectionData {
  available: boolean;
  docs?: CourseContent[];
  data?: CourseContent[]; // For notes
  videos?: CourseContent[];
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  hint?: string;
  relatedArticles?: { title: string; url: string }[];
}

interface ProgressState {
  officialDocs: boolean;
  notes: boolean;
  course: boolean;
  quiz: boolean;
}

// --- MOCK EXTERNAL DEPENDENCIES ---

// 1. Mock the useRouter hook from 'next/navigation'
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  usePathname: jest.fn(() => '/learn/html-css-fundamentals'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// 2. Mock child UI components to isolate LearningDashboard logic
// These mocks will allow us to check if the correct props are passed and
// simulate interactions by triggering their mock callbacks.

// Mock for SectionSidebar
jest.mock('@/components/learning/section-sidebar', () => ({
  __esModule: true,
  default: jest.fn(({ courseTitle, activeSection, onSectionChange, progress, availableSections, courseVideos, activeVideoId, onVideoSelect, completedVideos, isCollapsed, toggleCollapse, currentLevel, unlockedLevels, onLevelChange, onMoveToNext, canMoveToNext, onDifficultyAdjust, showDifficultyAdjust }: {
    courseTitle: string;
    activeSection: string;
    onSectionChange: (section: string) => void;
    progress: ProgressState;
    availableSections: { officialDocs: boolean; notes: boolean; course: boolean; quiz: boolean; };
    courseVideos: CourseContent[]; // Explicitly typed
    activeVideoId: string;
    onVideoSelect: (videoId: string) => void;
    completedVideos: Set<string>;
    isCollapsed: boolean;
    toggleCollapse: () => void;
    currentLevel: string;
    unlockedLevels: string[];
    onLevelChange: (level: string) => void;
    onMoveToNext: () => void;
    canMoveToNext: boolean;
    onDifficultyAdjust: (direction: 'easier' | 'harder') => void;
    showDifficultyAdjust: boolean;
  }) => (
    <div data-testid="section-sidebar-mock" className={isCollapsed ? 'collapsed' : 'expanded'}>
      <h2 data-testid="sidebar-course-title">{courseTitle}</h2>
      <button onClick={toggleCollapse} data-testid="sidebar-toggle-button">Toggle</button>
      {Object.keys(availableSections).map(sectionKey => availableSections[sectionKey as keyof typeof availableSections] && ( // Type assertion
        <button key={sectionKey} onClick={() => onSectionChange(sectionKey)} data-testid={`sidebar-section-button-${sectionKey}`} className={activeSection === sectionKey ? 'active' : ''}>
          {sectionKey.toUpperCase()}
        </button>
      ))}
      {activeSection === 'course' && courseVideos && courseVideos.map((video: CourseContent) => ( // Explicitly typed
        <button key={video.id} onClick={() => onVideoSelect(video.id)} data-testid={`sidebar-video-button-${video.id}`} className={activeVideoId === video.id ? 'active' : ''}>
          {video.title} {completedVideos.has(video.id) ? '(Completed)' : ''}
        </button>
      ))}
      <div data-testid="sidebar-progress">{JSON.stringify(progress)}</div>
      <div data-testid="sidebar-level">{currentLevel}</div>
      <div data-testid="sidebar-unlocked-levels">{JSON.stringify(unlockedLevels)}</div>
      <button onClick={() => onLevelChange('intermediate')} data-testid="sidebar-change-level-intermediate">Change to Intermediate</button>
      <button onClick={() => onMoveToNext()} data-testid="sidebar-move-next-button" disabled={!canMoveToNext}>Move Next</button>
      <button onClick={() => onDifficultyAdjust('easier')} data-testid="sidebar-difficulty-easier">Easier</button>
      <button onClick={() => onDifficultyAdjust('harder')} data-testid="sidebar-difficulty-harder">Harder</button>
    </div>
  )),
}));

// Mock for OfficialDocsSection
jest.mock('@/components/learning/official-docs-section', () => ({
  __esModule: true,
  default: jest.fn(({ docs, onComplete, completedDocs, onAllComplete }: {
    docs: CourseContent[]; // Explicitly typed
    onComplete: (docId: string) => void;
    completedDocs: Set<string>;
    onAllComplete: () => void;
  }) => (
    <div data-testid="official-docs-section-mock">
      Official Docs Section Mock
      {docs && docs.map((doc: CourseContent) => ( // Explicitly typed
        <span key={doc.id} data-testid={`doc-item-${doc.id}`}>{doc.title} {completedDocs.has(doc.id) ? '(Completed)' : ''}</span>
      ))}
      <button onClick={() => onComplete('html5-mdn')} data-testid="doc-complete-button-html5-mdn">Complete HTML5 MDN</button>
      <button onClick={onAllComplete} data-testid="doc-all-complete-button">Complete All Docs</button>
    </div>
  )),
}));

// Mock for NotesSection
jest.mock('@/components/learning/notes-section', () => ({
  __esModule: true,
  default: jest.fn(({ notes, onComplete, isCompleted }: {
    notes: CourseContent[]; // Explicitly typed
    onComplete: () => void;
    isCompleted: boolean;
  }) => (
    <div data-testid="notes-section-mock">
      Notes Section Mock {isCompleted ? '(Completed)' : ''}
      {notes && notes.map((note: CourseContent) => ( // Explicitly typed
        <span key={note.id} data-testid={`note-item-${note.id}`}>{note.title}</span>
      ))}
      <button onClick={onComplete} data-testid="notes-complete-button">Complete Notes</button>
    </div>
  )),
}));

// Mock for CourseSection
jest.mock('@/components/learning/course-section', () => ({
  __esModule: true,
  default: jest.fn(({ videos, onVideoComplete, onCourseComplete, isCompleted, activeVideoId, onVideoSelect, completedVideos, isAssistantOpen }: {
    videos: CourseContent[]; // Explicitly typed
    onVideoComplete: (videoId: string) => void;
    onCourseComplete: () => void;
    isCompleted: boolean;
    activeVideoId: string;
    onVideoSelect: (videoId: string) => void;
    completedVideos: Set<string>;
    isAssistantOpen: boolean;
  }) => (
    <div data-testid="course-section-mock">
      Course Section Mock {isCompleted ? '(Completed)' : ''}
      <span data-testid="course-section-active-video">{activeVideoId}</span>
      {videos && videos.map((video: CourseContent) => ( // Explicitly typed
        <button key={video.id} onClick={() => onVideoComplete(video.id)} data-testid={`video-complete-button-${video.id}`}>
          Complete {video.title}
        </button>
      ))}
      <button onClick={onCourseComplete} data-testid="course-all-complete-button">Complete Course Section</button>
      <span data-testid="course-assistant-open">{isAssistantOpen ? 'Assistant Open' : 'Assistant Closed'}</span>
    </div>
  )),
}));

// Mock for QuizSection
jest.mock('@/components/learning/quiz-section', () => ({
  __esModule: true,
  default: jest.fn(({ questions, onComplete, isCompleted }: {
    questions: QuizQuestion[]; // Explicitly typed
    onComplete: (score: number) => void;
    isCompleted: boolean;
  }) => (
    <div data-testid="quiz-section-mock">
      Quiz Section Mock {isCompleted ? '(Completed)' : ''}
      <span data-testid="quiz-question-count">{questions.length} Questions</span>
      <button onClick={() => onComplete(100)} data-testid="quiz-complete-button">Complete Quiz</button>
    </div>
  )),
}));

// Mock for ToastNotification
jest.mock('@/components/learning/toast-notification', () => ({
  __esModule: true,
  default: jest.fn(({ message, type, isVisible, onClose }: {
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
    onClose: () => void;
  }) => (
    isVisible ? (
      <div data-testid="toast-notification-mock" className={type}>
        {message}
        <button onClick={onClose} data-testid="toast-close-button">X</button>
      </div>
    ) : null
  )),
}));

// Mock for AIAssistant
jest.mock('@/components/learning/ai-assistant', () => ({
  __esModule: true,
  default: jest.fn(({ isVisible, onOpenChange }: {
    isVisible: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    isVisible ? (
      <div data-testid="ai-assistant-mock">
        AI Assistant Mock
        <button onClick={() => onOpenChange(false)} data-testid="ai-assistant-close-button">Close AI</button>
      </div>
    ) : null
  )),
}));

// Mock for DifficultyAdjustment
jest.mock('@/components/learning/difficulty-adjustment', () => ({
  __esModule: true,
  default: jest.fn(({ currentLevel, onDifficultyAdjust }: {
    currentLevel: string;
    onDifficultyAdjust: (direction: 'easier' | 'harder') => void;
  }) => (
    <div data-testid="difficulty-adjustment-mock">
      Difficulty Adjustment Mock: {currentLevel}
      <button onClick={() => onDifficultyAdjust('easier')} data-testid="difficulty-easier-button">Easier</button>
      <button onClick={() => onDifficultyAdjust('harder')} data-testid="difficulty-harder-button">Harder</button>
    </div>
  )),
}));

// Mock `lucide-react` icons (if not already globally mocked in setup)
jest.mock('lucide-react', () => ({
  __esModule: true,
  ArrowLeft: jest.fn(() => <svg data-testid="icon-arrow-left" />),
  Calendar: jest.fn(() => <svg data-testid="icon-calendar" />),
  Target: jest.fn(() => <svg data-testid="icon-target" />),
}));


// --- MOCK DATA FOR FETCH CALLS ---
const mockCourseData = {
  id: "html-css-fundamentals",
  title: "HTML & CSS Fundamentals: Complete Course",
  description: "Master foundational HTML5 structure and advanced CSS styling for modern web development.",
  sections: {
    officialDocs: {
      available: true,
      docs: [
        { id: "html5-mdn", title: "HTML5 Official Documentation (MDN)", description: "...", url: "#" },
        { id: "html5-w3c", title: "W3C HTML5 Specification", description: "...", url: "#" },
      ],
    },
    notes: {
      available: true,
      data: [
        { id: "html-note-1", title: "Understanding HTML5 Semantic Elements", description: "...", readTime: "5 min", url: "#" },
        { id: "css-note-1", title: "CSS Flexbox Complete Guide", description: "...", readTime: "10 min", url: "#" },
      ],
    },
    course: {
      available: true,
      videos: [
        { id: "html-vid-1", title: "Introduction to HTML5", duration: "12:30", youtubeId: "UB1O30fR-EE", completed: false },
        { id: "html-vid-2", title: "Semantic Elements Deep Dive", duration: "18:45", youtubeId: "UB1O30fR-EE", completed: false },
        { id: "css-vid-1", title: "CSS Fundamentals", duration: "20:15", youtubeId: "UB1O30fR-EE", completed: false },
      ],
    },
    quiz: {
      available: true,
    },
  },
};

const mockQuizQuestions = [
  { id: "1", question: "Which HTML5 element is best for representing a standalone piece of content?", options: [], correctAnswer: 2, hint: "", relatedArticles: [] },
  { id: "2", question: "What is the purpose of the <main> element?", options: [], correctAnswer: 1, hint: "", relatedArticles: [] },
  { id: "3", question: "Which attribute is required for all <img> elements for accessibility?", options: [], correctAnswer: 1, hint: "", relatedArticles: [] },
];


// 3. Mock `global.fetch`
const mockFetch = jest.fn();
beforeAll(() => {
  global.fetch = mockFetch;
});

afterEach(() => {
  mockFetch.mockClear(); // Clear fetch mock calls after each test
});


// --- TEST SUITE FOR LEARNING DASHBOARD PAGE ---

describe('LearningDashboard', () => {
  const user = userEvent.setup();
  const defaultParams = { courseId: 'html-css-fundamentals' }; // Default params for the component

  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mock calls on mocks (sidebar, docs, etc.)
    mockRouterPush.mockClear(); // Clear useRouter push calls

    // Reset fetch mock for each test
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/courses/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCourseData),
        });
      }
      // Add other API endpoints if your component fetches more data
      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });
  });

  // --- INITIAL RENDERING TESTS ---
  test('renders loading state initially', () => {
    // Configure fetch to be pending (never resolve immediately)
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));

    render(<LearningDashboard params={defaultParams} />);
    // You might render a loading spinner or message in your actual component
    // For this test, we just check that the main content is not yet there
    expect(screen.queryByTestId('section-sidebar-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('course-section-mock')).not.toBeInTheDocument();
  });

  test('renders the main layout and initial active section (Course) after data fetch', async () => {
    render(<LearningDashboard params={defaultParams} />);

    // Wait for the async data fetch and rendering to complete
    await waitFor(() => {
      // Verify SectionSidebar is present and initially expanded
      const sidebar = screen.getByTestId('section-sidebar-mock');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('expanded');
      expect(within(sidebar).getByTestId('sidebar-course-title')).toHaveTextContent(mockCourseData.title);
      expect(within(sidebar).getByTestId('sidebar-section-button-course')).toHaveClass('active');

      // Verify initial content panel is CourseSection
      expect(screen.getByTestId('course-section-mock')).toBeInTheDocument();
      expect(screen.queryByTestId('official-docs-section-mock')).not.toBeInTheDocument();
      expect(screen.queryByTestId('notes-section-mock')).not.toBeInTheDocument();
      expect(screen.queryByTestId('quiz-section-mock')).not.toBeInTheDocument();

      // Verify floating DifficultyAdjustment and ToastNotification are present
      expect(screen.getByTestId('difficulty-adjustment-mock')).toBeInTheDocument();
      expect(screen.getByTestId('toast-notification-mock')).toBeInTheDocument(); // Toast is rendered but not visible initially
      expect(screen.queryByTestId('ai-assistant-mock')).not.toBeInTheDocument(); // AI Assistant closed initially
    });
  });

  test('initial active video is set to the first video from fetched data', async () => {
    render(<LearningDashboard params={defaultParams} />);
    
    await waitFor(() => {
      // Check the active video ID displayed by the mocked CourseSection
      const courseSectionMock = screen.getByTestId('course-section-mock');
      expect(within(courseSectionMock).getByTestId('course-section-active-video')).toHaveTextContent(mockCourseData.sections.course.videos[0].id);

      // Also check active video in sidebar mock
      const sidebarMock = screen.getByTestId('section-sidebar-mock');
      expect(within(sidebarMock).getByTestId(`sidebar-video-button-${mockCourseData.sections.course.videos[0].id}`)).toHaveClass('active');
    });
  });

  test('displays error message if fetching course data fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error')); // Simulate network failure

    render(<LearningDashboard params={defaultParams} />);

    await waitFor(() => {
      expect(screen.getByText(/An error occurred while loading course data\./i)).toBeInTheDocument();
      expect(screen.queryByTestId('section-sidebar-mock')).not.toBeInTheDocument(); // Main content should not load
    });
  });

  // --- SECTION SWITCHING TESTS ---
  test('switches to Official Docs section when corresponding sidebar button is clicked', async () => {
    render(<LearningDashboard params={defaultParams} />);
    
    // Wait for sidebar to render
    const officialDocsButton = await screen.findByTestId('sidebar-section-button-officialDocs');
    await user.click(officialDocsButton);

    await waitFor(() => {
      expect(screen.getByTestId('official-docs-section-mock')).toBeInTheDocument();
      expect(screen.queryByTestId('course-section-mock')).not.toBeInTheDocument(); // Course section should be hidden
      expect(screen.queryByTestId('ai-assistant-mock')).not.toBeInTheDocument(); // AI assistant should be hidden
    });
  });

  test('switches to Notes section when corresponding sidebar button is clicked', async () => {
    render(<LearningDashboard params={defaultParams} />);
    
    const notesButton = await screen.findByTestId('sidebar-section-button-notes');
    await user.click(notesButton);

    await waitFor(() => {
      expect(screen.getByTestId('notes-section-mock')).toBeInTheDocument();
      expect(screen.queryByTestId('course-section-mock')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ai-assistant-mock')).not.toBeInTheDocument();
    });
  });

  test('switches to Quiz section when corresponding sidebar button is clicked', async () => {
    render(<LearningDashboard params={defaultParams} />);
    
    const quizButton = await screen.findByTestId('sidebar-section-button-quiz');
    await user.click(quizButton);

    await waitFor(() => {
      expect(screen.getByTestId('quiz-section-mock')).toBeInTheDocument();
      expect(screen.queryByTestId('course-section-mock')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ai-assistant-mock')).not.toBeInTheDocument();
    });
  });

  // --- SIDEBAR TOGGLE TESTS ---
  test('toggles sidebar collapse state when button is clicked', async () => {
    render(<LearningDashboard params={defaultParams} />);
    const sidebarToggle = await screen.findByTestId('sidebar-toggle-button');
    const mainContentArea = screen.getByTestId('course-section-mock').closest('div')?.parentElement; // Get parent div that applies ml- class

    await waitFor(() => {
      expect(mainContentArea).toHaveClass('ml-[320px]'); // Initially expanded
    });

    await user.click(sidebarToggle);
    expect(mainContentArea).toHaveClass('ml-[60px]'); // Collapsed

    await user.click(sidebarToggle);
    expect(mainContentArea).toHaveClass('ml-[320px]'); // Expanded again
  });

  // --- PROGRESS AND XP GAIN TESTS ---
  test('completing a video updates completed videos and user XP, and shows toast', async () => {
    render(<LearningDashboard params={defaultParams} />);
    
    const courseSectionMock = await screen.findByTestId('course-section-mock');
    const completeVideoButton = within(courseSectionMock).getByTestId('video-complete-button-html-vid-1');
    const toastNotificationMock = screen.getByTestId('toast-notification-mock');

    await user.click(completeVideoButton);

    // Verify completedVideos state updated (reflected in sidebar mock)
    const sidebarMock = screen.getByTestId('section-sidebar-mock');
    await waitFor(() => {
        expect(within(sidebarMock).getByTestId('sidebar-video-button-html-vid-1')).toHaveTextContent('(Completed)');
        // Verify XP gain (check userXP in sidebar progress JSON string)
        expect(within(sidebarMock).getByTestId('sidebar-progress')).toContainHTML('"userXP":1300'); // Initial 1250 + 50
        // Verify toast message
        expect(toastNotificationMock).toHaveTextContent('Video completed! +50 XP 🎉');
        expect(toastNotificationMock).toHaveClass('success');
    });
  });

  test('completing a doc updates completed docs and user XP, and shows toast', async () => {
    render(<LearningDashboard params={defaultParams} />);
    
    const officialDocsButton = await screen.findByTestId('sidebar-section-button-officialDocs');
    await user.click(officialDocsButton); // Switch to docs section
    
    const docsSectionMock = await screen.findByTestId('official-docs-section-mock');
    const completeDocButton = within(docsSectionMock).getByTestId('doc-complete-button-html5-mdn');
    const toastNotificationMock = screen.getByTestId('toast-notification-mock');

    await user.click(completeDocButton);

    // Verify completedDocs state updated (reflected in docs section mock)
    await waitFor(() => {
        expect(within(docsSectionMock).getByTestId('doc-item-html5-mdn')).toHaveTextContent('(Completed)');
        // Verify XP gain (check userXP in sidebar progress JSON string)
        const sidebarMock = screen.getByTestId('section-sidebar-mock');
        expect(within(sidebarMock).getByTestId('sidebar-progress')).toContainHTML('"userXP":1275'); // Initial 1250 + 25
        // Verify toast message
        expect(toastNotificationMock).toHaveTextContent('Documentation read! +25 XP 📚');
        expect(toastNotificationMock).toHaveClass('success');
    });
  });

  test('completing a section updates section progress and user XP, and shows toast', async () => {
    render(<LearningDashboard params={defaultParams} />);
    
    const courseSectionMock = await screen.findByTestId('course-section-mock');
    const completeCourseSectionButton = within(courseSectionMock).getByTestId('course-all-complete-button');
    const toastNotificationMock = screen.getByTestId('toast-notification-mock');

    await user.click(completeCourseSectionButton);

    // Verify progress state updated for 'course' section (reflected in sidebar mock)
    const sidebarMock = screen.getByTestId('section-sidebar-mock');
    await waitFor(() => {
        expect(within(sidebarMock).getByTestId('sidebar-progress')).toContainHTML('"course":true');
        // Verify XP gain
        expect(within(sidebarMock).getByTestId('sidebar-progress')).toContainHTML('"userXP":1450'); // Initial 1250 + 200
        // Verify toast message
        expect(toastNotificationMock).toHaveTextContent('Course completed! +200 XP 🎉');
        expect(toastNotificationMock).toHaveClass('success');
    });
  });

  // --- LEVEL UNLOCKING TESTS ---
  test('unlocks intermediate level and shows toast when all beginner sections are complete', async () => {
    render(<LearningDashboard params={defaultParams} />);
    const sidebarMock = await screen.findByTestId('section-sidebar-mock');
    const toastNotificationMock = screen.getByTestId('toast-notification-mock');

    // Simulate completing all sections to trigger intermediate unlock
    // 1. Complete Official Docs
    await user.click(await screen.findByTestId('sidebar-section-button-officialDocs'));
    await user.click(await screen.findByTestId('doc-all-complete-button'));
    await waitFor(() => { expect(within(sidebarMock).getByTestId('sidebar-progress')).toContainHTML('"officialDocs":true'); });

    // 2. Complete Notes
    await user.click(await screen.findByTestId('sidebar-section-button-notes'));
    await user.click(await screen.findByTestId('notes-complete-button'));
    await waitFor(() => { expect(within(sidebarMock).getByTestId('sidebar-progress')).toContainHTML('"notes":true'); });

    // 3. Complete Course
    await user.click(await screen.findByTestId('sidebar-section-button-course'));
    await user.click(await screen.findByTestId('course-all-complete-button'));
    await waitFor(() => { expect(within(sidebarMock).getByTestId('sidebar-progress')).toContainHTML('"course":true'); });

    // 4. Complete Quiz
    await user.click(await screen.findByTestId('sidebar-section-button-quiz'));
    await user.click(await screen.findByTestId('quiz-complete-button'));

    // Wait for the final section completion and level unlock toast
    await waitFor(() => {
        expect(within(sidebarMock).getByTestId('sidebar-progress')).toContainHTML('"quiz":true');
        // Check unlocked levels state
        expect(within(sidebarMock).getByTestId('sidebar-unlocked-levels')).toContainHTML('["beginner","intermediate"]');
        // Check toast message for intermediate unlock
        expect(toastNotificationMock).toHaveTextContent('🎉 Intermediate level unlocked! +500 bonus XP! You can now access more challenging content.');
        expect(toastNotificationMock).toHaveClass('success');
        // Check total XP after all sections + intermediate unlock bonus:
        // Initial 1250 + (4 sections * 200 XP/section) + 500 (intermediate bonus) = 1250 + 800 + 500 = 2550
        expect(within(sidebarMock).getByTestId('sidebar-progress')).toContainHTML('"userXP":2550');
    });
  });

  // --- LEVEL CHANGE TESTS ---
  test('allows changing level to an unlocked level and shows toast', async () => {
    render(<LearningDashboard params={defaultParams} />);
    const sidebarMock = await screen.findByTestId('section-sidebar-mock');
    const toastNotificationMock = screen.getByTestId('toast-notification-mock');

    // First, simulate unlocking intermediate level (by completing all sections)
    await user.click(await screen.findByTestId('sidebar-section-button-officialDocs'));
    await user.click(await screen.findByTestId('doc-all-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-notes'));
    await user.click(await screen.findByTestId('notes-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-course'));
    await user.click(await screen.findByTestId('course-all-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-quiz'));
    await user.click(await screen.findByTestId('quiz-complete-button'));
    await waitFor(() => {
      expect(within(sidebarMock).getByTestId('sidebar-unlocked-levels')).toContainHTML('["beginner","intermediate"]');
    });
    
    // Now click the button in sidebar to change level to intermediate
    const changeLevelButton = within(sidebarMock).getByTestId('sidebar-change-level-intermediate');
    await user.click(changeLevelButton);

    await waitFor(() => {
        expect(within(sidebarMock).getByTestId('sidebar-level')).toHaveTextContent('intermediate');
        expect(toastNotificationMock).toHaveTextContent('Switched to intermediate level! 📈');
        expect(toastNotificationMock).toHaveClass('info');
    });
  });

  test('prevents changing level to a locked higher level and shows error toast', async () => {
    render(<LearningDashboard params={defaultParams} />);
    const sidebarMock = await screen.findByTestId('section-sidebar-mock');
    const toastNotificationMock = screen.getByTestId('toast-notification-mock');

    // Attempt to change to intermediate level without completing all beginner sections
    const changeLevelButton = within(sidebarMock).getByTestId('sidebar-change-level-intermediate');
    await user.click(changeLevelButton);

    await waitFor(() => {
        expect(within(sidebarMock).getByTestId('sidebar-level')).toHaveTextContent('beginner'); // Should remain beginner
        expect(toastNotificationMock).toHaveTextContent('Complete all beginner content first to unlock intermediate level! 🔒');
        expect(toastNotificationMock).toHaveClass('error');
    });
  });

  // --- DIFFICULTY ADJUSTMENT TESTS ---
  test('can adjust difficulty to easier level', async () => {
    render(<LearningDashboard params={defaultParams} />);
    const difficultyAdjustMock = await screen.findByTestId('difficulty-adjustment-mock');
    const sidebarMock = screen.getByTestId('section-sidebar-mock');
    const toastNotificationMock = screen.getByTestId('toast-notification-mock');

    // First, complete all sections to unlock intermediate and set level to intermediate
    await user.click(await screen.findByTestId('sidebar-section-button-officialDocs'));
    await user.click(await screen.findByTestId('doc-all-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-notes'));
    await user.click(await screen.findByTestId('notes-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-course'));
    await user.click(await screen.findByTestId('course-all-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-quiz'));
    await user.click(await screen.findByTestId('quiz-complete-button'));
    await waitFor(() => {
        expect(within(sidebarMock).getByTestId('sidebar-unlocked-levels')).toContainHTML('["beginner","intermediate"]');
    });
    // Now explicitly change to intermediate level
    await user.click(within(sidebarMock).getByTestId('sidebar-change-level-intermediate'));
    await waitFor(() => {
        expect(within(sidebarMock).getByTestId('sidebar-level')).toHaveTextContent('intermediate');
    });

    // Now attempt to go easier from intermediate
    const easierButton = within(difficultyAdjustMock).getByTestId('difficulty-easier-button');
    await user.click(easierButton);

    await waitFor(() => {
        expect(within(sidebarMock).getByTestId('sidebar-level')).toHaveTextContent('beginner');
        expect(toastNotificationMock).toHaveTextContent('Switched to beginner level for easier content! 📚');
        expect(toastNotificationMock).toHaveClass('info');
    });
  });

  test('can adjust difficulty to harder level if unlocked', async () => {
    render(<LearningDashboard params={defaultParams} />);
    const difficultyAdjustMock = await screen.findByTestId('difficulty-adjustment-mock');
    const sidebarMock = screen.getByTestId('section-sidebar-mock');
    const toastNotificationMock = screen.getByTestId('toast-notification-mock');

    // First, complete all sections to unlock intermediate
    await user.click(await screen.findByTestId('sidebar-section-button-officialDocs'));
    await user.click(await screen.findByTestId('doc-all-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-notes'));
    await user.click(await screen.findByTestId('notes-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-course'));
    await user.click(await screen.findByTestId('course-all-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-quiz'));
    await user.click(await screen.findByTestId('quiz-complete-button'));
    await waitFor(() => {
      expect(within(sidebarMock).getByTestId('sidebar-unlocked-levels')).toContainHTML('["beginner","intermediate"]');
    });

    // Now try to go harder from beginner to intermediate using floating button
    const harderButton = within(difficultyAdjustMock).getByTestId('difficulty-harder-button');
    await user.click(harderButton);

    await waitFor(() => {
        expect(within(sidebarMock).getByTestId('sidebar-level')).toHaveTextContent('intermediate');
        expect(toastNotificationMock).toHaveTextContent('Switched to intermediate level for more challenging content! 🚀');
        expect(toastNotificationMock).toHaveClass('info');
    });
  });

  test('prevents adjusting difficulty to harder level if not unlocked', async () => {
    render(<LearningDashboard params={defaultParams} />);
    const difficultyAdjustMock = await screen.findByTestId('difficulty-adjustment-mock');
    const sidebarMock = screen.getByTestId('section-sidebar-mock');
    const toastNotificationMock = screen.getByTestId('toast-notification-mock');

    // Initially, only 'beginner' is unlocked. Try to go harder.
    const harderButton = within(difficultyAdjustMock).getByTestId('difficulty-harder-button');
    await user.click(harderButton);

    await waitFor(() => {
        expect(within(sidebarMock).getByTestId('sidebar-level')).toHaveTextContent('beginner'); // Stays beginner
        expect(toastNotificationMock).toHaveTextContent('Complete all content in your current level to unlock intermediate! 🔒');
        expect(toastNotificationMock).toHaveClass('error');
    });
  });

  // --- MOVE TO NEXT COURSE TESTS ---
  test('"Move to Next Course" button is disabled initially', async () => {
    render(<LearningDashboard params={defaultParams} />);
    const sidebarMock = await screen.findByTestId('section-sidebar-mock');
    const moveToNextButton = within(sidebarMock).getByTestId('sidebar-move-next-button');
    
    expect(moveToNextButton).toBeDisabled();
  });

  test('"Move to Next Course" button enables when all sections are complete and level is intermediate/advanced', async () => {
    render(<LearningDashboard params={defaultParams} />);
    const sidebarMock = await screen.findByTestId('section-sidebar-mock');
    const moveToNextButton = within(sidebarMock).getByTestId('sidebar-move-next-button');

    // Simulate completing all sections to enable the button
    await user.click(await screen.findByTestId('sidebar-section-button-officialDocs'));
    await user.click(await screen.findByTestId('doc-all-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-notes'));
    await user.click(await screen.findByTestId('notes-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-course'));
    await user.click(await screen.findByTestId('course-all-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-quiz'));
    await user.click(await screen.findByTestId('quiz-complete-button'));
    
    // After completing all sections, the level automatically unlocks intermediate,
    // making the button enabled.
    await waitFor(() => {
        expect(moveToNextButton).toBeEnabled();
    });
  });

  test('clicking "Move to Next Course" shows toast and triggers router push (no actual push yet)', async () => {
    render(<LearningDashboard params={defaultParams} />);
    const sidebarMock = await screen.findByTestId('section-sidebar-mock');
    const toastNotificationMock = screen.getByTestId('toast-notification-mock');
    const moveToNextButton = within(sidebarMock).getByTestId('sidebar-move-next-button');

    // First, complete all sections to enable the button
    await user.click(await screen.findByTestId('sidebar-section-button-officialDocs'));
    await user.click(await screen.findByTestId('doc-all-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-notes'));
    await user.click(await screen.findByTestId('notes-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-course'));
    await user.click(await screen.findByTestId('course-all-complete-button'));
    await user.click(await screen.findByTestId('sidebar-section-button-quiz'));
    await user.click(await screen.findByTestId('quiz-complete-button'));
    await waitFor(() => { expect(moveToNextButton).toBeEnabled(); }); // Ensure it's enabled

    await user.click(moveToNextButton);

    await waitFor(() => {
        expect(toastNotificationMock).toHaveTextContent("Congratulations! You've completed this course! Moving to the next adventure! 🎯");
        expect(toastNotificationMock).toHaveClass('success');
        // router.push is commented out in the component, so we expect it NOT to be called
        expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  // --- AI Assistant Visibility Test ---
  test('AI Assistant is visible only when "course" section is active', async () => {
    render(<LearningDashboard params={defaultParams} />);
    
    // Initially, course section is active, so AI Assistant should be visible
    const aiAssistantMock = await screen.findByTestId('ai-assistant-mock');
    expect(aiAssistantMock).toBeInTheDocument();
    expect(within(aiAssistantMock).getByTestId('ai-assistant-close-button')).toBeInTheDocument();

    // Switch to Official Docs section
    const officialDocsButton = await screen.findByTestId('sidebar-section-button-officialDocs');
    await user.click(officialDocsButton);
    await waitFor(() => {
        expect(screen.queryByTestId('ai-assistant-mock')).not.toBeInTheDocument(); // Should be hidden
    });

    // Switch back to Course section
    const courseButton = await screen.findByTestId('sidebar-section-button-course');
    await user.click(courseButton);
    await waitFor(() => {
        expect(screen.getByTestId('ai-assistant-mock')).toBeInTheDocument(); // Should be visible again
    });
  });
});
