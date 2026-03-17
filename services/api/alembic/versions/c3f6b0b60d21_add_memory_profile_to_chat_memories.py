"""Add memory_profile to chat_memories

Revision ID: c3f6b0b60d21
Revises: 27bf5aa066d5
Create Date: 2026-03-12 22:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'c3f6b0b60d21'
down_revision: Union[str, Sequence[str], None] = '27bf5aa066d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'chat_memories',
        sa.Column(
            'memory_profile',
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('chat_memories', 'memory_profile')