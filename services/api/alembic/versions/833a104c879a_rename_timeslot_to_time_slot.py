"""rename_timeslot_to_time_slot

Revision ID: 833a104c879a
Revises: faf73b46e241
Create Date: 2025-10-26 22:10:50.345997

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '833a104c879a'
down_revision: Union[str, Sequence[str], None] = 'faf73b46e241'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Rename table timeslots to time_slots
    op.rename_table('timeslots', 'time_slots')

    # 2. Rename column in bookings table
    op.alter_column('bookings', 'timeslot_id', new_column_name='time_slot_id')

    # 3. Rename constraints (PostgreSQL doesn't auto-rename them with the table)
    op.execute('ALTER TABLE time_slots RENAME CONSTRAINT ex_timeslots_overlap TO ex_time_slots_overlap')
    op.execute('ALTER TABLE time_slots RENAME CONSTRAINT ck_timeslot_price_non_negative TO ck_time_slot_price_non_negative')
    op.execute('ALTER TABLE time_slots RENAME CONSTRAINT ck_timeslot_currency_iso3 TO ck_time_slot_currency_iso3')
    op.execute('ALTER TABLE time_slots RENAME CONSTRAINT ck_timeslot_valid_range TO ck_time_slot_valid_range')

    # 4. Rename indexes
    op.execute('ALTER INDEX ix_timeslots_court_starts_at RENAME TO ix_time_slots_court_starts_at')
    op.execute('ALTER INDEX ix_timeslots_period_gist RENAME TO ix_time_slots_period_gist')


def downgrade() -> None:
    """Downgrade schema."""
    # Reverse all operations
    op.execute('ALTER INDEX ix_time_slots_period_gist RENAME TO ix_timeslots_period_gist')
    op.execute('ALTER INDEX ix_time_slots_court_starts_at RENAME TO ix_timeslots_court_starts_at')

    op.execute('ALTER TABLE time_slots RENAME CONSTRAINT ck_time_slot_valid_range TO ck_timeslot_valid_range')
    op.execute('ALTER TABLE time_slots RENAME CONSTRAINT ck_time_slot_currency_iso3 TO ck_timeslot_currency_iso3')
    op.execute('ALTER TABLE time_slots RENAME CONSTRAINT ck_time_slot_price_non_negative TO ck_timeslot_price_non_negative')
    op.execute('ALTER TABLE time_slots RENAME CONSTRAINT ex_time_slots_overlap TO ex_timeslots_overlap')

    op.alter_column('bookings', 'time_slot_id', new_column_name='timeslot_id')

    op.rename_table('time_slots', 'timeslots')
