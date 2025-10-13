"""add_teamup_models

Revision ID: teamup_001
Revises: 20250915_sprint4
Create Date: 2024-12-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'teamup_001'
down_revision = '367fd3366847'
branch_labels = None
depends_on = None


def upgrade():
    # --- teamups ---
    op.create_table(
        'teamups',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('court_timeslot_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('court_timeslots.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('owner_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('min_participants', sa.Integer(), nullable=False, server_default='2'),
        sa.Column('max_participants', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('sport_type', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), nullable=False, server_default='open'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    
    # 約束和索引
    op.create_check_constraint('ck_teamup_min_participants_positive', 'teamups', 'min_participants > 0')
    op.create_check_constraint('ck_teamup_max_gte_min', 'teamups', 'max_participants >= min_participants')
    op.create_check_constraint('ck_teamup_status', 'teamups', "status IN ('open', 'closed', 'confirmed', 'cancelled')")
    op.create_index('ix_teamups_court_timeslot_status', 'teamups', ['court_timeslot_id', 'status'])
    op.create_index('ix_teamups_owner_status', 'teamups', ['owner_user_id', 'status'])
    
    # --- teamup_join_requests ---
    op.create_table(
        'teamup_join_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('teamup_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('teamups.id', ondelete='CASCADE'), nullable=False),
        sa.Column('applicant_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('applicant_name', sa.Text(), nullable=False),
        sa.Column('applicant_email', sa.Text(), nullable=True),
        sa.Column('applicant_phone', sa.Text(), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), nullable=False, server_default='submitted'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
    )
    
    # 約束和索引
    op.create_check_constraint('ck_teamup_join_requests_status', 'teamup_join_requests', "status IN ('submitted', 'approved', 'rejected')")
    op.create_index('ix_teamup_join_requests_teamup_status', 'teamup_join_requests', ['teamup_id', 'status'])
    op.create_index('ix_teamup_join_requests_applicant', 'teamup_join_requests', ['applicant_user_id'])
    
    # --- teamup_participants ---
    op.create_table(
        'teamup_participants',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('teamup_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('teamups.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('role', sa.Text(), nullable=False, server_default='member'),
        sa.Column('display_name', sa.Text(), nullable=True),
        sa.Column('email', sa.Text(), nullable=True),
        sa.Column('phone', sa.Text(), nullable=True),
        sa.Column('join_request_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('teamup_join_requests.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
    )
    
    # 約束和索引
    op.create_check_constraint('ck_teamup_participants_role', 'teamup_participants', "role IN ('owner', 'member')")
    op.create_unique_constraint('uq_teamup_participants_owner', 'teamup_participants', ['teamup_id', 'role'])
    op.create_index('ix_teamup_participants_teamup', 'teamup_participants', ['teamup_id'])
    op.create_index('ix_teamup_participants_user', 'teamup_participants', ['user_id'])


def downgrade():
    op.drop_table('teamup_participants')
    op.drop_table('teamup_join_requests')
    op.drop_table('teamups')
