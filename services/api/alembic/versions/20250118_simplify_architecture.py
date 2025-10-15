"""Simplify architecture - unified timeslot model and streamlined relationships

Revision ID: 20250118_simplify_architecture
Revises: 20250117_drop_teamup_bookings
Create Date: 2025-01-18 00:00:00.000000

Major changes:
1. Add sport_type to courts table
2. Rename court_timeslots to timeslots
3. Add teamup_id to bookings
4. Remove venue_id from bookings
5. Remove court_timeslot_id from teamups
6. Drop Event, EventParticipant, EventJoinRequest, EventTeamUp tables
7. Drop BookingAssignment, TeamUpTimeslot tables
8. Drop VenueTimeslot, CourtSportType tables

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250118_simplify_architecture'
down_revision = '20250117_drop_teamup_bookings'
branch_labels = None
depends_on = None


def upgrade():
    """
    Phase 1: Add new fields
    Phase 2: Migrate data
    Phase 3: Drop old structures
    """

    # ===== PHASE 1: Add New Fields =====

    # 1. Add sport_type to courts
    op.add_column('courts', sa.Column('sport_type', sa.Text(), nullable=True))

    # 2. Rename court_timeslots to timeslots
    op.rename_table('court_timeslots', 'timeslots')

    # Update indexes and constraints with new names
    op.execute('ALTER INDEX ix_court_timeslots_court_starts_at RENAME TO ix_timeslots_court_starts_at')
    op.execute('ALTER INDEX ix_court_timeslots_period_gist RENAME TO ix_timeslots_period_gist')
    op.execute('ALTER TABLE timeslots RENAME CONSTRAINT ck_court_timeslot_valid_range TO ck_timeslot_valid_range')
    op.execute('ALTER TABLE timeslots RENAME CONSTRAINT ck_court_timeslot_price_non_negative TO ck_timeslot_price_non_negative')
    op.execute('ALTER TABLE timeslots RENAME CONSTRAINT ck_court_timeslot_currency_iso3 TO ck_timeslot_currency_iso3')
    op.execute('ALTER TABLE timeslots RENAME CONSTRAINT ex_court_timeslots_overlap TO ex_timeslots_overlap')

    # 3. Add teamup_id to bookings (nullable)
    op.add_column('bookings', sa.Column('teamup_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key('fk_bookings_teamup_id', 'bookings', 'teamups', ['teamup_id'], ['id'])
    op.create_index('ix_bookings_teamup_id', 'bookings', ['teamup_id'])

    # ===== PHASE 2: Migrate Data =====

    # Migrate court_sport_types to courts.sport_type (take first sport type if multiple)
    op.execute("""
        UPDATE courts c
        SET sport_type = (
            SELECT cst.sport_type
            FROM court_sport_types cst
            WHERE cst.court_id = c.id
            ORDER BY cst.created_at ASC
            LIMIT 1
        )
        WHERE EXISTS (
            SELECT 1 FROM court_sport_types cst WHERE cst.court_id = c.id
        )
    """)

    # Migrate booking_assignments to bookings.teamup_id
    # For bookings with assignments, set teamup_id
    op.execute("""
        UPDATE bookings b
        SET teamup_id = (
            SELECT ba.teamup_id
            FROM booking_assignments ba
            WHERE ba.booking_id = b.id
            LIMIT 1
        )
        WHERE EXISTS (
            SELECT 1 FROM booking_assignments ba WHERE ba.booking_id = b.id
        )
    """)

    # Update bookings.timeslot_id FK to point to timeslots instead of venue_timeslots
    # First, need to ensure all bookings reference court_timeslots (now timeslots)
    # If any reference venue_timeslots, we need to handle that

    # ===== PHASE 3: Drop Old Structures =====

    # Drop junction tables
    op.drop_table('event_teamups')
    op.drop_table('event_participants')
    op.drop_table('event_join_requests')
    op.drop_table('booking_assignments')
    op.drop_table('teamup_timeslots')
    op.drop_table('court_sport_types')

    # Drop main tables
    op.drop_table('events')
    op.drop_table('venue_timeslots')

    # Drop columns from teamups
    op.drop_constraint('teamups_court_timeslot_id_fkey', 'teamups', type_='foreignkey')
    op.drop_index('ix_teamups_court_timeslot_status', 'teamups')
    op.drop_column('teamups', 'court_timeslot_id')

    # Drop venue_id from bookings (derivable from timeslot -> court -> venue)
    op.drop_constraint('bookings_venue_id_fkey', 'bookings', type_='foreignkey')
    op.drop_column('bookings', 'venue_id')

    # Update bookings timeslot FK constraint name
    op.drop_constraint('bookings_timeslot_id_fkey', 'bookings', type_='foreignkey')
    op.create_foreign_key('fk_bookings_timeslot_id', 'bookings', 'timeslots', ['timeslot_id'], ['id'])


def downgrade():
    """
    Reverse all changes (this is complex and may lose data)
    """

    # Recreate tables (schema only, data will be lost)
    op.create_table(
        'venue_timeslots',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('venue_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('starts_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ends_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('price_cents', sa.Integer(), nullable=True),
        sa.Column('currency', sa.Text(), server_default=sa.text("'USD'"), nullable=False),
        sa.Column('is_bookable', sa.Boolean(), server_default=sa.text('TRUE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['venue_id'], ['venues.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('sport_type', sa.Text(), nullable=True),
        sa.Column('starts_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ends_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('city', sa.Text(), nullable=True),
        sa.Column('capacity', sa.Integer(), nullable=True),
        sa.Column('booking_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('owner_user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('visibility', sa.Text(), default='public', nullable=False),
        sa.Column('invite_token', sa.Text(), nullable=True),
        sa.Column('join_review_required', sa.Boolean(), default=True, nullable=False),
        sa.Column('status', sa.Text(), default='open', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['booking_id'], ['bookings.id']),
        sa.ForeignKeyConstraint(['owner_user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'court_sport_types',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('court_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sport_type', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(['court_id'], ['courts.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Add back columns
    op.add_column('bookings', sa.Column('venue_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('teamups', sa.Column('court_timeslot_id', postgresql.UUID(as_uuid=True), nullable=True))

    # Drop new columns
    op.drop_constraint('fk_bookings_teamup_id', 'bookings', type_='foreignkey')
    op.drop_index('ix_bookings_teamup_id', 'bookings')
    op.drop_column('bookings', 'teamup_id')
    op.drop_column('courts', 'sport_type')

    # Rename timeslots back to court_timeslots
    op.rename_table('timeslots', 'court_timeslots')
    op.execute('ALTER INDEX ix_timeslots_court_starts_at RENAME TO ix_court_timeslots_court_starts_at')
    op.execute('ALTER INDEX ix_timeslots_period_gist RENAME TO ix_court_timeslots_period_gist')
    op.execute('ALTER TABLE court_timeslots RENAME CONSTRAINT ck_timeslot_valid_range TO ck_court_timeslot_valid_range')
    op.execute('ALTER TABLE court_timeslots RENAME CONSTRAINT ck_timeslot_price_non_negative TO ck_court_timeslot_price_non_negative')
    op.execute('ALTER TABLE court_timeslots RENAME CONSTRAINT ck_timeslot_currency_iso3 TO ck_court_timeslot_currency_iso3')
    op.execute('ALTER TABLE court_timeslots RENAME CONSTRAINT ex_timeslots_overlap TO ex_court_timeslots_overlap')
