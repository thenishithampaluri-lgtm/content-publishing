# ContentFlow — Upgrade Notes

## What Was Fixed & Added

### 🐛 Bug Fix: Publish Button Not Working

**Root cause:** The `PUT /{id}/publish` FastAPI route was calling Spring Boot correctly, but the `current_user` dependency was validating the token without passing `user_id` to the Spring header. Also, the frontend `publish()` function didn't handle errors visually — it threw silently.

**Fixes applied:**
- `content_controller.py` — `publish_existing` now passes `user_id=user["id"]` to Spring Boot
- `Editor.jsx` — `publish()` now has try/catch with toast notifications + loading state
- `Editor.jsx` — validates that title is non-empty before calling publish
- `Published.jsx` — `/content/published` no longer requires `user_id` in Spring (it's public within auth)

---

### 🔐 Role-Based Login System

Three roles are now supported:

| Role   | Permissions |
|--------|-------------|
| ADMIN  | Everything — user management, create, publish |
| EDITOR | Create drafts, publish content |
| VIEWER | Read-only — workspace + published articles |

**Changes:**

**Backend — Spring Boot:**
- `AppUser.java` — added `role` enum field (`VIEWER / EDITOR / ADMIN`), stored as string
- `AuthDtos.java` — `RegisterRequest` now includes optional `role`; `UserResponse` now returns `role`
- `UserService.java` — `register()` reads and saves the role; `listAllUsers()` and `updateRole()` added
- `AdminController.java` _(new)_ — `GET /api/admin/users` and `PUT /api/admin/users/{id}/role`

**Backend — FastAPI Gateway:**
- `controllers/__init__.py` — added `require_editor()` and `require_admin()` helpers
- `content_controller.py` — write endpoints (`draft`, `publish`) now call `require_editor()`
- `admin_controller.py` _(new)_ — proxies admin endpoints, enforces `require_admin()`
- `auth_controller.py` — signup passes `role` field through to Spring Boot
- `main.py` — registers the new `admin_router`

**Frontend:**
- `api.js` — added `getRole()`, `isAdmin()`, `isEditor()` helpers
- `AuthForm.jsx` — signup now shows a role picker (card grid: Admin / Editor / Viewer)
- `SignUp.jsx` — passes selected role to the API
- `AppShell.jsx` — sidebar links are role-aware (Viewers don't see "New Draft"; Admins see "User Management")
- `Dashboard.jsx` — "New Draft" button and "Open Editor" links hidden for Viewers
- `Editor.jsx` — shows 403 page for Viewers; Editor/Admin can save & publish
- `AdminPanel.jsx` _(new)_ — table of all users with inline role dropdown

---

### 🎨 New CSS Design System

Complete visual overhaul in `styles.css`:

- Design token system (CSS custom properties for colors, shadows, radii)
- Animated auth screen with subtle dot-grid background
- Gradient sidebar (`--slate-900`) with active-state highlights
- Cards with hover lift effect (`transform: translateY(-2px)`)
- Stats row on Dashboard (Total / Drafts / Published / Topics)
- Monospaced textarea in Editor for comfortable writing
- Toast notifications (green / red, bottom-right)
- Loading spinner component
- Role badge chips (Admin = gold, Editor = blue, Viewer = grey)
- Admin users table
- Fully responsive (mobile sidebar collapses, editor stacks)

---

## How to Run

```bash
# 1. Start PostgreSQL (DB: content_db, user: postgres)

# 2. Spring Boot (port 8081)
cd springboot-backend
./mvnw spring-boot:run

# 3. FastAPI Gateway (port 8000)
cd fastapi-gateway
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 4. Vite Frontend (port 5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — sign up, pick a role, and go!
