# app/models/booking.py
import uuid, sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.types import BookingStatus, PaymentStatus

from app.core.db import Base

class Booking(Base):
    __tablename__ = "bookings"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()"))
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id"))
    venue_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("venues.id"), nullable=False)
    timeslot_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("venue_timeslots.id"), nullable=False)

    status: Mapped[str] = mapped_column(sa.Text, default=BookingStatus.pending.value, nullable=False)
    payment_status: Mapped[str] = mapped_column(sa.Text, default=PaymentStatus.none.value, nullable=False)

    created_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), server_default=sa.text("now()"))
    updated_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), server_default=sa.text("now()"))

    # relationships（可選）
    # user = relationship("User")
    # venue = relationship("Venue")
    # timeslot = relationship("VenueTimeslot")
