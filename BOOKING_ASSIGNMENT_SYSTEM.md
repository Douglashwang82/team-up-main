# Booking Assignment System - 預訂指派系統

## 📋 系統需求

根據您的要求，系統現在支援：

1. **✅ Booking must have an owner** - 預訂必須有擁有者
2. **✅ A booking can be assigned to TeamUps or Events** - 預訂可以指派給組團或活動

## 🔗 更新的關係圖

```
Users ← 1…N → Bookings (owner relationship)
Bookings ← M…N → TeamUps (via BookingAssignment)
Bookings ← M…N → Events (via BookingAssignment)
Users ← M…N → TeamUps (via TeamUpParticipant)
Users ← M…N → Events (via EventParticipant)
```

## 🆕 新增的資料庫結構

### BookingAssignment 中介表

```sql
CREATE TABLE booking_assignments (
    id UUID PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    teamup_id UUID REFERENCES teamups(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    assignment_type TEXT NOT NULL,  -- 'teamup' or 'event'
    is_primary BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    assigned_by_user_id UUID REFERENCES users(id),
    assignment_reason TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- 約束條件
    CHECK (
        (teamup_id IS NOT NULL AND event_id IS NULL AND assignment_type = 'teamup') OR 
        (teamup_id IS NULL AND event_id IS NOT NULL AND assignment_type = 'event')
    ),
    UNIQUE(booking_id, teamup_id),
    UNIQUE(booking_id, event_id),
    UNIQUE(booking_id, is_primary),  -- 每個預訂只能有一個主要指派
    CHECK (assignment_type IN ('teamup', 'event')),
    CHECK (status IN ('active', 'cancelled', 'completed', 'transferred'))
);
```

### 更新的 Booking 模型

```python
class Booking(Base):
    __tablename__ = "bookings"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    owner_user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False)  # 必須有擁有者
    venue_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("venues.id"), nullable=False)
    timeslot_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("venue_timeslots.id"), nullable=False)
    
    status: Mapped[str] = mapped_column(sa.Text, default=BookingStatus.pending.value, nullable=False)
    payment_status: Mapped[str] = mapped_column(sa.Text, default=PaymentStatus.none.value, nullable=False)
    
    # 關係
    owner: Mapped["User"] = relationship(foreign_keys=[owner_user_id])
    venue: Mapped["Venue"] = relationship(back_populates="bookings")
    timeslot: Mapped["VenueTimeslot"] = relationship(back_populates="bookings")
    assignments: Mapped[list["BookingAssignment"]] = relationship(back_populates="booking", cascade="all, delete-orphan")
```

## 🔄 遷移策略

### 資料庫變更
1. **重命名欄位**：`user_id` → `owner_user_id` (非空)
2. **新增中介表**：`booking_assignments`
3. **資料遷移**：將現有的 Event-Booking 和 TeamUp-Booking 關係遷移到新系統
4. **向後相容**：保留舊的 `TeamUpBooking` 表

### API 相容性
- 現有 API 端點繼續運作
- 新端點可利用指派系統
- 前端應用程式可逐步遷移

## 📊 使用案例範例

### 1. Booking 指派給 Event
```python
# 創建預訂
booking = Booking(
    owner_user_id=user.id,  # 預訂擁有者
    venue_id=venue.id,
    timeslot_id=timeslot.id,
    status="confirmed"
)

# 指派給活動
assignment = BookingAssignment(
    booking_id=booking.id,
    event_id=event.id,
    assignment_type="event",
    is_primary=True,
    assigned_by_user_id=user.id,
    assignment_reason="Event organizer booking"
)
```

### 2. Booking 指派給 TeamUp
```python
# 創建預訂
booking = Booking(
    owner_user_id=user.id,  # 預訂擁有者
    venue_id=venue.id,
    timeslot_id=timeslot.id,
    status="confirmed"
)

# 指派給組團
assignment = BookingAssignment(
    booking_id=booking.id,
    teamup_id=teamup.id,
    assignment_type="teamup",
    is_primary=True,
    assigned_by_user_id=user.id,
    assignment_reason="TeamUp organizer booking"
)
```

### 3. 多個指派 (一個預訂指派給多個實體)
```python
# 同一個預訂可以指派給多個 TeamUp
booking = Booking(owner_user_id=user.id, ...)

# 主要指派
primary_assignment = BookingAssignment(
    booking_id=booking.id,
    teamup_id=teamup_a.id,
    assignment_type="teamup",
    is_primary=True,
    priority=1
)

# 次要指派
secondary_assignment = BookingAssignment(
    booking_id=booking.id,
    teamup_id=teamup_b.id,
    assignment_type="teamup",
    is_primary=False,
    priority=2
)
```

### 4. 預訂轉移
```python
# 將預訂從一個 TeamUp 轉移到另一個 TeamUp
old_assignment = BookingAssignment.query.filter_by(
    booking_id=booking.id,
    teamup_id=old_teamup.id
).first()

# 取消舊指派
old_assignment.status = "transferred"

# 創建新指派
new_assignment = BookingAssignment(
    booking_id=booking.id,
    teamup_id=new_teamup.id,
    assignment_type="teamup",
    is_primary=True,
    assigned_by_user_id=user.id,
    assignment_reason="Transferred from old TeamUp"
)
```

## 🚀 優勢

1. **明確的所有權**：每個預訂都有明確的擁有者
2. **靈活的指派**：預訂可以指派給多個 TeamUp 或 Event
3. **追蹤能力**：完整記錄指派歷史和原因
4. **狀態管理**：支援預訂轉移和狀態變更
5. **優先級系統**：支援主要和次要指派

## 🔧 實作細節

### 資料庫變更
- 新增 `booking_assignments` 中介表
- 更新 `Booking` 模型：`user_id` → `owner_user_id` (非空)
- 更新 `TeamUp` 和 `Event` 模型以支援指派關係
- 遷移腳本處理資料轉移

### API 更新
- 種子腳本更新以創建指派關係
- OpenAPI 規格保持相容
- 可新增端點以利用指派系統

### 向後相容性
- 現有程式碼繼續運作
- 保留舊的 `TeamUpBooking` 表
- 提供漸進式遷移路徑

## 📈 業務邏輯範例

### Booking 指派流程
1. **創建預訂**：用戶創建預訂並成為擁有者
2. **選擇目標**：選擇要指派給 TeamUp 或 Event
3. **設定優先級**：設定主要或次要指派
4. **記錄原因**：記錄指派原因
5. **確認指派**：確認指派並更新狀態

### 預訂管理邏輯
```python
def get_booking_assignments(booking_id):
    """取得預訂的所有指派"""
    return session.query(BookingAssignment).filter_by(
        booking_id=booking_id,
        status="active"
    ).order_by(BookingAssignment.priority).all()

def get_primary_assignment(booking_id):
    """取得預訂的主要指派"""
    return session.query(BookingAssignment).filter_by(
        booking_id=booking_id,
        is_primary=True,
        status="active"
    ).first()

def transfer_booking_assignment(booking_id, from_entity_id, to_entity_id, assignment_type):
    """轉移預訂指派"""
    # 取消舊指派
    old_assignment = session.query(BookingAssignment).filter_by(
        booking_id=booking_id,
        **{f"{assignment_type}_id": from_entity_id}
    ).first()
    
    if old_assignment:
        old_assignment.status = "transferred"
    
    # 創建新指派
    new_assignment = BookingAssignment(
        booking_id=booking_id,
        **{f"{assignment_type}_id": to_entity_id},
        assignment_type=assignment_type,
        is_primary=True,
        status="active"
    )
    session.add(new_assignment)
    session.commit()
```

## 🎯 系統優勢

### 1. 明確的所有權
- 每個預訂都有明確的擁有者
- 便於追蹤責任和權限
- 支援預訂轉移

### 2. 靈活的指派
- 預訂可以指派給多個實體
- 支援主要和次要指派
- 便於預訂共享

### 3. 完整的追蹤
- 記錄指派歷史
- 追蹤指派原因
- 支援狀態變更

### 4. 業務邏輯支援
- 支援複雜的預訂場景
- 便於預訂管理
- 提高系統靈活性

這個新系統提供了您要求的靈活性，同時保持系統穩定性和向後相容性。現在預訂必須有擁有者，並且可以靈活地指派給 TeamUp 或 Event！
