// components/context/UserContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation"; // Import usePathname and useRouter

interface UserProfile {
  username: string;
  avatarType: string; // e.g., 'tech-girl', 'tech-guy'
}

interface UserContextType {
  user: UserProfile | null;
  isLoadingUser: boolean;
  fetchUserProfile: () => Promise<void>; // Function to refetch user data
  setUser: (user: UserProfile | null) => void; // Function to manually set user (e.g., after update)
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname(); // Get current pathname
  const router = useRouter(); // Get router for potential redirects

  const BASE_BACKEND_URL =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_BACKEND_URL
      ? process.env.NEXT_PUBLIC_BACKEND_URL
      : "http://localhost:8080";

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchUserProfile = useCallback(async () => {
    setIsLoadingUser(true);
    let authToken = null;

    if (isClient) {
      authToken = localStorage.getItem("authToken");
    }

    if (!authToken) {
      setUser(null); // Clear user if no token
      setIsLoadingUser(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_BACKEND_URL}/api/profile/identity`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data: UserProfile = await response.json();
        setUser(data);
      } else {
        // If token is invalid or expired, clear it and user data
        console.error("Failed to fetch user profile, token might be invalid:", response.status, await response.text());
        if (isClient) { // Ensure localStorage is only accessed on client
          localStorage.removeItem("authToken");
        }
        setUser(null);
        // If the context fails to fetch, it's good to force a redirect to login
        // to prevent users from being stuck on a broken page.
        router.push('/login');
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (isClient) { // Ensure localStorage is only accessed on client
        localStorage.removeItem("authToken");
      }
      setUser(null); // Ensure user is null on fetch error
      router.push('/login'); // Redirect on network errors too
    } finally {
      setIsLoadingUser(false);
    }
  }, [BASE_BACKEND_URL, isClient, router]); // Added router to dependencies

  // Effect to fetch user profile on client mount or pathname change
  // This is crucial for reacting to navigation events after login/logout
  useEffect(() => {
    if (isClient) {
      fetchUserProfile();
    }
  }, [isClient, pathname, fetchUserProfile]); // Added pathname to dependencies

  return (
    <UserContext.Provider value={{ user, isLoadingUser, fetchUserProfile, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};