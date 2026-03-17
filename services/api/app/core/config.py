from dataclasses import dataclass
import os

def get_database_url() -> str:
    """Get database URL and ensure it uses the correct driver for psycopg2."""
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/sportsmeet")

    # Railway provides postgresql:// URLs, but SQLAlchemy with psycopg2 needs postgresql://
    # If URL starts with postgres:// (not postgresql://), replace it
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    print('db_url: ' + db_url)
    return db_url

@dataclass
class Settings:
    DATABASE_URL: str = get_database_url()
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change_me")
    JWT_ACCESS_TTL: int = int(os.getenv("JWT_ACCESS_TTL", "2592000"))
    JWT_REFRESH_TTL: int = int(os.getenv("JWT_REFRESH_TTL", "2592000"))
    DEBUG: bool = os.getenv("FLASK_DEBUG", "1") == "1"
    LINE_CHANNEL_SECRET: str = os.getenv("LINE_CHANNEL_SECRET", "")
    LINE_CHANNEL_ACCESS_TOKEN: str = os.getenv("LINE_CHANNEL_ACCESS_TOKEN", "")

settings = Settings()
