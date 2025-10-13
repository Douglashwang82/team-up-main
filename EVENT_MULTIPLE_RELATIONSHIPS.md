# Event Multiple Relationships System - 活動多重關係系統

## 📋 系統需求

根據您的要求，系統現在支援：

1. **✅ Events can have multiple bookings** - 活動可以有多個預訂
2. **✅ Events can have multiple teamups** - 活動可以有多個組團

## 🔗 更新的關係圖

```
Users ← 1…N → Bookings (owner relationship)
Bookings ← M…N → Events (via BookingAssignment)
Events ← M…N → TeamUps (via EventTeamUp)  ← 新增
Users ← M…N → TeamUps (via TeamUpParticipant)
Users ← M…N → Events (via EventParticipant)
```

## 🆕 新增的資料庫結構

### EventTeamUp 中介表

```sql
CREATE TABLE event_teamups (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    teamup_id UUID REFERENCES teamups(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    relationship_type TEXT DEFAULT 'participant',
    contribution_percentage NUMERIC(5,2),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- 約束條件
    UNIQUE(event_id, teamup_id),
    UNIQUE(event_id, is_primary),  -- 每個活動只能有一個主要組團
    CHECK (relationship_type IN ('participant', 'organizer', 'sponsor', 'partner')),
    CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100),
    CHECK (status IN ('active', 'cancelled', 'completed', 'suspended'))
);
```

### 更新的 Event 模型

```python
class Event(Base):
    __tablename__ = "events"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    title: Mapped[str] = mapped_column(sa.Text, nullable=False)
    description: Mapped[str | None]
    sport_type: Mapped[str | None]
    starts_at: Mapped[sa.DateTime | None] = mapped_column(sa.DateTime(timezone=True))
    ends_at: Mapped[sa.DateTime | None] = mapped_column(sa.DateTime(timezone=True))
    city: Mapped[str | None]
    capacity: Mapped[int | None]
    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), sa.ForeignKey("users.id"))
    visibility: Mapped[str] = mapped_column(sa.Text, default=Visibility.public.value, nullable=False)
    invite_token: Mapped[str | None]
    join_review_required: Mapped[bool] = mapped_column(sa.Boolean, default=True, nullable=False)
    status: Mapped[str] = mapped_column(sa.Text, default=EventStatus.open.value, nullable=False)
    
    # 關係
    participants: Mapped[list["EventParticipant"]] = relationship(back_populates="event", cascade="all, delete-orphan")
    booking_assignments: Mapped[list["BookingAssignment"]] = relationship(back_populates="event", cascade="all, delete-orphan")
    teamups: Mapped[list["EventTeamUp"]] = relationship(back_populates="event", cascade="all, delete-orphan")
```

## 🔄 遷移策略

### 資料庫變更
1. **新增中介表**：`event_teamups`
2. **資料遷移**：將現有的 TeamUp-Booking 關係遷移到 Event-TeamUp 關係
3. **向後相容**：保留所有現有關係

### API 相容性
- 現有 API 端點繼續運作
- 新端點可利用多對多關係
- 前端應用程式可逐步遷移

## 📊 使用案例範例

### 1. Event 有多個 Bookings
```python
# 創建活動
event = Event(title="大型籃球錦標賽")

# 第一個預訂 - 主要場地
booking1 = Booking(owner_user_id=user.id, venue_id=main_venue.id, timeslot_id=main_slot.id)
assignment1 = BookingAssignment(
    booking_id=booking1.id,
    event_id=event.id,
    assignment_type="event",
    is_primary=True,
    priority=1
)

# 第二個預訂 - 備用場地
booking2 = Booking(owner_user_id=user.id, venue_id=backup_venue.id, timeslot_id=backup_slot.id)
assignment2 = BookingAssignment(
    booking_id=booking2.id,
    event_id=event.id,
    assignment_type="event",
    is_primary=False,
    priority=2
)
```

### 2. Event 有多個 TeamUps
```python
# 創建活動
event = Event(title="籃球聯賽")

# 主要組織組團
main_teamup = TeamUp(title="主辦方組團", sport_type="basketball")
event_teamup1 = EventTeamUp(
    event_id=event.id,
    teamup_id=main_teamup.id,
    is_primary=True,
    relationship_type="organizer",
    contribution_percentage=60.0
)

# 參與組團
participant_teamup = TeamUp(title="參賽組團", sport_type="basketball")
event_teamup2 = EventTeamUp(
    event_id=event.id,
    teamup_id=participant_teamup.id,
    is_primary=False,
    relationship_type="participant",
    contribution_percentage=30.0
)

# 贊助組團
sponsor_teamup = TeamUp(title="贊助商組團", sport_type="basketball")
event_teamup3 = EventTeamUp(
    event_id=event.id,
    teamup_id=sponsor_teamup.id,
    is_primary=False,
    relationship_type="sponsor",
    contribution_percentage=10.0
)
```

### 3. 複雜的活動場景
```python
# 大型體育賽事
tournament = Event(title="年度籃球錦標賽")

# 多個場地預訂
venues = [venue1, venue2, venue3]
for i, venue in enumerate(venues):
    booking = Booking(owner_user_id=organizer.id, venue_id=venue.id, timeslot_id=slots[i].id)
    assignment = BookingAssignment(
        booking_id=booking.id,
        event_id=tournament.id,
        assignment_type="event",
        is_primary=(i == 0),
        priority=i + 1
    )

# 多個組團參與
teamups = [organizer_teamup, team_a, team_b, team_c, sponsor_teamup]
relationship_types = ["organizer", "participant", "participant", "participant", "sponsor"]
contributions = [40.0, 20.0, 20.0, 15.0, 5.0]

for i, teamup in enumerate(teamups):
    event_teamup = EventTeamUp(
        event_id=tournament.id,
        teamup_id=teamup.id,
        is_primary=(i == 0),
        relationship_type=relationship_types[i],
        contribution_percentage=contributions[i]
    )
```

### 4. 活動管理邏輯
```python
def get_event_bookings(event_id):
    """取得活動的所有預訂"""
    return session.query(BookingAssignment).filter_by(
        event_id=event_id,
        assignment_type="event",
        status="active"
    ).order_by(BookingAssignment.priority).all()

def get_event_teamups(event_id):
    """取得活動的所有組團"""
    return session.query(EventTeamUp).filter_by(
        event_id=event_id,
        status="active"
    ).order_by(EventTeamUp.priority).all()

def get_primary_booking(event_id):
    """取得活動的主要預訂"""
    return session.query(BookingAssignment).filter_by(
        event_id=event_id,
        assignment_type="event",
        is_primary=True,
        status="active"
    ).first()

def get_primary_teamup(event_id):
    """取得活動的主要組團"""
    return session.query(EventTeamUp).filter_by(
        event_id=event_id,
        is_primary=True,
        status="active"
    ).first()
```

## 🚀 優勢

1. **靈活的預訂管理**：活動可以有多個預訂選項
2. **複雜的組團協作**：支援多個組團參與同一個活動
3. **角色分工**：不同的組團可以有不同的角色和貢獻
4. **風險分散**：主要和備用預訂降低取消風險
5. **擴展性**：支援大型活動和複雜場景

## 🔧 實作細節

### 資料庫變更
- 新增 `event_teamups` 中介表
- 更新 `Event` 和 `TeamUp` 模型
- 遷移腳本處理資料轉移

### API 更新
- 種子腳本更新以創建多對多關係
- OpenAPI 規格保持相容
- 可新增端點以利用多對多關係

### 向後相容性
- 現有程式碼繼續運作
- 保留所有現有關係
- 提供漸進式遷移路徑

## 📈 業務邏輯範例

### 活動預訂流程
1. **創建活動**：用戶創建活動
2. **搜尋預訂**：系統搜尋符合條件的可用預訂
3. **選擇預訂**：活動選擇主要和備用預訂
4. **確認預訂**：確認預訂並更新狀態
5. **管理預訂**：持續管理預訂狀態

### 組團協作流程
1. **創建活動**：活動組織者創建活動
2. **邀請組團**：邀請相關組團參與
3. **設定角色**：為每個組團設定角色和貢獻
4. **協調管理**：協調各組團的參與
5. **活動執行**：執行活動並管理各組團

### 費用分攤邏輯
```python
def calculate_event_contributions(event_id):
    """計算活動的費用分攤"""
    teamups = session.query(EventTeamUp).filter_by(event_id=event_id, status="active")
    
    total_contribution = 0
    contributions = []
    
    for teamup_rel in teamups:
        if teamup_rel.contribution_percentage:
            contribution = teamup_rel.contribution_percentage
            contributions.append({
                'teamup_id': teamup_rel.teamup_id,
                'contribution_percentage': contribution,
                'relationship_type': teamup_rel.relationship_type,
                'is_primary': teamup_rel.is_primary
            })
            total_contribution += contribution
    
    return {
        'total_contribution_percentage': total_contribution,
        'contributions': contributions
    }
```

## 🎯 系統優勢

### 1. 多預訂支援
- 活動可以有多個預訂選項
- 支援主要和備用預訂
- 降低預訂取消風險

### 2. 多組團協作
- 活動可以有多個組團參與
- 支援不同的角色和貢獻
- 便於大型活動管理

### 3. 靈活的關係管理
- 支援複雜的活動場景
- 便於活動擴展
- 提高系統靈活性

### 4. 完整的追蹤
- 記錄所有關係歷史
- 追蹤貢獻和角色
- 支援狀態管理

這個新系統提供了您要求的靈活性，同時保持系統穩定性和向後相容性。現在活動可以有多個預訂和多個組團，支援更複雜的活動管理場景！
