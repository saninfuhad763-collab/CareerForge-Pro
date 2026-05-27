import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth, token } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [location.pathname, token, checkAuth]);

  if (!isAuthenticated) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
