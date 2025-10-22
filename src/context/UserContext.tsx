/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { ProfileDTO } from '../types/api';
import { userService } from '../services/api/UserService';
import { useAuth } from './AuthContext'; // Import useAuth

interface UserContextType {
  profile: ProfileDTO | null;
  loading: boolean;
  error: string | null;
  updateProfile: (newProfile: Partial<ProfileDTO>) => Promise<void>;
  retryLoadProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Removed mockProfile as per user request.

const RETRY_DELAY = 2000;
const MAX_RETRIES = 3;

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading: authLoading } = useAuth(); // Get auth state
  const [profile, setProfile] = useState<ProfileDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadProfile = async (isRetry = false) => {
    if (!isAuthenticated) {
      setLoading(false);
      return; // Don't fetch if not authenticated
    }

    try {
      setLoading(true);
      setError(null);
      const data = await userService.getProfile();
      setProfile(data);
      setRetryCount(0);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Unknown error');
      console.error('Failed to load profile:', message);
      if (retryCount < MAX_RETRIES && !isRetry) {
        console.warn(`Retrying profile load... Attempt ${retryCount + 1}/${MAX_RETRIES}`);
        setTimeout(() => loadProfile(true), RETRY_DELAY);
        setRetryCount(prev => prev + 1);
      } else {
        // Removed API FALLBACK to mock user profile as per user request.
        setError('Không thể tải hồ sơ người dùng. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Wait for auth loading to finish before deciding to fetch profile
    if (!authLoading) {
      loadProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const updateProfile = async (newProfile: Partial<ProfileDTO>) => {
    if (!profile) throw new Error("Không có hồ sơ để cập nhật.");

    const oldProfile = profile;
    // Optimistic update
    setProfile(prev => ({ ...prev!, ...newProfile }));

    try {
      const updatedProfile = await userService.updateProfile(newProfile);
      setProfile(updatedProfile); // Sync with server response
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Unknown error');
      console.error('Failed to update profile:', message);
      setProfile(oldProfile); // Revert on error
      setError('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
    }
  };

  const retryLoadProfile = async () => {
    setRetryCount(0);
    await loadProfile();
  };

  return (
    <UserContext.Provider value={{
      profile,
      loading: loading || authLoading, // Combine loading states
      error,
      updateProfile,
      retryLoadProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
