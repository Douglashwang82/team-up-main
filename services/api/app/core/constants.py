"""
System-wide constants for the Team-Up application.
"""
import uuid

# System User Configuration
# This user owns all auto-generated events created by the matching service
SYSTEM_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
SYSTEM_USER_EMAIL = "system@team-up.internal"
SYSTEM_USER_DISPLAY_NAME = "Team-Up Bot"
SYSTEM_USER_PASSWORD_HASH = "$2b$12$dummy.hash.for.system.user.that.should.never.login"
