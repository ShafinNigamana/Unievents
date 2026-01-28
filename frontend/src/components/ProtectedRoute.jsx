import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const auth = useAuth();

  if (!auth) return null;

  const { isAuthenticated, loading } = auth;

  // Wait until auth state is restored
  if (loading) {
    return null;
  }

  // Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in
  return children;
}
