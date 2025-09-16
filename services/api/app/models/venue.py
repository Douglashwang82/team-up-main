# app/models/venue.py
import uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import sqlalchemy as sa

class Venue(sa.orm.DeclarativeBase): pass  # 如果你有 Base 就改成 from app.core.db import Base

# 假設你已有 Base，以下用 Base 取代上面兩行
from app.core.db import Base

class Venue(Base):
    __tablename__ = "venues"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()"))
    name: Mapped[str] = mapped_column(sa.Text, nullable=False)
    address: Mapped[str] = mapped_column(sa.Text, nullable=False)
    city: Mapped[str | None] = mapped_column(sa.Text)
    geo_point: Mapped[str | None] = mapped_column(sa.Text)  # 若你使用 geoalchemy2，改成 Geography(Point,4326)
    contact_phone: Mapped[str | None]
    partner_code: Mapped[str | None]
    created_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), server_default=sa.text("now()"))
    updated_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), server_default=sa.text("now()"))

    timeslots: Mapped[list["VenueTimeslot"]] = relationship(back_populates="venue", cascade="all, delete-orphan")

class VenueTimeslot(Base):
    __tablename__ = "venue_timeslots"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()"))
    venue_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    starts_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
    ends_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), nullable=False)
    sport_type: Mapped[str | None]
    price_cents: Mapped[int | None]
    currency: Mapped[str] = mapped_column(sa.Text, server_default=sa.text("'USD'"), nullable=False)
    is_bookable: Mapped[bool] = mapped_column(sa.Boolean, server_default=sa.text("TRUE"), nullable=False)
    created_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), server_default=sa.text("now()"))
    updated_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), server_default=sa.text("now()"))

    venue: Mapped[Venue] = relationship(back_populates="timeslots")
