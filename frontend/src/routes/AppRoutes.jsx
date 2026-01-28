import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import Events from "../pages/events/Events";
import EventForm from "../pages/events/EventForm";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Core */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/events" element={<Events />} />
      <Route path="/events/new" element={<EventForm />} />
    </Routes>
  );
}
