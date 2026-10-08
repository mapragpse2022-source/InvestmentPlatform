"""Application configuration (ARCH-005: 12-factor, env-driven)."""
from functools import lru_cache

from pydantic import ConfigDict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Dastyar Trade API"
    version: str = "0.1.0"
    debug: bool = False

    # Security — override SECRET_KEY in production!
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 24  # 24h
    algorithm: str = "HS256"

    # Database (SQLite by default; swap to Postgres via DATABASE_URL)
    database_url: str = "sqlite:///./dastyar.db"

    # CORS — frontend origins. Overridable via env ALLOWED_ORIGINS
    # (comma-separated, e.g. on Render dashboard).
    allowed_origins: str | None = None

    @property
    def cors_origins(self) -> list[str]:
        if self.allowed_origins:
            return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]
        return [
            "http://localhost:8080",
            "http://127.0.0.1:8080",
            "https://mapragpse2022-source.github.io",
        ]


@lru_cache
def get_settings() -> Settings:
    return Settings()
