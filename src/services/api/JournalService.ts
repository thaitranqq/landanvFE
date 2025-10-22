import { apiService } from './ApiService';
import { API_ENDPOINTS } from './ApiConfig';
import type { JournalEntry, JournalEntryCreateRequest, JournalPhoto } from '../../types/api';

class JournalService {
  // Fetches all journal entries for a given user. Requires authentication.
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    const response = await apiService.get<JournalEntry[]>(
      `${API_ENDPOINTS.JOURNAL.ENTRIES}/user/${userId}`
    );
    return response.data || [];
  }

  // Creates a new text-based journal entry. Requires authentication.
  async createJournalEntry(entry: JournalEntryCreateRequest): Promise<JournalEntry> {
    const response = await apiService.post<JournalEntry>(API_ENDPOINTS.JOURNAL.ENTRIES, entry);
    return response.data!;
  }

  // Deletes a journal entry by its ID. Requires authentication.
  async deleteJournalEntry(entryId: number): Promise<void> {
    await apiService.delete(`${API_ENDPOINTS.JOURNAL.ENTRIES}/${entryId}`);
  }

  // Uploads a photo for a specific journal entry. Requires authentication.
  async uploadPhoto(entryId: number, imageFile: File): Promise<JournalPhoto> {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await apiService.post<JournalPhoto>(
      `${API_ENDPOINTS.JOURNAL.ENTRIES}/${entryId}/photos`,
      formData
    );
    return response.data!;
  }
}

export const journalService = new JournalService();
