import Layout from "../../components/layout/Layout";
import { Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function OrganizerDashboard() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1>Organizer Dashboard</h1>

        <button
          onClick={() => navigate("/events/new")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-md hover:bg-indigo-800"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-md">
        <div className="p-4 border-b border-slate-300 dark:border-slate-700 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
          <h2>Your Events</h2>
        </div>

        {/* Static UI placeholder */}
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3>Tech Fest 2026</h3>
              <p>March 15, 2026</p>
            </div>

            <div className="flex gap-4">
              <button aria-label="Edit">
                <Pencil className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-indigo-700" />
              </button>

              <button aria-label="Delete">
                <Trash2 className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-red-700" />
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3>Coding Workshop</h3>
              <p>April 10, 2026</p>
            </div>

            <div className="flex gap-4">
              <button aria-label="Edit">
                <Pencil className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-indigo-700" />
              </button>

              <button aria-label="Delete">
                <Trash2 className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-red-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
