"""Add TeamUp-Booking many-to-many relationship

Revision ID: 20250115_teamup_booking_m2m
Revises: 20250115_add_teamup_timeslot_many_to_many
Create Date: 2025-01-15 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250115_teamup_booking_m2m'
down_revision = '20250115_add_teamup_timeslot_many_to_many'
branch_labels = None
depends_on = None


def upgrade():
    # Create the new junction table
    op.create_table('teamup_bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('teamup_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_primary', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('priority', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('contribution_amount_cents', sa.Integer(), nullable=True),
        sa.Column('contribution_percentage', sa.Numeric(5, 2), nullable=True),
        sa.Column('status', sa.Text(), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['teamup_id'], ['teamups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint(
            "(contribution_amount_cents IS NULL) OR (contribution_amount_cents >= 0)",
            name='ck_teamup_booking_contribution_non_negative'
        ),
        sa.CheckConstraint(
            "(contribution_percentage IS NULL) OR (contribution_percentage >= 0 AND contribution_percentage <= 100)",
            name='ck_teamup_booking_percentage_valid'
        ),
        sa.CheckConstraint(
            "status IN ('active', 'cancelled', 'completed')",
            name='ck_teamup_booking_status'
        ),
        sa.UniqueConstraint('teamup_id', 'booking_id', name='uq_teamup_booking'),
        sa.UniqueConstraint('teamup_id', 'is_primary', name='uq_teamup_primary_booking')
    )
    
    # Create indexes
    op.create_index('ix_teamup_bookings_teamup', 'teamup_bookings', ['teamup_id'])
    op.create_index('ix_teamup_bookings_booking', 'teamup_bookings', ['booking_id'])
    op.create_index('ix_teamup_bookings_primary', 'teamup_bookings', ['teamup_id', 'is_primary'])
    op.create_index('ix_teamup_bookings_status', 'teamup_bookings', ['status'])
    
    # Migrate existing Event-Booking relationships to TeamUp-Booking
    # This assumes that Events with booking_id should create corresponding TeamUp-Booking relationships
    op.execute("""
        INSERT INTO teamup_bookings (teamup_id, booking_id, is_primary, priority, status)
        SELECT 
            t.id as teamup_id,
            e.booking_id,
            true as is_primary,
            1 as priority,
            'active' as status
        FROM events e
        JOIN teamups t ON t.id = (
            SELECT tu.id 
            FROM teamups tu 
            WHERE tu.status = 'confirmed' 
            AND tu.title = e.title 
            LIMIT 1
        )
        WHERE e.booking_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 FROM teamup_bookings tb 
            WHERE tb.teamup_id = t.id AND tb.booking_id = e.booking_id
        )
    """)


def downgrade():
    # Note: This downgrade will lose TeamUp-Booking relationship data
    # as there's no direct way to map them back to Events
    
    # Drop the junction table
    op.drop_index('ix_teamup_bookings_status', table_name='teamup_bookings')
    op.drop_index('ix_teamup_bookings_primary', table_name='teamup_bookings')
    op.drop_index('ix_teamup_bookings_booking', table_name='teamup_bookings')
    op.drop_index('ix_teamup_bookings_teamup', table_name='teamup_bookings')
    op.drop_table('teamup_bookings')
