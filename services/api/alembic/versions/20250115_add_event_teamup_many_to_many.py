"""Add Event-TeamUp many-to-many relationship

Revision ID: 20250115_event_teamup_m2m
Revises: 20250115_add_booking_assignment
Create Date: 2025-01-15 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250115_event_teamup_m2m'
down_revision = '20250115_add_booking_assignment'
branch_labels = None
depends_on = None


def upgrade():
    # Create the new junction table
    op.create_table('event_teamups',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('teamup_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('priority', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('relationship_type', sa.Text(), nullable=False, server_default='participant'),
        sa.Column('contribution_percentage', sa.Numeric(5, 2), nullable=True),
        sa.Column('status', sa.Text(), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['teamup_id'], ['teamups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint(
            "relationship_type IN ('participant', 'organizer', 'sponsor', 'partner')",
            name='ck_event_teamup_relationship_type'
        ),
        sa.CheckConstraint(
            "(contribution_percentage IS NULL) OR (contribution_percentage >= 0 AND contribution_percentage <= 100)",
            name='ck_event_teamup_contribution_percentage_valid'
        ),
        sa.CheckConstraint(
            "status IN ('active', 'cancelled', 'completed', 'suspended')",
            name='ck_event_teamup_status'
        ),
        sa.UniqueConstraint('event_id', 'teamup_id', name='uq_event_teamup'),
        sa.UniqueConstraint('event_id', 'is_primary', name='uq_event_primary_teamup')
    )
    
    # Create indexes
    op.create_index('ix_event_teamups_event', 'event_teamups', ['event_id'])
    op.create_index('ix_event_teamups_teamup', 'event_teamups', ['teamup_id'])
    op.create_index('ix_event_teamups_primary', 'event_teamups', ['event_id', 'is_primary'])
    op.create_index('ix_event_teamups_status', 'event_teamups', ['status'])
    op.create_index('ix_event_teamups_relationship_type', 'event_teamups', ['relationship_type'])
    
    # Migrate existing TeamUp-Booking relationships to Event-TeamUp relationships
    # This assumes that TeamUps that have bookings should be associated with Events
    op.execute("""
        INSERT INTO event_teamups (
            event_id, 
            teamup_id, 
            is_primary, 
            priority, 
            relationship_type, 
            contribution_percentage, 
            status
        )
        SELECT DISTINCT
            e.id as event_id,
            t.id as teamup_id,
            false as is_primary,
            1 as priority,
            'participant' as relationship_type,
            NULL as contribution_percentage,
            'active' as status
        FROM events e
        JOIN booking_assignments ba ON ba.event_id = e.id
        JOIN bookings b ON b.id = ba.booking_id
        JOIN teamup_bookings tb ON tb.booking_id = b.id
        JOIN teamups t ON t.id = tb.teamup_id
        WHERE NOT EXISTS (
            SELECT 1 FROM event_teamups et 
            WHERE et.event_id = e.id AND et.teamup_id = t.id
        )
    """)
    
    # Create additional Event-TeamUp relationships for events that don't have bookings yet
    # This creates sample relationships for demonstration purposes
    op.execute("""
        INSERT INTO event_teamups (
            event_id, 
            teamup_id, 
            is_primary, 
            priority, 
            relationship_type, 
            contribution_percentage, 
            status
        )
        SELECT 
            e.id as event_id,
            t.id as teamup_id,
            CASE WHEN ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY t.created_at) = 1 THEN true ELSE false END as is_primary,
            ROW_NUMBER() OVER (PARTITION BY e.id ORDER BY t.created_at) as priority,
            'participant' as relationship_type,
            NULL as contribution_percentage,
            'active' as status
        FROM events e
        CROSS JOIN teamups t
        WHERE e.sport_type = t.sport_type
        AND NOT EXISTS (
            SELECT 1 FROM event_teamups et 
            WHERE et.event_id = e.id AND et.teamup_id = t.id
        )
        LIMIT 10
    """)


def downgrade():
    # Drop the junction table
    op.drop_index('ix_event_teamups_relationship_type', table_name='event_teamups')
    op.drop_index('ix_event_teamups_status', table_name='event_teamups')
    op.drop_index('ix_event_teamups_primary', table_name='event_teamups')
    op.drop_index('ix_event_teamups_teamup', table_name='event_teamups')
    op.drop_index('ix_event_teamups_event', table_name='event_teamups')
    op.drop_table('event_teamups')
