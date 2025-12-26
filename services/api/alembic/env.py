# services/api/alembic/env.py
import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool
# ---- 讓 "app" 可被匯入（alembic/ 的上一層是 services/api）----
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# ---- 匯入 Base 與所有模型（確保 mapper 都被註冊到 Base.metadata）----
from app.core.db import Base  # ← 你的 Base = declarative_base()
# Import all models to register them with Base.metadata
from app.models import user, venue, booking, event, event_join_request, event_participant, ticket, notification  # noqa: F401

# ---- Alembic 既有設定 ----
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 目標 metadata（給 autogenerate 用）
target_metadata = Base.metadata

def get_url() -> str:
    """
    取得資料庫連線字串優先序：
    1) alembic.ini 的 sqlalchemy.url（若有）
    2) 環境變數 DATABASE_URL（Docker Compose/.env）
    3) 預設 sqlite（三擇一）
    """
    url = config.get_main_option("sqlalchemy.url")
    if not url:
        url = os.getenv("DATABASE_URL", "sqlite:///app.db")
    return url


from alembic.autogenerate import renderers
from geoalchemy2 import Geography


# --- add this helper ---
def include_object(obj, name, type_, reflected, compare_to):
    """
    Return False to exclude PostGIS extension objects from autogenerate.
    We skip Tiger/Topology schemas so Alembic won't try to drop/alter them.
    """
    schema = getattr(obj, "schema", None)
    if schema in {"tiger", "tiger_data", "topology"}:
        return False
    return True


@renderers.dispatch_for(Geography)
def render_geography(type_, autogen_context):
    """告訴 Alembic 遇到 Geography 時要怎麼輸出"""
    # 確保會在 migration 檔案最上面自動加 import
    autogen_context.imports.add("from geoalchemy2 import Geography")
    # 輸出的程式碼字串
    return f"Geography(geometry_type='{type_.geometry_type}', srid={type_.srid})"


def run_migrations_offline() -> None:
    """Offline 模式：不建立連線，直接產出 SQL。"""
    context.configure(
        url=get_url(),
        target_metadata=target_metadata,
        include_object=include_object,        # ← add this
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Online 模式：建立連線並執行遷移。"""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        url=get_url(),  # 直接把連線字串餵進來
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            include_object=include_object,        # ← add this
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
