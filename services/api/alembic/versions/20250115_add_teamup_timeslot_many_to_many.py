"""Add TeamUp-Timeslot many-to-many relationship

Revision ID: 20250115_teamup_timeslot_m2m
Revises: 20251008_add_teamup_models
Create Date: 2025-01-15 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250115_teamup_timeslot_m2m'
down_revision = '20251008_add_teamup_models'
branch_labels = None
depends_on = None


def upgrade():
    # Create the new junction table
    op.create_table('teamup_timeslots',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('teamup_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('court_timeslot_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('venue_timeslot_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_preferred', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('priority', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['court_timeslot_id'], ['court_timeslots.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['teamup_id'], ['teamups.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['venue_timeslot_id'], ['venue_timeslots.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint(
            "(court_timeslot_id IS NOT NULL AND venue_timeslot_id IS NULL) OR "
            "(court_timeslot_id IS NULL AND venue_timeslot_id IS NOT NULL)",
            name='ck_teamup_timeslot_exactly_one'
        ),
        sa.UniqueConstraint('teamup_id', 'court_timeslot_id', name='uq_teamup_court_timeslot'),
        sa.UniqueConstraint('teamup_id', 'venue_timeslot_id', name='uq_teamup_venue_timeslot')
    )
    
    # Create indexes
    op.create_index('ix_teamup_timeslots_teamup', 'teamup_timeslots', ['teamup_id'])
    op.create_index('ix_teamup_timeslots_court', 'teamup_timeslots', ['court_timeslot_id'])
    op.create_index('ix_teamup_timeslots_venue', 'teamup_timeslots', ['venue_timeslot_id'])
    op.create_index('ix_teamup_timeslots_preferred', 'teamup_timeslots', ['teamup_id', 'is_preferred'])
    
    # Migrate existing data from teamups.court_timeslot_id to the new junction table
    op.execute("""
        INSERT INTO teamup_timeslots (teamup_id, court_timeslot_id, is_preferred, priority)
        SELECT id, court_timeslot_id, true, 1
        FROM teamups 
        WHERE court_timeslot_id IS NOT NULL
    """)
    
    # Make court_timeslot_id nullable (but keep it for backward compatibility)
    op.alter_column('teamups', 'court_timeslot_id',
                    existing_type=postgresql.UUID(as_uuid=True),
                    nullable=True)


def downgrade():
    # Migrate data back from junction table to teamups.court_timeslot_id
    op.execute("""
        UPDATE teamups 
        SET court_timeslot_id = (
            SELECT court_timeslot_id 
            FROM teamup_timeslots 
            WHERE teamup_timeslots.teamup_id = teamups.id 
            AND teamup_timeslots.is_preferred = true 
            LIMIT 1
        )
        WHERE EXISTS (
            SELECT 1 FROM teamup_timeslots 
            WHERE teamup_timeslots.teamup_id = teamups.id
        )
    """)
    
    # Make court_timeslot_id non-nullable again
    op.alter_column('teamups', 'court_timeslot_id',
                    existing_type=postgresql.UUID(as_uuid=True),
                    nullable=False)
    
    # Drop the junction table
    op.drop_index('ix_teamup_timeslots_preferred', table_name='teamup_timeslots')
    op.drop_index('ix_teamup_timeslots_venue', table_name='teamup_timeslots')
    op.drop_index('ix_teamup_timeslots_court', table_name='teamup_timeslots')
    op.drop_index('ix_teamup_timeslots_teamup', table_name='teamup_timeslots')
    op.drop_table('teamup_timeslots')

