import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from controllers.admin_controller import router as admin_router
from controllers.auth_controller import router as auth_router
from controllers.content_controller import router as content_router

load_dotenv()

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://localhost:8081")

app = FastAPI(title="Content Publishing Gateway", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "springBoot": SPRING_BOOT_URL, "version": "2.0.0"}


app.include_router(auth_router)
app.include_router(content_router)
app.include_router(admin_router)
