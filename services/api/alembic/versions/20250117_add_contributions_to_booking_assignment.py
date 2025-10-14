"""Add contribution fields to booking_assignments

Revision ID: 20250117_add_contributions
Revises: 20250116_add_visibility_teamup
Create Date: 2025-01-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250117_add_contributions'
down_revision = '20250116_add_visibility_teamup'
branch_labels = None
depends_on = None


def upgrade():
    # Add contribution fields to booking_assignments
    op.add_column('booking_assignments', sa.Column('contribution_amount_cents', sa.Integer(), nullable=True))
    op.add_column('booking_assignments', sa.Column('contribution_percentage', sa.Numeric(5, 2), nullable=True))

    # Add check constraints for contribution validation
    op.create_check_constraint(
        'ck_booking_assignment_contribution_non_negative',
        'booking_assignments',
        '(contribution_amount_cents IS NULL) OR (contribution_amount_cents >= 0)'
    )
    op.create_check_constraint(
        'ck_booking_assignment_percentage_valid',
        'booking_assignments',
        '(contribution_percentage IS NULL) OR (contribution_percentage >= 0 AND contribution_percentage <= 100)'
    )


def downgrade():
    # Drop check constraints
    op.drop_constraint('ck_booking_assignment_percentage_valid', 'booking_assignments', type_='check')
    op.drop_constraint('ck_booking_assignment_contribution_non_negative', 'booking_assignments', type_='check')

    # Drop columns
    op.drop_column('booking_assignments', 'contribution_percentage')
    op.drop_column('booking_assignments', 'contribution_amount_cents')
