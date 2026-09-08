import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded route components for code-splitting
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Builder = lazy(() => import('./pages/Builder'));
const Billing = lazy(() => import('./pages/Billing'));
const BillingDetails = lazy(() => import('./pages/BillingDetails'));
const CoverLetter = lazy(() => import('./pages/CoverLetter'));
const Contact = lazy(() => import('./pages/Contact'));

// Lightweight accessible loading fallback for lazy-loaded routes
const RouteFallback = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
    <div
      role="status"
      aria-label="Loading page"
      className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"
    />
  </div>
);

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <Router>
        <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/contact" element={<Contact />} />

        {/* Protected SaaS Core Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builder/:id"
          element={
            <ProtectedRoute>
              <Builder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/billing/details"
          element={
            <ProtectedRoute>
              <BillingDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cover-letter"
          element={
            <ProtectedRoute>
              <CoverLetter />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Landing />} />
      </Routes>
    </Suspense>
  </Router>
</MotionConfig>
  );
}

export default App;
