import Layout from "../../components/layout/Layout";
import { Calendar } from "lucide-react";

export default function StudentDashboard() {
  return (
    <Layout>
      <h1 className="mb-6">Student Dashboard</h1>

      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-md">
        <div className="p-4 border-b border-slate-300 dark:border-slate-700 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
          <h2>Available Events</h2>
        </div>

        {/* Static UI placeholder */}
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3>Tech Fest 2026</h3>
              <p>March 15, 2026</p>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h3>Cultural Night</h3>
              <p>April 2, 2026</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
