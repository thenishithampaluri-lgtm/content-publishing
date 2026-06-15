const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8081";

export function getToken() {
  return localStorage.getItem("content_token");
}

export function saveSession(token, user) {
  localStorage.setItem("content_token", token);
  localStorage.setItem("content_user", JSON.stringify(user));
}

export function getUser() {
  const raw = localStorage.getItem("content_user");
  return raw ? JSON.parse(raw) : null;
}

export function getRole() {
  const user = getUser();
  return user?.role || "VIEWER";
}

export function isAdmin() {
  return getRole() === "ADMIN";
}

export function isEditor() {
  const role = getRole();
  return role === "ADMIN" || role === "EDITOR";
}

export function clearSession() {
  localStorage.removeItem("content_token");
  localStorage.removeItem("content_user");
}

export async function api(path, options = {}) {
  const token = getToken();
  const user = getUser();

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}),

      ...(user?.id
        ? {
            "X-User-Id": String(user.id)
          }
        : {}),

      ...(options.headers || {})
    }
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.message ||
      data?.error ||
      `HTTP ${response.status}`
    );
  }

  return data;
}