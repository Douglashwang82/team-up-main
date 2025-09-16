from enum import Enum

class Visibility(str, Enum):
    public = "public"
    invite_only = "invite_only"
    private = "private"

class EventStatus(str, Enum):
    open = "open"
    ongoing = "ongoing"
    closed = "closed"

class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"

class PaymentStatus(str, Enum):
    none = "none"
    pending = "pending"
    succeeded = "succeeded"
    failed = "failed"
