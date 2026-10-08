"""FastAPI application entrypoint (ARCH-005)."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, trading, waitlist
from app.core.config import get_settings
from app.db import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    lifespan=lifespan,
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(waitlist.router, prefix=API_PREFIX)
app.include_router(trading.router, prefix=API_PREFIX)


@app.get("/api/v1/health", tags=["meta"])
def health_v1():
    """Render health-check path."""
    return {"status": "ok"}


@app.get("/health", tags=["meta"])
def health():
    return {"status": "ok", "service": settings.app_name, "version": settings.version}
