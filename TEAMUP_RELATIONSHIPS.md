# TeamUp Database Relationship Structure

## 📋 New Relationship Rules

Based on your requirements, the database now supports:

1. **Users can join multiple TeamUps** ✅
2. **TeamUps can have multiple users** ✅  
3. **TeamUps can have multiple timeslots** ✅ (NEW)
4. **Some Timeslots can have multiple TeamUps** ✅ (NEW)

## 🔗 Updated Relationship Diagram

```
Users ← M…N → TeamUps (via TeamUpParticipant)
TeamUps ← M…N → Timeslots (via TeamUpTimeslot)
Users ← M…N → Events (via EventParticipant)
Events ← 1…N → Bookings ← 1…N → Timeslots
```

## 🆕 New Database Structure

### TeamUpTimeslot Junction Table

```sql
CREATE TABLE teamup_timeslots (
    id UUID PRIMARY KEY,
    teamup_id UUID REFERENCES teamups(id) ON DELETE CASCADE,
    court_timeslot_id UUID REFERENCES court_timeslots(id) ON DELETE CASCADE,
    venue_timeslot_id UUID REFERENCES venue_timeslots(id) ON DELETE CASCADE,
    is_preferred BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CHECK (
        (court_timeslot_id IS NOT NULL AND venue_timeslot_id IS NULL) OR 
        (court_timeslot_id IS NULL AND venue_timeslot_id IS NOT NULL)
    ),
    UNIQUE(teamup_id, court_timeslot_id),
    UNIQUE(teamup_id, venue_timeslot_id)
);
```

### Key Features

1. **Flexible Timeslot Support**: Each TeamUp can reference both `CourtTimeslots` and `VenueTimeslots`
2. **Preference System**: `is_preferred` flag and `priority` field for ranking timeslots
3. **Backward Compatibility**: Legacy `court_timeslot_id` field remains (nullable) for existing data
4. **Data Integrity**: Constraints ensure exactly one timeslot type per relationship

## 🔄 Migration Strategy

### Existing Data Migration
- All existing `teamups.court_timeslot_id` values are migrated to the new junction table
- Legacy field becomes nullable but preserved for backward compatibility
- Migration is reversible with data preservation

### API Compatibility
- Existing API endpoints continue to work
- New endpoints can leverage the many-to-many relationship
- Gradual migration path for frontend applications

## 📊 Example Use Cases

### 1. Multi-Timeslot TeamUp
```python
# A basketball team looking for multiple time options
teamup = TeamUp(title="Weekend Basketball League")

# Preferred timeslots
TeamUpTimeslot(teamup_id=teamup.id, court_timeslot_id=slot1.id, is_preferred=True, priority=1)
TeamUpTimeslot(teamup_id=teamup.id, court_timeslot_id=slot2.id, is_preferred=True, priority=2)

# Alternative timeslots
TeamUpTimeslot(teamup_id=teamup.id, court_timeslot_id=slot3.id, is_preferred=False, priority=3)
```

### 2. Timeslot Competition
```python
# Multiple TeamUps competing for the same popular timeslot
slot = CourtTimeslot(starts_at="2025-01-20 19:00:00")

# TeamUp A wants this slot
TeamUpTimeslot(teamup_id=teamup_a.id, court_timeslot_id=slot.id, is_preferred=True)

# TeamUp B also wants this slot  
TeamUpTimeslot(teamup_id=teamup_b.id, court_timeslot_id=slot.id, is_preferred=True)
```

### 3. Flexible Venue Support
```python
# TeamUp can work with either court or venue timeslots
TeamUpTimeslot(teamup_id=teamup.id, court_timeslot_id=court_slot.id, is_preferred=True)
TeamUpTimeslot(teamup_id=teamup.id, venue_timeslot_id=venue_slot.id, is_preferred=False)
```

## 🚀 Benefits

1. **Increased Flexibility**: TeamUps can propose multiple time options
2. **Better Matching**: Users can find TeamUps that fit their schedule
3. **Competition Handling**: Multiple TeamUps can target popular timeslots
4. **Scalability**: System can handle complex scheduling scenarios
5. **User Experience**: More options lead to better participation rates

## 🔧 Implementation Notes

### Database Changes
- New `teamup_timeslots` junction table
- Updated `TeamUp` model with nullable `court_timeslot_id`
- New relationships in `CourtTimeslot` and `VenueTimeslot` models
- Migration script handles data transfer

### API Updates
- Seed script updated to create multi-timeslot TeamUps
- OpenAPI specification remains compatible
- New endpoints can be added to leverage many-to-many relationships

### Backward Compatibility
- Existing code continues to work
- Legacy single-timeslot TeamUps are preserved
- Gradual migration path available

## 📈 Future Enhancements

1. **Smart Matching**: Algorithm to match TeamUps with overlapping preferred timeslots
2. **Conflict Resolution**: Automatic handling when multiple TeamUps compete for same slot
3. **Availability Checking**: Real-time timeslot availability across TeamUps
4. **Notification System**: Alert users when preferred timeslots become available

This new structure provides the flexibility you requested while maintaining system stability and backward compatibility.

