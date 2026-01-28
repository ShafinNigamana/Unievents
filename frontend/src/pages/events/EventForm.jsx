import Layout from "../../components/layout/Layout";

export default function EventForm() {
  return (
    <Layout>
      <h1 className="mb-6">Create Event</h1>

      <form className="max-w-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-6 shadow-md space-y-5">
        <div>
          <label>Event Name</label>
          <input
            className="w-full mt-1 border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-700"
          />
        </div>

        <div>
          <label>Date</label>
          <input
            type="date"
            className="w-full mt-1 border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-700"
          />
        </div>

        <button className="px-4 py-2 bg-indigo-700 text-white text-sm font-medium rounded-md hover:bg-indigo-800">
          Save Event
        </button>
      </form>
    </Layout>
  );
}
