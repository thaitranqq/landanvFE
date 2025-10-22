/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, ReactNode, useCallback, useEffect, useContext } from 'react';
import type { JournalEntry, JournalEntryCreateRequest, JournalPhoto } from '../types/api';
import { journalService } from '../services/api/JournalService';
import { useAuth } from './AuthContext';

// Define a more specific type for photos used in the UI
interface UiJournalPhoto {
  id: number;
  url: string;
}

// Define a more specific type for entries used in the UI
interface UiJournalEntry extends Omit<JournalEntry, 'photos'> {
  photos: UiJournalPhoto[];
}

interface JournalContextType {
  entries: UiJournalEntry[];
  loading: boolean;
  error: string | null;
  createJournalEntry: (entry: Omit<JournalEntryCreateRequest, 'userId'>, files: File[]) => Promise<void>;
  deleteJournalEntry: (entryId: number) => Promise<void>;
  refetchEntries: () => void;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [entries, setEntries] = useState<UiJournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setEntries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await journalService.getJournalEntries(user.id);
      
      // Process entries to map API response to UI model
      const processedEntries: UiJournalEntry[] = data.map(entry => ({
        ...entry,
        // The API returns `imageUrl`, but the component expects `url`.
        // Also, the API might return a mix of types, so we ensure consistency.
        photos: entry.photos?.map((photo: any) => ({
          id: photo.id,
          url: photo.imageUrl || photo.url || '' // Use imageUrl, fallback to url or empty string
        })) || []
      }));

      processedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEntries(processedEntries);

    } catch (err) {
      console.error("Failed to fetch journal entries:", err);
      setError("Không thể tải nhật ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createJournalEntry = async (entry: Omit<JournalEntryCreateRequest, 'userId'>, files: File[]) => {
    if (!user?.id) {
      const errMsg = "Không thể tạo ghi chú, người dùng chưa được xác thực.";
      setError(errMsg);
      throw new Error(errMsg);
    }
    try {
      const entryWithUser = { ...entry, userId: user.id };
      const newEntry = await journalService.createJournalEntry(entryWithUser);

      if (files.length > 0) {
        const uploadPromises = files.map(file => journalService.uploadPhoto(newEntry.id, file));
        await Promise.all(uploadPromises);
      }

      await fetchEntries();

    } catch (err) {
      console.error("Failed to create journal entry:", err);
      setError("Không thể tạo ghi chú mới. Vui lòng thử lại.");
      throw err;
    }
  };

  const deleteJournalEntry = async (entryId: number) => {
    try {
      await journalService.deleteJournalEntry(entryId);
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
    } catch (err) {
      console.error(`Failed to delete journal entry ${entryId}:`, err);
      setError("Không thể xóa ghi chú. Vui lòng thử lại.");
    }
  };

  return (
    <JournalContext.Provider value={{
      entries,
      loading,
      error,
      createJournalEntry,
      deleteJournalEntry,
      refetchEntries: fetchEntries
    }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
