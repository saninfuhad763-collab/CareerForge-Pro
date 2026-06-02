import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Debounce timer helper
let saveTimeout = null;

export const useResumeStore = create((set, get) => ({
  resumes: [],
  currentResume: null,
  loading: false,
  saving: false,
  error: null,
  autoSaveEnabled: true,
  hasUnsavedChanges: false,

  // Get authorization headers helper
  getHeaders: () => {
    const token = localStorage.getItem('cf_token');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  },

  // Actions
  loadResumes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/resumes`, {
        method: 'GET',
        headers: get().getHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load resumes');
      }

      set({ resumes: data.data, loading: false });
    } catch (error) {
      set({ loading: false, error: error.message });
    }
  },

  loadResumeById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/resumes/${id}`, {
        method: 'GET',
        headers: get().getHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load resume details');
      }

      set({ currentResume: data.data, loading: false });
      return data.data;
    } catch (error) {
      set({ loading: false, error: error.message });
      return null;
    }
  },

  createResume: async (title, templateId = 'modern') => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/resumes`, {
        method: 'POST',
        headers: get().getHeaders(),
        body: JSON.stringify({ title, templateId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create resume');
      }

      set((state) => ({
        resumes: [data.data, ...state.resumes],
        currentResume: data.data,
        loading: false,
      }));
      return data.data;
    } catch (error) {
      set({ loading: false, error: error.message });
      return null;
    }
  },

  // Optimistically update the UI and queue a debounced save to the backend
  updateResumeLocal: (updatedFields) => {
    const { currentResume, autoSaveEnabled } = get();
    if (!currentResume) return;

    // Create a new merged state structure optimistically
    const mergedResume = {
      ...currentResume,
      ...updatedFields,
    };

    if (!autoSaveEnabled) {
      set({ currentResume: mergedResume, hasUnsavedChanges: true });
      return;
    }

    set({ currentResume: mergedResume, saving: true });

    // Clear existing save timer and schedule new one
    if (saveTimeout) clearTimeout(saveTimeout);

    saveTimeout = setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/resumes/${mergedResume._id}`, {
          method: 'PUT',
          headers: get().getHeaders(),
          body: JSON.stringify(mergedResume),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to auto-save to backend');
        }

        const latestResume = get().currentResume;
        if (latestResume && latestResume._id === data.data._id) {
          set({
            currentResume: {
              ...data.data,
              ...latestResume,
              atsScore: data.data.atsScore !== undefined ? data.data.atsScore : latestResume.atsScore,
            },
            saving: false,
            error: null,
          });
        } else {
          set({ saving: false, error: null });
        }
      } catch (error) {
        console.error('[Auto-save Error] Failed to persist data:', error.message);
        set({ saving: false, error: 'Auto-save failed. Check connection.' });
      }
    }, 1500); // 1.5-second debounce window
  },

  // Save changes immediately (e.g. when exiting editor or templates switch)
  saveResumeImmediately: async () => {
    const { currentResume } = get();
    if (!currentResume) return;

    if (saveTimeout) clearTimeout(saveTimeout);
    set({ saving: true });

    try {
      const response = await fetch(`${API_URL}/resumes/${currentResume._id}`, {
        method: 'PUT',
        headers: get().getHeaders(),
        body: JSON.stringify(currentResume),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save immediately');
      }

      const latestResume = get().currentResume;
      if (latestResume && latestResume._id === data.data._id) {
        set({
          currentResume: {
            ...data.data,
            ...latestResume,
            atsScore: data.data.atsScore !== undefined ? data.data.atsScore : latestResume.atsScore,
          },
          saving: false,
          hasUnsavedChanges: false,
          error: null,
        });
      } else {
        set({ saving: false, hasUnsavedChanges: false, error: null });
      }
      return true;
    } catch (error) {
      set({ saving: false, error: error.message });
      return false;
    }
  },

  setAutoSaveEnabled: (enabled) => {
    if (!enabled && saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    set({ autoSaveEnabled: enabled });
  },

  deleteResume: async (id) => {
    set({ error: null });
    try {
      const response = await fetch(`${API_URL}/resumes/${id}`, {
        method: 'DELETE',
        headers: get().getHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete resume');
      }

      set((state) => ({
        resumes: state.resumes.filter((r) => r._id !== id),
        currentResume: state.currentResume?._id === id ? null : state.currentResume,
      }));
      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },

  clearCurrentResume: () => set({ currentResume: null }),
}));
