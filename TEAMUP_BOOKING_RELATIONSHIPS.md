# TeamUp-Booking 多對多關係架構

## 📋 重新定義的軟體應用規則

根據您的要求，系統現在支援：

1. **✅ Users can join multiple teamups** - 用戶可以加入多個組團
2. **✅ Teamups can have multiple users** - 組團可以有多個用戶
3. **✅ Teamups can have multiple bookings** - **新增**：組團可以有多個預訂

## 🔗 更新的關係圖

```
Users ← M…N → TeamUps (via TeamUpParticipant)
TeamUps ← M…N → Timeslots (via TeamUpTimeslot)
TeamUps ← M…N → Bookings (via TeamUpBooking)  ← 新增
Users ← M…N → Events (via EventParticipant)
Events ← 1…N → Bookings ← 1…N → Timeslots
```

## 🆕 新增的資料庫結構

### TeamUpBooking 中介表

```sql
CREATE TABLE teamup_bookings (
    id UUID PRIMARY KEY,
    teamup_id UUID REFERENCES teamups(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    contribution_amount_cents INTEGER,
    contribution_percentage NUMERIC(5,2),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- 約束條件
    UNIQUE(teamup_id, booking_id),
    UNIQUE(teamup_id, is_primary),  -- 每個TeamUp只能有一個主要預訂
    CHECK (contribution_amount_cents >= 0),
    CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100),
    CHECK (status IN ('active', 'cancelled', 'completed'))
);
```

### 關鍵功能

1. **多預訂支援**：每個TeamUp可以關聯多個Booking
2. **主要預訂標記**：`is_primary` 標記最重要的預訂
3. **優先級排序**：`priority` 欄位用於排序預訂重要性
4. **費用分攤**：`contribution_amount_cents` 和 `contribution_percentage` 支援費用分攤
5. **狀態管理**：`status` 追蹤預訂關係狀態

## 🔄 遷移策略

### 現有資料遷移
- 將現有的 Event-Booking 關係遷移到 TeamUp-Booking
- 保持向後相容性
- 遷移過程可逆轉且保留資料

### API 相容性
- 現有 API 端點繼續運作
- 新端點可利用多對多關係
- 前端應用程式可逐步遷移

## 📊 使用案例範例

### 1. 多預訂組團
```python
# 一個籃球隊需要多個時段的預訂
teamup = TeamUp(title="週末籃球聯賽")

# 主要預訂（週六晚上）
booking1 = Booking(timeslot_id=saturday_slot.id)
TeamUpBooking(
    teamup_id=teamup.id, 
    booking_id=booking1.id, 
    is_primary=True, 
    priority=1,
    contribution_percentage=60.0
)

# 備用預訂（週日早上）
booking2 = Booking(timeslot_id=sunday_slot.id)
TeamUpBooking(
    teamup_id=teamup.id, 
    booking_id=booking2.id, 
    is_primary=False, 
    priority=2,
    contribution_percentage=40.0
)
```

### 2. 預訂共享
```python
# 多個TeamUp共享同一個預訂
booking = Booking(timeslot_id=popular_slot.id)

# TeamUp A 使用這個預訂
TeamUpBooking(
    teamup_id=teamup_a.id, 
    booking_id=booking.id, 
    is_primary=True,
    contribution_percentage=50.0
)

# TeamUp B 也使用這個預訂
TeamUpBooking(
    teamup_id=teamup_b.id, 
    booking_id=booking.id, 
    is_primary=True,
    contribution_percentage=50.0
)
```

### 3. 費用分攤
```python
# TeamUp 成員分攤預訂費用
total_cost = 2000  # 2000 cents = $20.00

# 主要預訂者承擔60%
TeamUpBooking(
    teamup_id=teamup.id,
    booking_id=booking.id,
    is_primary=True,
    contribution_amount_cents=1200,  # $12.00
    contribution_percentage=60.0
)

# 其他成員承擔40%
TeamUpBooking(
    teamup_id=teamup.id,
    booking_id=booking.id,
    is_primary=False,
    contribution_amount_cents=800,   # $8.00
    contribution_percentage=40.0
)
```

## 🚀 優勢

1. **增加靈活性**：TeamUp可以有多個預訂選項
2. **費用分攤**：支援複雜的費用分攤機制
3. **預訂共享**：多個TeamUp可以共享預訂
4. **風險分散**：主要和備用預訂降低取消風險
5. **用戶體驗**：更多選項提高參與率

## 🔧 實作細節

### 資料庫變更
- 新增 `teamup_bookings` 中介表
- 更新 `TeamUp` 和 `Booking` 模型
- 遷移腳本處理資料轉移

### API 更新
- 種子腳本更新以創建多預訂TeamUp
- OpenAPI 規格保持相容
- 可新增端點以利用多對多關係

### 向後相容性
- 現有程式碼繼續運作
- 保留舊的單預訂TeamUp
- 提供漸進式遷移路徑

## 📈 未來增強功能

1. **智能預訂匹配**：演算法匹配TeamUp與可用預訂
2. **自動費用分攤**：根據參與者數量自動計算分攤
3. **預訂衝突解決**：處理多個TeamUp競爭同一預訂
4. **通知系統**：當預訂狀態變更時通知相關TeamUp

## 🎯 業務邏輯範例

### TeamUp 預訂流程
1. **創建TeamUp**：用戶創建組團並設定預訂偏好
2. **搜尋預訂**：系統搜尋符合條件的可用預訂
3. **選擇預訂**：TeamUp選擇主要和備用預訂
4. **費用分攤**：設定費用分攤比例
5. **確認預訂**：確認預訂並更新狀態
6. **管理預訂**：持續管理預訂狀態和費用

### 費用計算邏輯
```python
def calculate_teamup_contributions(teamup_id):
    """計算TeamUp的費用分攤"""
    bookings = session.query(TeamUpBooking).filter_by(teamup_id=teamup_id)
    
    total_cost = 0
    contributions = []
    
    for booking_rel in bookings:
        booking = booking_rel.booking
        timeslot = booking.timeslot
        
        if booking_rel.contribution_amount_cents:
            amount = booking_rel.contribution_amount_cents
        elif booking_rel.contribution_percentage:
            amount = timeslot.price_cents * (booking_rel.contribution_percentage / 100)
        else:
            amount = timeslot.price_cents / len(bookings)
        
        contributions.append({
            'booking_id': booking.id,
            'amount_cents': amount,
            'is_primary': booking_rel.is_primary
        })
        total_cost += amount
    
    return {
        'total_cost_cents': total_cost,
        'contributions': contributions
    }
```

這個新架構提供了您要求的靈活性，同時保持系統穩定性和向後相容性。現在TeamUp可以有多個預訂，支援更複雜的組團場景！
