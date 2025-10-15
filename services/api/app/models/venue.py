# app/models/venues.py
# pylint: disable=too-few-public-methods
from __future__ import annotations

import uuid
import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import ExcludeConstraint
from app.core.db import Base

# ──────────────────────────────────────────────────────────────────────────────
# 如果你啟用 PostGIS：
#   1) 在資料庫：CREATE EXTENSION IF NOT EXISTS postgis;
#   2) 取消下面兩行註解，並把 Venue.geo_point 的型別改為 Geography
from geoalchemy2 import Geography
from geoalchemy2.shape import to_shape  # 使用時可把 WKBElement 轉 shapely
# ──────────────────────────────────────────────────────────────────────────────


# =============================================================================
# Venue（場館）
# =============================================================================
class Venue(Base):
    __tablename__ = "venues"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=sa.text("gen_random_uuid()"),
    )
    name: Mapped[str] = mapped_column(sa.Text, nullable=False)
    address: Mapped[str] = mapped_column(sa.Text, nullable=False)
    city: Mapped[str | None] = mapped_column(sa.Text)

    # 若未使用 PostGIS，先以 Text 暫存座標（例如 "25.0330,121.5654"）
    # geo_point: Mapped[str | None] = mapped_column(sa.Text)
    # 若使用 PostGIS，改為：
    geo_point: Mapped[Geography | None] = mapped_column(
        Geography(geometry_type="POINT", srid=4326)
    )

    contact_phone: Mapped[str | None] = mapped_column(sa.Text)
    # 對接第三方夥伴的代碼，若需要獨一可加 unique=True
    partner_code: Mapped[str | None] = mapped_column(sa.Text)

    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )

    # 場館內的分間資訊（球場/場地）
    courts: Mapped[list[Court]] = relationship(
        back_populates="venue", cascade="all, delete-orphan"
    )

    __table_args__ = (
        sa.Index("ix_venues_city", "city"),
        # 若使用 PostGIS 建議加空間索引：
        sa.Index("ix_venues_geo_gist", "geo_point", postgresql_using="gist"),
    )


# =============================================================================
# Court（場館內的單一場地 / 分間）
# =============================================================================
class Court(Base):
    __tablename__ = "courts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=sa.text("gen_random_uuid()"),
    )
    venue_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("venues.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(sa.Text, nullable=False)

    # Simplified sport type (single value instead of junction table)
    sport_type: Mapped[str | None] = mapped_column(sa.Text, nullable=True)

    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )

    venue: Mapped[Venue] = relationship(back_populates="courts")

    # 單一場地出租的時段
    timeslots: Mapped[list["Timeslot"]] = relationship(
        back_populates="court", cascade="all, delete-orphan"
    )

    __table_args__ = (
        # 同一場館內，分間名稱唯一
        sa.UniqueConstraint("venue_id", "name", name="uq_courts_venue_name"),
        sa.Index("ix_courts_venue_id", "venue_id"),
    )


# =============================================================================
# Timeslot（場地出租時段）- Unified timeslot model
#   - 使用 EXCLUDE 約束 + GiST/tstzrange 防止同一球場所屬的時段重疊
# =============================================================================
class Timeslot(Base):
    __tablename__ = "timeslots"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=sa.text("gen_random_uuid()"),
    )
    court_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("courts.id", ondelete="CASCADE"),
        nullable=False,
    )

    starts_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False
    )
    ends_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False
    )

    price_cents: Mapped[int | None] = mapped_column(sa.Integer)
    currency: Mapped[str] = mapped_column(
        sa.Text, server_default=sa.text("'USD'"), nullable=False
    )
    is_bookable: Mapped[bool] = mapped_column(
        sa.Boolean, server_default=sa.text("TRUE"), nullable=False
    )

    created_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
    )
    updated_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
    )

    court: Mapped[Court] = relationship(back_populates="timeslots")

    # Bookings for this timeslot
    bookings: Mapped[list["Booking"]] = relationship(
        back_populates="timeslot", cascade="all, delete-orphan"
    )

    __table_args__ = (
        sa.CheckConstraint("ends_at > starts_at", name="ck_timeslot_valid_range"),
        sa.CheckConstraint(
            "(price_cents IS NULL) OR (price_cents >= 0)",
            name="ck_timeslot_price_non_negative",
        ),
        sa.CheckConstraint(
            "char_length(currency) = 3 AND upper(currency) = currency",
            name="ck_timeslot_currency_iso3",
        ),
        sa.Index("ix_timeslots_court_starts_at", "court_id", "starts_at"),
        sa.Index(
            "ix_timeslots_period_gist",
            sa.text("tstzrange(starts_at, ends_at)"),
            postgresql_using="gist",
        ),
        ExcludeConstraint(
            ("court_id", "="),
            (sa.text("tstzrange(starts_at, ends_at)"), "&&"),
            name="ex_timeslots_overlap",
            using="gist",
        ),
    )
