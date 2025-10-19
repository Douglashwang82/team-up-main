# app/models/booking.py
import uuid, sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.types import BookingStatus, PaymentStatus

from app.core.db import Base

class Booking(Base):
    __tablename__ = "bookings"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()"))

    # Booking owner (required)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False)

    # Timeslot reference (required)
    timeslot_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("timeslots.id"), nullable=False)

    # Optional TeamUp assignment (nullable - bookings can be individual or assigned to a TeamUp)
    teamup_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("teamups.id"), nullable=True)

    status: Mapped[str] = mapped_column(sa.Text, default=BookingStatus.pending.value, nullable=False)
    payment_status: Mapped[str] = mapped_column(sa.Text, default=PaymentStatus.none.value, nullable=False)

    created_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), server_default=sa.text("now()"))
    updated_at: Mapped[sa.DateTime] = mapped_column(sa.DateTime(timezone=True), server_default=sa.text("now()"))

    # Relationships
    owner: Mapped["User"] = relationship(foreign_keys=[owner_user_id])
    timeslot: Mapped["Timeslot"] = relationship(back_populates="bookings")
    teamup: Mapped["TeamUp"] = relationship(back_populates="bookings")
