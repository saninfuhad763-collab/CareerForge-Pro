import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getInitialState = () => {
  const token = localStorage.getItem('cf_token');
  const userJson = localStorage.getItem('cf_user');
  let user = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (e) {
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
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
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
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
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

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error('Session expired');
      }

      localStorage.setItem('cf_user', JSON.stringify(data.data));
      set({ user: data.data, isAuthenticated: true, error: null });
    } catch (error) {
      console.warn('[Check Auth Error] Session is invalid, logging out:', error.message);
      get().logout();
    }
  },

  upgradePlan: async () => {
    const { token } = get();
    if (!token) return { success: false, error: 'Not authenticated' };

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/auth/upgrade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Upgrade failed');
      }

      localStorage.setItem('cf_user', JSON.stringify(data.data));
      set({ user: data.data, loading: false, error: null });
      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  clearError: () => set({ error: null }),
}));
