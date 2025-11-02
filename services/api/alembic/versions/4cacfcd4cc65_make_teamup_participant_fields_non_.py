"""make_teamup_participant_fields_non_nullable

Revision ID: 4cacfcd4cc65
Revises: 833a104c879a
Create Date: 2025-10-26 22:27:34.351302

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4cacfcd4cc65'
down_revision: Union[str, Sequence[str], None] = '833a104c879a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Before making columns non-nullable, set default values for any NULL records
    # This prevents constraint violations

    # Update NULL user_id records - since this is a foreign key, we can't set a default
    # Any NULL values would be invalid data, so we assume they don't exist or will be handled separately

    # Update NULL display_name records
    op.execute("UPDATE teamup_participants SET display_name = '' WHERE display_name IS NULL")

    # Update NULL email records
    op.execute("UPDATE teamup_participants SET email = '' WHERE email IS NULL")

    # Update NULL phone records
    op.execute("UPDATE teamup_participants SET phone = '' WHERE phone IS NULL")

    # Now make columns non-nullable
    op.alter_column('teamup_participants', 'user_id',
                    existing_type=sa.UUID(),
                    nullable=False)
    op.alter_column('teamup_participants', 'display_name',
                    existing_type=sa.String(),
                    nullable=False)
    op.alter_column('teamup_participants', 'email',
                    existing_type=sa.String(),
                    nullable=False)
    op.alter_column('teamup_participants', 'phone',
                    existing_type=sa.String(),
                    nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Revert columns back to nullable
    op.alter_column('teamup_participants', 'phone',
                    existing_type=sa.String(),
                    nullable=True)
    op.alter_column('teamup_participants', 'email',
                    existing_type=sa.String(),
                    nullable=True)
    op.alter_column('teamup_participants', 'display_name',
                    existing_type=sa.String(),
                    nullable=True)
    op.alter_column('teamup_participants', 'user_id',
                    existing_type=sa.UUID(),
                    nullable=True)
