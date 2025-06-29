import '@testing-library/jest-dom/extend-expect';
import { TextDecoder, TextEncoder } from 'util'; // Polyfill for TextEncoder/Decoder if needed in Jest

// Polyfill for TextEncoder and TextDecoder in JSDOM environment if not available globally
// This can sometimes be necessary for libraries that depend on them (e.g., Next.js internal workings, or certain third-party libs)
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder as any; // Cast as any because TextDecoder might have a different signature in 'util' vs global
}


// Mock useRouter from next/navigation
// This mock covers the common methods used in Next.js 13+ App Router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(), // Added refresh for completeness
  })),
  usePathname: jest.fn(() => '/'), // Mock default path
  useSearchParams: jest.fn(() => new URLSearchParams()), // Mock default search params
  redirect: jest.fn(), // Mock redirect for server components if ever tested in client context
}));

// You might also need to mock specific lucide-react components if they cause issues
// For example, if you get 'svg is not a valid component' error or similar
// jest.mock('lucide-react', () => ({
//   ArrowRight: ({ className }: { className?: string }) => <svg className={className} data-testid="mock-arrow-right" />,
//   Brain: ({ className }: { className?: string }) => <svg className={className} data-testid="mock-brain" />,
//   // ... mock other icons you use
// }));

// If you have global CSS imports that Jest needs to ignore, you can add them here
// For example: import '../styles/globals.css';
// If your CSS is purely TailwindCSS utility classes, you often don't need to mock it like this.
// But if you have actual CSS files that define classes, this prevents Jest from trying to parse them.
// import 'whatwg-fetch'; // If you use fetch in client components and want to mock it globally (less common now with MSW)