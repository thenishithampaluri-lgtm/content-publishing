from fastapi import APIRouter, Depends, Query

from controllers import ContentRequest, current_user, require_editor, spring_request

router = APIRouter(prefix="/content", tags=["content"])


@router.get("/search")
async def search_content(
    q: str = Query(default=""),
    status_filter: str = Query(default="ALL", alias="status"),
    user: dict = Depends(current_user),
):
    """All authenticated users can search their own content."""
    return await spring_request(
        "GET", "/api/content/search",
        user_id=user["id"],
        params={"q": q, "status": status_filter}
    )


@router.get("/published")
async def published_content(user: dict = Depends(current_user)):
    """All authenticated users can view published content."""
    return await spring_request("GET", "/api/content/published")


@router.get("/{content_id}")
async def get_content(content_id: int, user: dict = Depends(current_user)):
    return await spring_request("GET", f"/api/content/{content_id}", user_id=user["id"])


@router.get("/{content_id}/versions")
async def get_versions(content_id: int, user: dict = Depends(current_user)):
    return await spring_request(
        "GET", f"/api/content/{content_id}/versions", user_id=user["id"]
    )


# ── Write operations — EDITOR or ADMIN only ───────────────────────────

@router.post("/draft")
async def create_draft(request: ContentRequest, user: dict = Depends(current_user)):
    require_editor(user)
    return await spring_request(
        "POST", "/api/content/draft",
        json=request.model_dump(), user_id=user["id"]
    )


@router.put("/{content_id}/draft")
async def update_draft(
    content_id: int,
    request: ContentRequest,
    user: dict = Depends(current_user)
):
    require_editor(user)
    return await spring_request(
        "PUT", f"/api/content/{content_id}/draft",
        json=request.model_dump(), user_id=user["id"]
    )


@router.post("/publish")
async def create_and_publish(request: ContentRequest, user: dict = Depends(current_user)):
    """Create a new piece of content and immediately publish it."""
    require_editor(user)
    return await spring_request(
        "POST", "/api/content/publish",
        json=request.model_dump(), user_id=user["id"]
    )


@router.put("/{content_id}/publish")
async def publish_existing(
    content_id: int,
    request: ContentRequest,
    user: dict = Depends(current_user)
):
    """Update an existing draft and publish it — FIX: was missing role check and had routing bug."""
    require_editor(user)
    return await spring_request(
        "PUT", f"/api/content/{content_id}/publish",
        json=request.model_dump(), user_id=user["id"]
    )
