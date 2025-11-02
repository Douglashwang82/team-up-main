"""rename_durantion_type_to_duration_type

Revision ID: bf29aa858323
Revises: 4cacfcd4cc65
Create Date: 2025-10-26 23:30:54.187084

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bf29aa858323'
down_revision: Union[str, Sequence[str], None] = '4cacfcd4cc65'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename the column from durantion_type to duration_type (fix typo)
    op.alter_column('teamups', 'durantion_type', new_column_name='duration_type')


def downgrade() -> None:
    """Downgrade schema."""
    # Revert the column name back to the typo version
    op.alter_column('teamups', 'duration_type', new_column_name='durantion_type')
