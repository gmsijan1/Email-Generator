// Main App Component - Sets up routing and authentication
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Import page components
import LoginPage from "./pages/LoginPage";
import RegistrationPage from "./pages/RegistrationPage";
import DashboardPage from "./pages/DashboardPage";
import DraftFormPage from "./pages/DraftFormPage";
import DraftDetailPage from "./pages/DraftDetailPage";
import LandingPage from "./pages/LandingPage";

import "./App.css";

/**
 * Main Application Component
 * Sets up routing and authentication context
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />

          {/* Protected Routes - Require Authentication */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/draft/new"
            element={
              <PrivateRoute>
                <DraftFormPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/draft/:id"
            element={
              <PrivateRoute>
                <DraftDetailPage />
              </PrivateRoute>
            }
          />

          {/* 404 Route - Redirect to Landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
