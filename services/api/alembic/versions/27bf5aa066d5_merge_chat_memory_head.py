"""merge chat memory head

Revision ID: 27bf5aa066d5
Revises: 475f921684dc, b8f3f77f91aa
Create Date: 2026-03-12 21:15:28.889138

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '27bf5aa066d5'
down_revision: Union[str, Sequence[str], None] = ('475f921684dc', 'b8f3f77f91aa')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
