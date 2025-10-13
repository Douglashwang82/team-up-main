# TeamUp 組團功能 PRD (Product Requirements Document)

## 1. 產品概述

### 1.1 產品名稱
TeamUp - 智能組團系統

### 1.2 產品定位
TeamUp 是一個基於場地時段的智能組團平台，讓用戶能夠針對特定場地和時間發起組團，通過審核機制確保活動質量，並在達到最低人數要求時自動轉換為正式活動。

### 1.3 核心價值主張
- **降低組團門檻**：用戶無需預先預訂場地即可發起組團
- **智能匹配**：基於場地時段和運動類型進行精準匹配
- **質量保證**：通過審核機制確保參與者質量
- **自動化流程**：達到最低人數時自動轉換為正式活動

## 2. 目標用戶ㄏ

### 2.1 主要用戶群體
- **運動愛好者**：希望找到志同道合的運動夥伴
- **場地管理員**：需要最大化場地利用率
- **活動組織者**：想要組織高質量的運動活動

### 2.2 用戶需求
- 找到合適的運動夥伴和場地
- 降低個人預訂場地的成本
- 確保活動參與者的質量
- 簡化組團和活動管理流程

## 3. 功能需求

### 3.1 核心功能流程

#### 3.1.1 組團發起流程
1. **場地管理員建立時段**
   - 在系統中建立 `CourtTimeslot`
   - 設定場地、時間、價格等資訊

2. **用戶發起組團**
   - 選擇目標場地時段
   - 設定組團標題、描述、運動類型
   - 設定最低/最高參與人數
   - 設定申請截止時間

3. **系統驗證**
   - 檢查場地時段是否可用
   - 驗證用戶權限
   - 確保沒有重複組團

#### 3.1.2 參與申請流程
1. **用戶申請加入**
   - 瀏覽可用的 TeamUp
   - 提交加入申請（支援會員/非會員）
   - 填寫個人資訊和申請理由

2. **主揪審核**
   - 查看申請者資訊
   - 審核申請理由
   - 決定批准或拒絕

3. **狀態更新**
   - 實時更新參與者數量
   - 檢查是否達到最低人數要求

#### 3.1.3 自動轉換流程
1. **觸發條件**
   - 參與者數量達到 `min_participants`
   - 主揪完成所有審核

2. **自動執行**
   - 建立 `Booking` 記錄
   - 建立 `Event` 記錄
   - 轉移所有參與者
   - 關閉競爭的 TeamUp
   - 發送通知給所有參與者

### 3.2 詳細功能規格

#### 3.2.1 TeamUp 管理
**功能描述**：用戶可以建立、查看、管理 TeamUp

**輸入**：
- 場地時段 ID
- 組團標題（必填）
- 組團描述（選填）
- 最低參與人數（必填，預設 2）
- 最高參與人數（必填，預設 10）
- 申請截止時間（選填）
- 運動類型（選填）

**輸出**：
- TeamUp ID
- 組團狀態
- 當前參與者數量
- 場地資訊

**業務規則**：
- 每個場地時段只能有一個進行中的 TeamUp
- 最低人數必須大於 0
- 最高人數必須大於等於最低人數
- 截止時間必須在場地時段開始之前

#### 3.2.2 加入申請管理
**功能描述**：用戶可以申請加入 TeamUp，主揪可以審核申請

**輸入（會員）**：
- TeamUp ID
- 申請理由（選填）

**輸入（非會員）**：
- TeamUp ID
- 姓名（必填）
- 郵箱（必填）
- 電話（選填）
- 申請理由（選填）

**輸出**：
- 申請 ID
- 申請狀態
- 審核結果

**業務規則**：
- 每個用戶對同一 TeamUp 只能有一個進行中的申請
- 達到最高人數時不再接受新申請
- 只有 TeamUp 主揪可以審核申請

#### 3.2.3 自動轉換機制
**功能描述**：當 TeamUp 達到最低人數時自動轉換為 Event

**觸發條件**：
- 參與者數量 >= min_participants
- TeamUp 狀態為 "open"

**執行步驟**：
1. 建立 Booking 記錄
2. 建立 Event 記錄
3. 轉移所有參與者
4. 關閉競爭的 TeamUp
5. 更新 TeamUp 狀態為 "confirmed"

**業務規則**：
- 轉換過程中確保資料一致性
- 失敗時回滾所有變更
- 發送通知給所有相關用戶

### 3.3 用戶界面需求

#### 3.3.1 TeamUp 列表頁面
- 顯示可用的 TeamUp
- 支援按運動類型、城市、狀態篩選
- 顯示參與者進度條
- 提供申請加入按鈕

#### 3.3.2 TeamUp 詳情頁面
- 顯示完整的 TeamUp 資訊
- 顯示參與者列表
- 顯示場地資訊
- 提供申請加入功能

#### 3.3.3 申請管理頁面
- 顯示所有加入申請
- 提供審核功能
- 顯示申請者詳細資訊

## 4. 技術需求

### 4.1 資料模型

#### 4.1.1 TeamUp
```sql
CREATE TABLE teamups (
    id UUID PRIMARY KEY,
    court_timeslot_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    owner_user_id UUID NOT NULL,
    min_participants INTEGER NOT NULL DEFAULT 2,
    max_participants INTEGER NOT NULL DEFAULT 10,
    deadline TIMESTAMP WITH TIME ZONE,
    sport_type TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

#### 4.1.2 TeamUpJoinRequest
```sql
CREATE TABLE teamup_join_requests (
    id UUID PRIMARY KEY,
    teamup_id UUID NOT NULL,
    applicant_user_id UUID,
    applicant_name TEXT NOT NULL,
    applicant_email TEXT,
    applicant_phone TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE
);
```

#### 4.1.3 TeamUpParticipant
```sql
CREATE TABLE teamup_participants (
    id UUID PRIMARY KEY,
    teamup_id UUID NOT NULL,
    user_id UUID,
    role TEXT NOT NULL DEFAULT 'member',
    display_name TEXT,
    email TEXT,
    phone TEXT,
    join_request_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

### 4.2 API 規格

#### 4.2.1 TeamUp 管理 API
- `POST /teamups` - 建立 TeamUp
- `GET /teamups` - 列出 TeamUp
- `GET /teamups/{id}` - 取得 TeamUp 詳情

#### 4.2.2 申請管理 API
- `POST /teamups/{id}/join` - 申請加入
- `GET /teamups/{id}/join-requests` - 列出申請
- `POST /teamups/{id}/join-requests/{request_id}/review` - 審核申請

### 4.3 系統整合

#### 4.3.1 與現有系統的整合
- 使用現有的 `CourtTimeslot` 模型
- 整合現有的認證系統
- 使用現有的 `Event` 和 `Booking` 模型

#### 4.3.2 資料一致性
- 使用資料庫事務確保一致性
- 實現適當的錯誤處理和回滾機制

## 5. 非功能性需求

### 5.1 性能需求
- TeamUp 列表查詢響應時間 < 500ms
- 申請提交響應時間 < 200ms
- 支援並發 100 個用戶同時使用

### 5.2 可用性需求
- 系統可用性 99.9%
- 支援 7x24 小時運行

### 5.3 安全性需求
- 所有 API 需要適當的認證
- 敏感資料需要加密存儲
- 實現適當的權限控制

### 5.4 可擴展性需求
- 支援水平擴展
- 資料庫設計支援未來功能擴展

## 6. 用戶體驗需求

### 6.1 易用性
- 直觀的用戶界面
- 清晰的操作流程
- 適當的錯誤提示

### 6.2 響應性
- 即時更新參與者數量
- 實時通知申請狀態變化
- 快速載入頁面內容

### 6.3 可訪問性
- 支援多種設備（桌面、平板、手機）
- 符合無障礙設計標準

## 7. 業務規則

### 7.1 組團規則
- 每個場地時段只能有一個進行中的 TeamUp
- 用戶不能對同一 TeamUp 重複申請
- 達到最高人數時停止接受申請

### 7.2 審核規則
- 只有 TeamUp 主揪可以審核申請
- 申請狀態變更需要記錄時間戳
- 被拒絕的申請不能再次提交

### 7.3 轉換規則
- 達到最低人數時自動觸發轉換
- 轉換過程中確保資料完整性
- 轉換失敗時需要適當的錯誤處理

## 8. 成功指標

### 8.1 業務指標
- TeamUp 成團率 > 80%
- 用戶參與度 > 60%
- 場地利用率提升 > 30%

### 8.2 技術指標
- API 響應時間 < 500ms
- 系統可用性 > 99.9%
- 錯誤率 < 0.1%

## 9. 風險評估

### 9.1 技術風險
- 資料庫並發問題
- 自動轉換失敗
- 系統性能瓶頸

### 9.2 業務風險
- 用戶濫用系統
- 場地預訂衝突
- 參與者質量問題

### 9.3 緩解措施
- 實現適當的資料庫鎖定機制
- 建立完善的錯誤處理和監控系統
- 設計合理的業務規則和限制

## 10. 實施計劃

### 10.1 開發階段
1. **第一階段**：核心功能開發（2 週）
   - TeamUp 模型和 API
   - 基本的申請和審核功能

2. **第二階段**：自動轉換機制（1 週）
   - 實現自動轉換邏輯
   - 整合現有 Event 系統

3. **第三階段**：用戶界面（2 週）
   - 前端頁面開發
   - 用戶體驗優化

### 10.2 測試階段
- 單元測試
- 整合測試
- 用戶接受測試

### 10.3 部署階段
- 生產環境部署
- 監控系統設置
- 用戶培訓和支援

## 11. 結論

TeamUp 功能將為平台帶來以下價值：
- 提升用戶參與度和粘性
- 增加場地利用率
- 創造新的商業模式
- 提升平台競爭力

通過合理的技術架構和業務規則設計，TeamUp 功能將成為平台的重要競爭優勢。
