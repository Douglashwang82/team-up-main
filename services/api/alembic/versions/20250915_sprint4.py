"""Sprint 4: venues / bookings / join-requests (UUID)

Revision ID: 20250916_sprint4_delta
Revises: <PUT_PREV_REVISION_ID_HERE>
Create Date: 2025-09-16 00:30:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geography


# revision identifiers, used by Alembic.
revision = "20250916_sprint4_delta"
down_revision = None
branch_labels = None
depends_on = None


def _enable_extensions():
    bind = op.get_bind()
    # 用 gen_random_uuid() 產生 UUID
    try:
        bind.execute(sa.text('CREATE EXTENSION IF NOT EXISTS "pgcrypto";'))
    except Exception:
        pass
    # 若你要用 geography(Point,4326) 再視情況啟用 PostGIS
    try:
        bind.execute(sa.text('CREATE EXTENSION IF NOT EXISTS "postgis";'))
    except Exception:
        pass


def upgrade():
    _enable_extensions()

    bind = op.get_bind()
    postgis_enabled = False
    try:
        postgis_enabled = bool(
            bind.execute(sa.text("SELECT 1 FROM pg_extension WHERE extname='postgis';")).fetchone()
        )
    except Exception:
        postgis_enabled = False

    # --- venues ---
    geo_col = (
        sa.Column("geo_point", Geography(geometry_type="POINT", srid=4326), nullable=True)
        if postgis_enabled
        else sa.Column("geo_point", sa.Text, nullable=True)
    )

    op.create_table(
        "venues",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("address", sa.Text, nullable=False),
        sa.Column("city", sa.Text, nullable=True),
        geo_col,
        sa.Column("contact_phone", sa.Text, nullable=True),
        sa.Column("partner_code", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_venues_city", "venues", ["city"], unique=False)
    if postgis_enabled:
        op.create_index("ix_venues_geo_point_gist", "venues", ["geo_point"], postgresql_using="gist")

    # --- venue_timeslots ---
    op.create_table(
        "venue_timeslots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("venue_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("venues.id", ondelete="CASCADE"), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("sport_type", sa.Text, nullable=True),
        sa.Column("price_cents", sa.Integer, nullable=True),
        sa.Column("currency", sa.Text, server_default=sa.text("'USD'"), nullable=False),
        sa.Column("is_bookable", sa.Boolean, server_default=sa.text("TRUE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_venue_timeslots_venue_time", "venue_timeslots", ["venue_id", "starts_at", "ends_at"], unique=False)
    op.create_unique_constraint(
        "uq_venue_timeslots_unique_window",
        "venue_timeslots",
        ["venue_id", "starts_at", "ends_at"],
    )


    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.Text, unique=True, index=True, nullable=False),
        sa.Column("password_hash", sa.Text, nullable=False),
        sa.Column("display_name", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    # --- bookings ---
    op.create_table(
        "bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("venue_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("venues.id"), nullable=False),
        sa.Column("timeslot_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("venue_timeslots.id"), nullable=False),
        sa.Column("status", sa.Text, server_default=sa.text("'pending'"), nullable=False),
        sa.Column("payment_status", sa.Text, server_default=sa.text("'none'"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_unique_constraint("uq_bookings_timeslot", "bookings", ["timeslot_id"])
    op.create_check_constraint("ck_bookings_status", "bookings", "status IN ('pending','confirmed','cancelled')")
    op.create_check_constraint("ck_bookings_payment_status", "bookings", "payment_status IN ('none','pending','succeeded','failed')")

    # --- events ---
    op.create_table(
        "events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.Text, nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("sport_type", sa.Text, nullable=True),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("city", sa.Text, nullable=True),
        sa.Column("capacity", sa.Integer, nullable=True),
        sa.Column("booking_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("bookings.id"), nullable=True),
        sa.Column("owner_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("visibility", sa.Text, server_default=sa.text("'public'"), nullable=False),
        sa.Column("invite_token", sa.Text, nullable=True),
        sa.Column("join_review_required", sa.Boolean, server_default=sa.text("TRUE"), nullable=False),
        sa.Column("status", sa.Text, server_default=sa.text("'open'"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("participants", postgresql.ARRAY(postgresql.UUID(as_uuid=True)), nullable=True),
    )

    # --- events 擴充（保留你原本 UUID PK 結構） ---
    # 若這些欄位已存在，請依實際情況移除對應 add_column
    op.create_check_constraint("ck_events_visibility", "events", "visibility IN ('public','invite_only','private')")
    op.create_index(
        "ix_events_invite_token_unique",
        "events",
        ["invite_token"],
        unique=True,
        postgresql_where=sa.text("invite_token IS NOT NULL"),
    )
    # 建議（若你常用 created_at 做排序/查詢）
    try:
        op.create_index("ix_events_visibility_created", "events", ["visibility", "created_at"], unique=False)
    except Exception:
        # 若沒有 created_at 欄位可略過
        pass

    # --- event_join_requests ---
    op.create_table(
        "event_join_requests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("applicant_user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("applicant_name", sa.Text, nullable=False),
        sa.Column("applicant_email", sa.Text, nullable=True),
        sa.Column("applicant_phone", sa.Text, nullable=True),
        sa.Column("message", sa.Text, nullable=True),
        sa.Column("status", sa.Text, server_default=sa.text("'submitted'"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_check_constraint("ck_event_join_requests_status", "event_join_requests", "status IN ('submitted','approved','rejected')")
    op.create_index("ix_event_join_requests_event_status", "event_join_requests", ["event_id", "status"], unique=False)

    # --- event_participants 擴充（支援非會員資訊與 join_request 對應） ---
    op.create_table(
        "event_participants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("event_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("role", sa.Text, server_default=sa.text("'member'"), nullable=False),
        sa.Column("display_name", sa.Text, nullable=True),
        sa.Column("email", sa.Text, nullable=True),
        sa.Column("phone", sa.Text, nullable=True),
        sa.Column("join_request_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_foreign_key(
        "event_participants_join_request_id_fkey",
        "event_participants",
        "event_join_requests",
        ["join_request_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_index("ix_event_participants_event_id", "event_participants", ["event_id"], unique=False)


def downgrade():
    # event_participants 擴充回滾
    op.drop_index("ix_event_participants_event_id", table_name="event_participants")
    op.drop_constraint("event_participants_join_request_id_fkey", "event_participants", type_="foreignkey")
    op.drop_column("event_participants", "join_request_id")
    op.drop_column("event_participants", "phone")
    op.drop_column("event_participants", "email")
    op.drop_column("event_participants", "display_name")

    # event_join_requests
    op.drop_index("ix_event_join_requests_event_status", table_name="event_join_requests")
    op.drop_constraint("ck_event_join_requests_status", "event_join_requests", type_="check")
    op.drop_table("event_join_requests")

    # events 擴充回滾
    try:
        op.drop_index("ix_events_visibility_created", table_name="events")
    except Exception:
        pass
    op.drop_index("ix_events_invite_token_unique", table_name="events")
    op.drop_constraint("ck_events_visibility", "events", type_="check")
    op.drop_column("events", "join_review_required")
    op.drop_column("events", "invite_token")
    op.drop_column("events", "visibility")
    op.drop_constraint("events_owner_user_id_fkey", "events", type_="foreignkey")
    op.drop_column("events", "owner_user_id")
    op.drop_constraint("events_booking_id_fkey", "events", type_="foreignkey")
    op.drop_column("events", "booking_id")

    # bookings
    op.drop_constraint("ck_bookings_payment_status", "bookings", type_="check")
    op.drop_constraint("ck_bookings_status", "bookings", type_="check")
    op.drop_constraint("uq_bookings_timeslot", "bookings", type_="unique")
    op.drop_table("bookings")

    # venue_timeslots
    op.drop_constraint("uq_venue_timeslots_unique_window", "venue_timeslots", type_="unique")
    op.drop_index("ix_venue_timeslots_venue_time", table_name="venue_timeslots")
    op.drop_table("venue_timeslots")

    # venues
    if _has_index("venues", "ix_venues_geo_point_gist"):
        op.drop_index("ix_venues_geo_point_gist", table_name="venues")
    op.drop_index("ix_venues_city", table_name="venues")
    op.drop_table("venues")


def _has_index(table_name: str, index_name: str) -> bool:
    bind = op.get_bind()
    try:
        row = bind.execute(
            sa.text(
                """
                SELECT 1
                FROM pg_class c
                WHERE c.relkind = 'i' AND c.relname = :idx
                """
            ),
            {"idx": index_name},
        ).fetchone()
        return bool(row)
    except Exception:
        return False
