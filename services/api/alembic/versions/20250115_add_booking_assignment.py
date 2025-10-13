"""Add Booking assignment system

Revision ID: 20250115_booking_assignment
Revises: 20250115_teamup_booking_m2m
Create Date: 2025-01-15 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250115_booking_assignment'
down_revision = '20250115_teamup_booking_m2m'
branch_labels = None
depends_on = None


def upgrade():
    # First, rename user_id to owner_user_id and make it non-nullable
    op.alter_column('bookings', 'user_id', new_column_name='owner_user_id', nullable=False)
    
    # Create the new booking assignment table
    op.create_table('booking_assignments',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('teamup_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('assignment_type', sa.Text(), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('priority', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('assigned_by_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('assignment_reason', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['assigned_by_user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['teamup_id'], ['teamups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint(
            "(teamup_id IS NOT NULL AND event_id IS NULL AND assignment_type = 'teamup') OR "
            "(teamup_id IS NULL AND event_id IS NOT NULL AND assignment_type = 'event')",
            name='ck_booking_assignment_exactly_one_target'
        ),
        sa.CheckConstraint(
            "assignment_type IN ('teamup', 'event')",
            name='ck_booking_assignment_type'
        ),
        sa.CheckConstraint(
            "status IN ('active', 'cancelled', 'completed', 'transferred')",
            name='ck_booking_assignment_status'
        ),
        sa.UniqueConstraint('booking_id', 'teamup_id', name='uq_booking_teamup_assignment'),
        sa.UniqueConstraint('booking_id', 'event_id', name='uq_booking_event_assignment'),
        sa.UniqueConstraint('booking_id', 'is_primary', name='uq_booking_primary_assignment')
    )
    
    # Create indexes
    op.create_index('ix_booking_assignments_booking', 'booking_assignments', ['booking_id'])
    op.create_index('ix_booking_assignments_teamup', 'booking_assignments', ['teamup_id'])
    op.create_index('ix_booking_assignments_event', 'booking_assignments', ['event_id'])
    op.create_index('ix_booking_assignments_type', 'booking_assignments', ['assignment_type'])
    op.create_index('ix_booking_assignments_primary', 'booking_assignments', ['booking_id', 'is_primary'])
    op.create_index('ix_booking_assignments_status', 'booking_assignments', ['status'])
    op.create_index('ix_booking_assignments_assigned_by', 'booking_assignments', ['assigned_by_user_id'])
    
    # Migrate existing Event-Booking relationships to BookingAssignment
    op.execute("""
        INSERT INTO booking_assignments (
            booking_id, 
            event_id, 
            assignment_type, 
            is_primary, 
            priority, 
            assigned_by_user_id, 
            assignment_reason, 
            status
        )
        SELECT 
            e.booking_id,
            e.id as event_id,
            'event' as assignment_type,
            true as is_primary,
            1 as priority,
            e.owner_user_id as assigned_by_user_id,
            'Migrated from Event.booking_id' as assignment_reason,
            'active' as status
        FROM events e
        WHERE e.booking_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM booking_assignments ba 
            WHERE ba.booking_id = e.booking_id AND ba.event_id = e.id
        )
    """)
    
    # Migrate existing TeamUp-Booking relationships to BookingAssignment
    op.execute("""
        INSERT INTO booking_assignments (
            booking_id, 
            teamup_id, 
            assignment_type, 
            is_primary, 
            priority, 
            assigned_by_user_id, 
            assignment_reason, 
            status
        )
        SELECT 
            tb.booking_id,
            tb.teamup_id,
            'teamup' as assignment_type,
            tb.is_primary,
            tb.priority,
            t.owner_user_id as assigned_by_user_id,
            'Migrated from TeamUpBooking' as assignment_reason,
            tb.status
        FROM teamup_bookings tb
        JOIN teamups t ON t.id = tb.teamup_id
        WHERE NOT EXISTS (
            SELECT 1 FROM booking_assignments ba 
            WHERE ba.booking_id = tb.booking_id AND ba.teamup_id = tb.teamup_id
        )
    """)


def downgrade():
    # Drop the booking assignment table
    op.drop_index('ix_booking_assignments_assigned_by', table_name='booking_assignments')
    op.drop_index('ix_booking_assignments_status', table_name='booking_assignments')
    op.drop_index('ix_booking_assignments_primary', table_name='booking_assignments')
    op.drop_index('ix_booking_assignments_type', table_name='booking_assignments')
    op.drop_index('ix_booking_assignments_event', table_name='booking_assignments')
    op.drop_index('ix_booking_assignments_teamup', table_name='booking_assignments')
    op.drop_index('ix_booking_assignments_booking', table_name='booking_assignments')
    op.drop_table('booking_assignments')
    
    # Revert owner_user_id back to user_id and make it nullable
    op.alter_column('bookings', 'owner_user_id', new_column_name='user_id', nullable=True)
