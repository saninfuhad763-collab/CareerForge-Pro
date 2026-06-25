import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const refineError = (error) => {
  if (error instanceof TypeError || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'Network disconnected. Please check your internet connection.';
    }
    return 'Backend server is unavailable or CORS policy blocked the request.';
  }
  return error.message || 'An unexpected error occurred.';
};

const getInitialState = () => {
  const token = localStorage.getItem('cf_token');
  const userJson = localStorage.getItem('cf_user');
  let user = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (_e) {
      localStorage.removeItem('cf_user');
    }
  }
  return {
    user,
    token,
    isAuthenticated: !!token,
    loading: false,
    error: null,
  };
};

export const useAuthStore = create((set, get) => ({
  ...getInitialState(),

  // Actions
  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      const { token, ...userData } = data.data;
      localStorage.setItem('cf_token', token);
      localStorage.setItem('cf_user', JSON.stringify(userData));

      set({
        user: userData,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const refined = refineError(error);
      set({ loading: false, error: refined });
      return { success: false, error: refined };
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const { token, ...userData } = data.data;
      localStorage.setItem('cf_token', token);
      localStorage.setItem('cf_user', JSON.stringify(userData));

      set({
        user: userData,
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      return { success: true };
    } catch (error) {
      const refined = refineError(error);
      set({ loading: false, error: refined });
      return { success: false, error: refined };
    }
  },

  logout: () => {
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },

  checkAuth: async () => {
    const { token } = get();
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Distinguish specific HTTP auth failures (401 Unauthorized / 403 Forbidden)
      if (response.status === 401 || response.status === 403) {
        throw new Error('AUTH_FAILED');
      }

      // If response is not ok but not an auth failure (e.g. 500/502/503/504), 
      // preserve auth state and fail silently to retry later.
      if (!response.ok) {
        console.warn(`[Check Auth] Temporary server error (${response.status}). Preserving session.`);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('AUTH_FAILED');
      }

      localStorage.setItem('cf_user', JSON.stringify(data.data));
      set({ user: data.data, isAuthenticated: true, error: null });
    } catch (error) {
      // Differentiate between intentional auth failures vs network errors
      if (error.message === 'AUTH_FAILED') {
        console.warn('[Check Auth] Session is invalid or expired. Logging out.');
        get().logout();
      } else {
        // This catches fetch TypeErrors (offline, DNS fail, ECONNREFUSED)
        // Do NOT log out. Preserve unsaved user work and session state.
        console.warn('[Check Auth] Network or unexpected error. Preserving session.', error.message);
      }
    }
  },

  upgradePlan: async () => {
    return get().createCheckoutSession();
  },

  createCheckoutSession: async () => {
    const { token } = get();
    if (!token) return { success: false, error: 'Not authenticated' };

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/billing/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Checkout session creation failed');
      }

      set({ loading: false, error: null });
      return { success: true, url: data.url, sessionId: data.sessionId };
    } catch (error) {
      const refined = refineError(error);
      set({ loading: false, error: refined });
      return { success: false, error: refined };
    }
  },

  getBillingStatus: async () => {
    const { token } = get();
    if (!token) return { success: false, error: 'Not authenticated' };

    try {
      const response = await fetch(`${API_URL}/billing/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to load billing status');
      }

      return { success: true, data: data.data };
    } catch (error) {
      return { success: false, error: refineError(error) };
    }
  },

  cancelSubscription: async () => {
    const { token } = get();
    if (!token) return { success: false, error: 'Not authenticated' };

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/billing/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Subscription cancellation failed');
      }

      set({ loading: false, error: null });
      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      const refined = refineError(error);
      set({ loading: false, error: refined });
      return { success: false, error: refined };
    }
  },

  clearError: () => set({ error: null }),
}));
