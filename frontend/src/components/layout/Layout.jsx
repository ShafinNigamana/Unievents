import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface-900 transition-colors flex flex-col">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand-700/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-purple-700/8 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-brand-600/8 blur-3xl" />
      </div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 border-b border-transparent">
        {children}
      </main>

      <Footer />
    </div>
  );
}
