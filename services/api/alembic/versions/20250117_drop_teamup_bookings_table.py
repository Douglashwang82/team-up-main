"""Drop legacy teamup_bookings table

Revision ID: 20250117_drop_teamup_bookings
Revises: 20250117_add_contributions
Create Date: 2025-01-17 01:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250117_drop_teamup_bookings'
down_revision = '20250117_add_contributions'
branch_labels = None
depends_on = None


def upgrade():
    """
    Drop the legacy teamup_bookings table.
    Data should be migrated to booking_assignments before running this migration.
    """
    # Optional: Migrate existing data from teamup_bookings to booking_assignments
    # This assumes you want to preserve existing relationships
    op.execute("""
        INSERT INTO booking_assignments (
            booking_id,
            teamup_id,
            event_id,
            assignment_type,
            is_primary,
            priority,
            assigned_by_user_id,
            contribution_amount_cents,
            contribution_percentage,
            status,
            created_at,
            updated_at
        )
        SELECT
            tb.booking_id,
            tb.teamup_id,
            NULL as event_id,
            'teamup' as assignment_type,
            tb.is_primary,
            tb.priority,
            t.owner_user_id as assigned_by_user_id,
            tb.contribution_amount_cents,
            tb.contribution_percentage,
            tb.status,
            tb.created_at,
            tb.updated_at
        FROM teamup_bookings tb
        JOIN teamups t ON t.id = tb.teamup_id
        WHERE NOT EXISTS (
            SELECT 1 FROM booking_assignments ba
            WHERE ba.booking_id = tb.booking_id
            AND ba.teamup_id = tb.teamup_id
        )
        ON CONFLICT DO NOTHING
    """)

    # Drop indexes
    op.drop_index('ix_teamup_bookings_status', table_name='teamup_bookings')
    op.drop_index('ix_teamup_bookings_primary', table_name='teamup_bookings')
    op.drop_index('ix_teamup_bookings_booking', table_name='teamup_bookings')
    op.drop_index('ix_teamup_bookings_teamup', table_name='teamup_bookings')

    # Drop table
    op.drop_table('teamup_bookings')


def downgrade():
    """
    Recreate teamup_bookings table.
    Note: This will not restore data, only the table structure.
    """
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
        sa.ForeignKeyConstraint(['teamup_id'], ['teamups.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('teamup_id', 'booking_id', name='uq_teamup_booking'),
        sa.UniqueConstraint('teamup_id', 'is_primary', name='uq_teamup_primary_booking'),
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
    )

    # Recreate indexes
    op.create_index('ix_teamup_bookings_teamup', 'teamup_bookings', ['teamup_id'])
    op.create_index('ix_teamup_bookings_booking', 'teamup_bookings', ['booking_id'])
    op.create_index('ix_teamup_bookings_primary', 'teamup_bookings', ['teamup_id', 'is_primary'])
    op.create_index('ix_teamup_bookings_status', 'teamup_bookings', ['status'])
