import React, { useState } from "react";
import { api, saveSession } from "../api";
import AuthForm from "../components/AuthForm.jsx";

export default function SignIn() {
  const [values, setValues] = useState({
    email: "",
    password: "",
    role: "EDITOR"
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(event) {
    setValues({
      ...values,
      [event.target.name]: event.target.value
    });
  }

  function onRoleSelect(role) {
    setValues((prev) => ({
      ...prev,
      role
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const session = await api("/api/users/authenticate", {
        method: "POST",
        body: JSON.stringify(values)
      });

      saveSession(session.token, session.user);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthForm
      mode="signin"
      values={values}
      onChange={onChange}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      onRoleSelect={onRoleSelect}
    />
  );
}