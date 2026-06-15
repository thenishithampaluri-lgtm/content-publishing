import os
from typing import Any, Optional

import httpx
from dotenv import load_dotenv
from fastapi import Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

load_dotenv()

SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8081")


# ── Request models ────────────────────────────────────────────────────

class SignUpRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)
    role: Optional[str] = "EDITOR"   # VIEWER | EDITOR | ADMIN


class SignInRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class ContentRequest(BaseModel):
    title: str = Field(min_length=1, max_length=180)
    summary: Optional[str] = Field(default="", max_length=500)
    body: str = Field(default="")
    topics: list[str] = Field(default_factory=list)


class RoleUpdateRequest(BaseModel):
    role: str


# ── HTTP helper ───────────────────────────────────────────────────────

async def spring_request(
    method: str,
    path: str,
    json: Any = None,
    user_id: Optional[int] = None,
    params: dict[str, Any] | None = None,
    authorization: Optional[str] = None,
):
    headers: dict[str, str] = {}
    if user_id is not None:
        headers["X-User-Id"] = str(user_id)
    if authorization is not None:
        headers["Authorization"] = authorization

    async with httpx.AsyncClient(base_url=SPRING_BOOT_URL, timeout=20.0) as client:
        try:
            response = await client.request(
                method, path, json=json, params=params, headers=headers
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Spring Boot service unavailable: {exc}"
            ) from exc

    if response.status_code >= 400:
        detail = response.text
        try:
            payload = response.json()
            detail = payload.get("message") or payload.get("error") or detail
        except ValueError:
            pass
        raise HTTPException(status_code=response.status_code, detail=detail)

    if not response.content:
        return None
    return response.json()


# ── Auth helpers ──────────────────────────────────────────────────────

async def current_user(authorization: str = Header(default="")) -> dict[str, Any]:
    """Validate JWT and return user dict (includes 'role' field)."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token"
        )
    user = await spring_request(
        "POST", "/api/users/validate", authorization=authorization
    )
    return user


def require_editor(user: dict) -> None:
    """Raise 403 if user is not EDITOR or ADMIN."""
    role = user.get("role", "VIEWER")
    if role not in ("EDITOR", "ADMIN"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Editor or Admin role required"
        )


def require_admin(user: dict) -> None:
    """Raise 403 if user is not ADMIN."""
    if user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required"
        )
