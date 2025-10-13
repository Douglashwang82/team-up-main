"""Add visibility and invite_token to TeamUp

Revision ID: 20250116_add_visibility_teamup
Revises: 20250115_event_teamup_m2m
Create Date: 2025-01-16 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250116_add_visibility_teamup'
down_revision = '20250115_event_teamup_m2m'
branch_labels = None
depends_on = None


def upgrade():
    # Add visibility column with default 'public'
    op.add_column('teamups', sa.Column('visibility', sa.Text(), nullable=False, server_default='public'))

    # Add invite_token column (nullable, unique)
    op.add_column('teamups', sa.Column('invite_token', sa.Text(), nullable=True))

    # Add check constraint for visibility values
    op.create_check_constraint(
        'ck_teamup_visibility',
        'teamups',
        "visibility IN ('public', 'invite_only', 'private')"
    )

    # Add unique constraint for invite_token
    op.create_unique_constraint('uq_teamups_invite_token', 'teamups', ['invite_token'])

    # Create indexes
    op.create_index('ix_teamups_visibility', 'teamups', ['visibility'])
    op.create_index('ix_teamups_invite_token', 'teamups', ['invite_token'])


def downgrade():
    # Drop indexes
    op.drop_index('ix_teamups_invite_token', table_name='teamups')
    op.drop_index('ix_teamups_visibility', table_name='teamups')

    # Drop unique constraint
    op.drop_constraint('uq_teamups_invite_token', 'teamups', type_='unique')

    # Drop check constraint
    op.drop_constraint('ck_teamup_visibility', 'teamups', type_='check')

    # Drop columns
    op.drop_column('teamups', 'invite_token')
    op.drop_column('teamups', 'visibility')
