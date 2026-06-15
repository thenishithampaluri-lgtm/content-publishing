import React from "react";
import { FileText, LogOut, Newspaper, PenLine, Search, ShieldCheck, Users } from "lucide-react";
import { clearSession, getUser, isAdmin, isEditor } from "../api";

export default function AppShell({ children }) {
  const user = getUser();
  const path = window.location.pathname;
  const role = user?.role || "VIEWER";

  function signOut() {
    clearSession();
    window.location.href = "/signin";
  }

  function activeClass(target) {
    if (target === "/" && path === "/") return "active";
    if (target !== "/" && path.startsWith(target)) return "active";
    return "";
  }

  const initials = user?.name
    ? user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <FileText size={18} color="#fff" />
          </div>
          <div>
            <strong>ContentFlow</strong>
            <span>Publishing Platform</span>
          </div>
        </div>

        {/* Main Nav */}
        <p className="sidebar-section-label">Main</p>
        <nav>
          <a className={activeClass("/")} href="/">
            <Search size={16} /> Workspace
          </a>
          <a className={activeClass("/published")} href="/published">
            <Newspaper size={16} /> Published
          </a>
        </nav>

        {/* Editor-only section */}
        {isEditor() && (
          <>
            <p className="sidebar-section-label">Content</p>
            <nav>
              <a className={activeClass("/editor")} href="/editor">
                <PenLine size={16} /> New Draft
              </a>
            </nav>
          </>
        )}

        {/* Admin-only section */}
        {isAdmin() && (
          <>
            <p className="sidebar-section-label">Admin</p>
            <nav>
              <a className={activeClass("/admin")} href="/admin">
                <Users size={16} /> User Management
              </a>
            </nav>
          </>
        )}

        {/* Footer / profile */}
        <div className="sidebar-footer">
          <div className="profile-block">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-info">
              <strong>{user?.name || "Unknown"}</strong>
              <span className={`role-badge ${role.toLowerCase()}`}>
                {role === "ADMIN" && <ShieldCheck size={10} />}
                {role}
              </span>
            </div>
            <button className="icon-button" onClick={signOut} title="Sign out">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        {children}
      </main>
    </div>
  );
}
