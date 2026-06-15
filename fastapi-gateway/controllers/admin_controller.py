from fastapi import APIRouter, Depends

from controllers import RoleUpdateRequest, current_user, require_admin, spring_request

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(user: dict = Depends(current_user)):
    """List all users — ADMIN only."""
    require_admin(user)
    return await spring_request("GET", "/api/admin/users")


@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    request: RoleUpdateRequest,
    user: dict = Depends(current_user)
):
    """Change a user's role — ADMIN only."""
    require_admin(user)
    return await spring_request(
        "PUT", f"/api/admin/users/{user_id}/role",
        json=request.model_dump()
    )
