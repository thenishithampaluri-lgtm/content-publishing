import React from "react";
import { FileText } from "lucide-react";

const ROLES = [
{ value: "ADMIN", icon: "🛡️", name: "Admin", desc: "Full access" },
{ value: "EDITOR", icon: "✏️", name: "Editor", desc: "Create & publish" },
{ value: "VIEWER", icon: "👁️", name: "Viewer", desc: "Read only" }
];

export default function AuthForm({
mode,
values,
onChange,
onSubmit,
loading,
error,
onRoleSelect
}) {
const isSignup = mode === "signup";

return ( <main className="auth-screen"> <section className="auth-panel"> <div className="auth-brand"> <div className="auth-brand-icon"> <FileText size={20} /> </div> <div> <strong>ContentFlow</strong> <span>Publishing Platform</span> </div> </div>

```
    <p className="eyebrow">
      {isSignup ? "Get started" : "Welcome back"}
    </p>

    <h1>
      {isSignup
        ? "Create your account"
        : "Sign in to your workspace"}
    </h1>

    {error && <div className="error-msg">{error}</div>}

    <form onSubmit={onSubmit}>
      {isSignup && (
        <label>
          Full Name
          <input
            name="name"
            value={values.name || ""}
            onChange={onChange}
            required
          />
        </label>
      )}

      <label>
        Email
        <input
          name="email"
          type="email"
          value={values.email || ""}
          onChange={onChange}
          required
        />
      </label>

      <label>
        Password
        <input
          name="password"
          type="password"
          value={values.password || ""}
          onChange={onChange}
          required
        />
      </label>

      <label>
        Role
        <div className="role-grid">
          {ROLES.map((r) => (
            <div
              key={r.value}
              className={`role-card${
                values.role === r.value ? " selected" : ""
              }`}
              onClick={() =>
                onRoleSelect && onRoleSelect(r.value)
              }
            >
              <div className="role-card-icon">{r.icon}</div>
              <div className="role-card-name">{r.name}</div>
              <div className="role-card-desc">{r.desc}</div>
            </div>
          ))}
        </div>

        <input
          type="hidden"
          name="role"
          value={values.role || ""}
        />
      </label>

      <button
        className="primary-button"
        type="submit"
        disabled={loading}
      >
        {loading
          ? "Please wait..."
          : isSignup
          ? "Create Account"
          : "Sign In"}
      </button>
    </form>

    <p className="auth-link">
      {isSignup
        ? "Already have an account?"
        : "Need an account?"}{" "}
      <a href={isSignup ? "/signin" : "/signup"}>
        {isSignup ? "Sign In" : "Sign Up"}
      </a>
    </p>
  </section>
</main>

);
}
