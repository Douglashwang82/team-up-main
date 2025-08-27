from dataclasses import dataclass
import os

@dataclass
class Settings:
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/sportsmeet",
    )
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change_me")
    JWT_ACCESS_TTL: int = int(os.getenv("JWT_ACCESS_TTL", "3600"))
    JWT_REFRESH_TTL: int = int(os.getenv("JWT_REFRESH_TTL", "2592000"))
    DEBUG: bool = os.getenv("FLASK_DEBUG", "1") == "1"

settings = Settings()
