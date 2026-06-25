import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Debounce timer helper
let saveTimeout = null;

// Ignore stale loadResumeById responses (navigation / StrictMode double-fetch races)
let loadResumeRequestSeq = 0;

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

  invalidatePendingResumeLoads: () => {
    loadResumeRequestSeq += 1;
  },

  loadResumeById: async (id) => {
    const requestSeq = ++loadResumeRequestSeq;
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/resumes/${id}`, {
        method: 'GET',
        headers: get().getHeaders(),
      });

      const data = await response.json();

      if (requestSeq !== loadResumeRequestSeq) {
        return null;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load resume details');
      }

      set({ currentResume: data.data, loading: false });
      return data.data;
    } catch (error) {
      if (requestSeq !== loadResumeRequestSeq) {
        return null;
      }
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

    // Always track unsaved changes even during debounce
    set({ currentResume: mergedResume, saving: true, hasUnsavedChanges: true });

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
          // Backend atsMetadata always wins — merge explicitly to protect all ATS history fields
          const backendAts = data.data.atsMetadata || {};
          const localAts = latestResume.atsMetadata || {};
          const mergedAts = {
            ...localAts,
            ...backendAts,
            // Explicit field guards: protect each ATS history field individually
            score:            backendAts.score            !== undefined ? backendAts.score            : localAts.score,
            initialScore:     backendAts.initialScore     !== undefined ? backendAts.initialScore     : localAts.initialScore,
            optimizedScore:   backendAts.optimizedScore   !== undefined ? backendAts.optimizedScore   : localAts.optimizedScore,
            scoreImprovement: backendAts.scoreImprovement !== undefined ? backendAts.scoreImprovement : localAts.scoreImprovement,
            lastJdHash:       backendAts.lastJdHash       !== undefined ? backendAts.lastJdHash       : localAts.lastJdHash,
          };
          set({
            currentResume: {
              ...latestResume,
              ...data.data,
              atsMetadata: mergedAts,
              atsScore: data.data.atsScore !== undefined ? data.data.atsScore : latestResume.atsScore,
            },
            saving: false,
            hasUnsavedChanges: false,
            error: null,
          });
        } else {
          set({ saving: false, hasUnsavedChanges: false, error: null });
        }
      } catch (error) {
        console.error('[Auto-save Error] Failed to persist data:', error.message);
        set({ saving: false, error: 'Auto-save failed. Check connection.' });
      }
    }, 1500); // 1.5-second debounce window
  },

  // Save changes immediately (e.g. when exiting editor or templates switch)
  saveResumeImmediately: async () => {
    if (saveTimeout) clearTimeout(saveTimeout);

    const resumeToSave = get().currentResume;
    if (!resumeToSave) return false;

    set({ saving: true });

    try {
      const response = await fetch(`${API_URL}/resumes/${resumeToSave._id}`, {
        method: 'PUT',
        headers: get().getHeaders(),
        body: JSON.stringify(resumeToSave),
        keepalive: true // Ensure save completes even if page is closing
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to save immediately');
      }

      const latestResume = get().currentResume;
      if (latestResume && latestResume._id === data.data._id) {
        // Backend atsMetadata always wins — merge explicitly to protect all ATS history fields
        const backendAts = data.data.atsMetadata || {};
        const localAts = latestResume.atsMetadata || {};
        const mergedAts = {
          ...localAts,
          ...backendAts,
          // Explicit field guards: protect each ATS history field individually
          score:            backendAts.score            !== undefined ? backendAts.score            : localAts.score,
          initialScore:     backendAts.initialScore     !== undefined ? backendAts.initialScore     : localAts.initialScore,
          optimizedScore:   backendAts.optimizedScore   !== undefined ? backendAts.optimizedScore   : localAts.optimizedScore,
          scoreImprovement: backendAts.scoreImprovement !== undefined ? backendAts.scoreImprovement : localAts.scoreImprovement,
          lastJdHash:       backendAts.lastJdHash       !== undefined ? backendAts.lastJdHash       : localAts.lastJdHash,
        };
        set({
          currentResume: {
            ...latestResume,
            ...data.data,
            atsMetadata: mergedAts,
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

  exportResumePdf: async (id, title = 'resume') => {
    try {
      const token = localStorage.getItem('cf_token');
      const response = await fetch(`${API_URL}/resumes/${id}/export-pdf`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = 'Failed to export PDF';
        try {
          const data = await response.json();
          message = data.message || message;
        } catch {
          message = `PDF export failed (HTTP ${response.status})`;
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const safeTitle = title.replace(/[^a-z0-9-_ ]/gi, '').trim().replace(/\s+/g, '-') || 'resume';
      anchor.href = url;
      anchor.download = `${safeTitle}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      set({ error: error.message });
      return false;
    }
  },

  clearCurrentResume: () => set({ currentResume: null }),
}));
