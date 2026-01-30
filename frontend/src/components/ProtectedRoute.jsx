import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const auth = useAuth();

  if (!auth) return null;

  const { isAuthenticated, loading, user } = auth;

  if (loading) return null;

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard
    if (user.role === "student") {
      return <Navigate to="/dashboard/student" replace />;
    }
    if (user.role === "organizer") {
      return <Navigate to="/dashboard/organizer" replace />;
    }
    if (user.role === "admin") {
      return <Navigate to="/dashboard/admin" replace />;
    }
  }

  return children;
}
