from fastapi import APIRouter, Depends

from controllers import (
    RoleUpdateRequest,
    SignInRequest,
    SignUpRequest,
    current_user,
    require_admin,
    spring_request,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
async def signup(request: SignUpRequest):
    """Register a new user with an optional role (default: EDITOR)."""
    return await spring_request(
        "POST", "/api/users/register", json=request.model_dump()
    )


@router.post("/signin")
async def signin(request: SignInRequest):
    return await spring_request(
        "POST", "/api/users/authenticate", json=request.model_dump()
    )


@router.get("/me")
async def me(user: dict = Depends(current_user)):
    return user
