import { Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Landing from "../pages/Landing";

import StudentDashboard from "../pages/dashboard/StudentDashboard";
import OrganizerDashboard from "../pages/dashboard/OrganizerDashboard";
import AdminDashboard from "../pages/dashboard/AdminDashboard";

import Events from "../pages/events/Events";
import EventDetail from "../pages/events/EventDetail";
import EventForm from "../pages/events/EventForm";
import SavedEvents from "../pages/events/savedEvents";
import MyRegistrations from "../pages/events/MyRegistrations";
import StudentProfile from "../pages/student/StudentProfile";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<Landing />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Public Event Pages ── */}
      <Route path="/events" element={<Events />} />
      <Route path="/events/archive" element={<Events archive />} />
      <Route path="/events/:id" element={<EventDetail />} />

      {/* ── Organizer / Admin: Create & Edit ── */}
      <Route
        path="/events/new"
        element={
          <ProtectedRoute allowedRoles={["organizer", "admin"]}>
            <EventForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/events/:id/edit"
        element={
          <ProtectedRoute allowedRoles={["organizer", "admin"]}>
            <EventForm editMode />
          </ProtectedRoute>
        }
      />

      {/* ── Student: Saved Events ── */}
      <Route
        path="/saved-events"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <SavedEvents />
          </ProtectedRoute>
        }
      />

      {/* ── Student: My Registrations ── */}
      <Route
        path="/my-registrations"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <MyRegistrations />
          </ProtectedRoute>
        }
      />

      {/* ── Student: Profile ── */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      {/* ── Dashboards ── */}
      <Route
        path="/dashboard/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/organizer"
        element={
          <ProtectedRoute allowedRoles={["organizer"]}>
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}