"""Add venue_id and court_id to Event

Revision ID: 563d7f6e664c
Revises: 22814db5a4bc
Create Date: 2026-03-01 02:58:55.085453

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '563d7f6e664c'
down_revision: Union[str, Sequence[str], None] = '22814db5a4bc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('events', sa.Column('venue_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('events', sa.Column('court_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_event_venue', 'events', 'venues', ['venue_id'], ['id'])
    op.create_foreign_key('fk_event_court', 'events', 'courts', ['court_id'], ['id'])

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_event_court', 'events', type_='foreignkey')
    op.drop_constraint('fk_event_venue', 'events', type_='foreignkey')
    op.drop_column('events', 'court_id')
    op.drop_column('events', 'venue_id')
