"""add_system_user

Revision ID: 1c61bf8f9c34
Revises: 89925f15dd07
Create Date: 2025-12-05 01:22:07.565849

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1c61bf8f9c34'
down_revision: Union[str, Sequence[str], None] = '89925f15dd07'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema - Insert system user for auto-generated events."""
    from datetime import datetime, timezone
    import bcrypt
    
    # System user constants
    SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001'
    SYSTEM_USER_EMAIL = 'system@team-up.internal'
    SYSTEM_USER_DISPLAY_NAME = 'Team-Up Bot'
    
    # Generate a secure password hash (this password should never be used)
    password_hash = bcrypt.hashpw(
        b'SYSTEM_USER_NO_LOGIN_ALLOWED',
        bcrypt.gensalt()
    ).decode('utf-8')
    
    # Insert system user (idempotent - only if not exists)
    op.execute(f"""
        INSERT INTO users (id, email, password_hash, display_name, created_at)
        VALUES (
            '{SYSTEM_USER_ID}',
            '{SYSTEM_USER_EMAIL}',
            '{password_hash}',
            '{SYSTEM_USER_DISPLAY_NAME}',
            '{datetime.now(timezone.utc).isoformat()}'
        )
        ON CONFLICT (email) DO NOTHING;
    """)


def downgrade() -> None:
    """Downgrade schema - Remove system user."""
    SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000001'
    
    # Delete system user
    op.execute(f"""
        DELETE FROM users WHERE id = '{SYSTEM_USER_ID}';
    """)
