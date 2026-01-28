import Layout from "../../components/layout/Layout";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Events() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1>Events</h1>

        <button
          onClick={() => navigate("/events/new")}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-700 text-white rounded-md hover:bg-indigo-800"
        >
          <Plus className="w-4 h-4" />
          Create Event
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-md">
        <div className="p-4 flex justify-between items-center border-b border-slate-300 dark:border-slate-700">
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
      </div>
    </Layout>
  );
}
