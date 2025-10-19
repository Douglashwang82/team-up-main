-- Fix TeamUpParticipant constraint to allow multiple members
-- Drop the incorrect unique constraint
ALTER TABLE teamup_participants DROP CONSTRAINT IF EXISTS uq_teamup_participants_owner;

-- Create a partial unique index that only enforces uniqueness for owners
CREATE UNIQUE INDEX uq_teamup_participants_owner ON teamup_participants (teamup_id) WHERE role = 'owner';
