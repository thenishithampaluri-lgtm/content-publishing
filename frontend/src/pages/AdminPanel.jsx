import React, { useEffect, useState } from "react";
import { ShieldCheck, Users } from "lucide-react";
import { api, isAdmin } from "../api";

const ROLES = ["VIEWER", "EDITOR", "ADMIN"];

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  if (!isAdmin()) {
    return (
      <div className="access-denied">
        <h2>🛡️ Admin Only</h2>
        <p>You need <strong>Admin</strong> privileges to access User Management.</p>
        <a href="/" className="primary-button compact" style={{ marginTop: 16, display: "inline-flex" }}>
          Go to Workspace
        </a>
      </div>
    );
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    api("/admin/users")
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  async function changeRole(userId, newRole) {
    try {
      await api(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole })
      });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      showToast("Role updated successfully");
    } catch (err) {
      showToast(err.message || "Failed to update role", "error");
    }
  }

  return (
    <section>
      {toast && (
        <div className="toast-wrap">
          <div className={`toast ${toast.type}`}>{toast.msg}</div>
        </div>
      )}

      <div className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1><Users size={24} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }} />User Management</h1>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /> Loading users…</div>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "linear-gradient(135deg,var(--brand-500),var(--purple-600))",
                        display: "grid", placeItems: "center",
                        fontSize: ".75rem", fontWeight: 800, color: "#fff", flexShrink: 0
                      }}>
                        {u.name?.slice(0, 2).toUpperCase()}
                      </div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ color: "var(--slate-500)" }}>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role?.toLowerCase()}`}>
                      {u.role === "ADMIN" && <ShieldCheck size={10} />}
                      {u.role}
                    </span>
                  </td>
                  <td style={{ color: "var(--slate-500)", fontSize: ".8rem" }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      style={{ fontSize: ".82rem" }}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
