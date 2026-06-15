import React, { Component } from "react";
import { getToken } from "./api";
import AppShell from "./components/AppShell.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Editor from "./pages/Editor.jsx";
import Published from "./pages/Published.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{
          minHeight: "100vh", display: "grid", placeItems: "center", padding: 24,
          background: "var(--slate-50)"
        }}>
          <div style={{
            background: "#fff", border: "1px solid var(--slate-200)", borderRadius: 14,
            padding: 40, maxWidth: 480, textAlign: "center", boxShadow: "var(--shadow)"
          }}>
            <p style={{ color: "var(--brand-600)", fontWeight: 800, textTransform: "uppercase", fontSize: ".75rem", letterSpacing: ".06em", marginBottom: 8 }}>
              App Error
            </p>
            <h1 style={{ color: "var(--slate-900)", fontSize: "1.4rem" }}>Something went wrong</h1>
            <p style={{ color: "var(--red-600)", fontWeight: 600 }}>{this.state.error.message}</p>
            <button
              className="primary-button compact"
              onClick={() => window.location.reload()}
              style={{ marginTop: 16 }}
            >
              Reload page
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const path = window.location.pathname;
  const isAuthed = Boolean(getToken());

  function renderPage() {
    if (path === "/signup") return <SignUp />;
    if (path === "/signin") return <SignIn />;
    if (!isAuthed) return <SignIn />;
    if (path === "/editor" || path.startsWith("/editor/")) return <Editor />;
    if (path === "/published") return <Published />;
    if (path === "/admin") return <AdminPanel />;
    return <Dashboard />;
  }

  const publicPage = path === "/signin" || path === "/signup" || !isAuthed;

  return (
    <ErrorBoundary>
      {publicPage ? (
        renderPage()
      ) : (
        <AppShell>{renderPage()}</AppShell>
      )}
    </ErrorBoundary>
  );
}
