import Layout from "../../components/layout/Layout";
import { Calendar, Users } from "lucide-react";

export default function Dashboard() {
  return (
    <Layout>
      <h1 className="mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
            <h2>Total Events</h2>
          </div>

          <p>
            View and manage all university events in one place.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
            <h2>Participants</h2>
          </div>

          <p>
            Overview of students registered across events.
          </p>
        </div>
      </div>
    </Layout>
  );
}
