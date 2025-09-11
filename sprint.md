# 🏀 Team_Up - Sprint 1

**期間**: 2 週  
**目標**: 完成專案初始化，建立資料庫結構與基礎基礎工具鏈，為 Sprint 2 的 API 與前端串接打底。

---

## 🎯 Sprint Goal
- 初始化專案環境（monorepo、pnpm workspace）
- 設定後端資料庫與 migration 工具
- 定義基本資料模型（events）
- 建立 OpenAPI 規格初版
- 建立 API client 自動產生流程雛型

---

## 📝 Backlog

### 1. 專案初始化
- [x] 設定 monorepo（pnpm workspaces）
- [x] 建立後端服務目錄 `services/api`
- [x] 建立前端專案 `apps/web`
- [x] 設定環境變數管理 `.env`

### 2. 資料庫
- [x] 安裝並設定 Postgres + PostGIS
- [x] 加入 Alembic migration 工具
- [x] 建立第一版 migration (`events` table)

### 3. API & OpenAPI
- [x] 建立 `openapi.yaml` 初版
- [x] 設定 codegen pipeline（使用 @openapitools/openapi-generator-cli）
- [x] 產生初版 API client（`packages/api-client`）

### 4. 開發工具
- [x] 設定基本 lint / prettier / tsconfig
- [x] 加入 Git hooks（pre-commit / pre-push）
- [x] Docker Compose 建立 DB + API 本地測試環境

---

## ✅ Definition of Done
- 專案可以在本地正確啟動（API + DB）
- Alembic migration 成功建立 `events` table
- 初版 OpenAPI 規格可用，能生成 API client
- 前後端皆可安裝並跑通基本開發環境

---

## 🕒 時程建議 (14 天)

| 日程 | 任務 |
|------|------|
| Day 1–2 | 設定 monorepo 結構、pnpm workspace |
| Day 3–4 | DB & Alembic 初始化 |
| Day 5–7 | 設定 events table migration |
| Day 8–9 | 撰寫 openapi.yaml 初版 |
| Day 10–11 | 設定 API client codegen pipeline |
| Day 12–13 | 建立 lint / prettier / tsconfig，加入 Docker Compose |
| Day 14 | 測試與驗收 |

---

# 🏀 Team_Up - Sprint 2

**期間**: 2 週  
**目標**: 建立完整的 **認證 + 活動 MVP** 流程，讓前端能透過自動產生的 API client 與後端互動。

---

## 🎯 Sprint Goal
- 實作 JWT 認證（signup / login / refresh / me）
- 完成 Events API MVP（list / create / join / leave）
- 調整 OpenAPI 規格，加上 `tags`、`required`、`operationId`
- 前端成功串接 API client，完成 **signup → login → create event → list events → join/leave** 的端到端流程

---

## 📝 Backlog

### 1. 認證系統
- [x] JWT middleware：簽發/驗證 access_token + refresh_token
- [x] `POST /auth/signup`：使用者註冊
- [x] `POST /auth/login`：使用者登入，回傳 Tokens
- [x] `POST /auth/refresh`：刷新 access_token
- [x] `GET /auth/me`：回傳目前使用者資訊
- [X] `PATCH /auth/me`: 修改目前使用者資訊

### 2. 活動系統 MVP
- [x] `GET /events`：支援查詢 (lat/lng/radius/sport/start/end) + 分頁
- [x] `POST /events`：建立活動（需登入）
- [x] `POST /events/{id}/join`：加入活動（需登入、檢查重複與名額）
- [x] `DELETE /events/{id}/leave`：退出活動（需登入）
- [x] `GET /events/{id}`（可選）：取得單一活動詳細資訊

### 3. API 規格 & Client
- [x] 更新 `openapi.yaml`：新增 `tags`、`operationId`、補上 `required`
- [x]  重新 codegen → 產出 `AuthApi`, `EventsApi`, `HealthApi`
- [x] 前端 `apps/web` 串接 API client（含 refresh token 機制）

### 4. 測試 / 驗證
- [x] Postman / curl 測試所有 API
- [x] E2E 測試流程：
  1. signup / login
  2. create event
  3. list events
  4. join / leave event

---

## ✅ Definition of Done
- OpenAPI 規格與後端實作一致
- JWT 登入/刷新/驗證跑通
- 前端能透過 api-client 完成端到端流程
- 至少一條 Happy Path 測試成功（signup → login → create → join/leave）

---

## 🕒 時程建議 (14 天)

| 日程 | 任務 |
|------|------|
| Day 1–2 | 完成 JWT middleware + auth routes |
| Day 3–5 | 完成 events CRUD + join/leave |
| Day 6–7 | 調整 openapi.yaml（tags/operationId/required）+ codegen |
| Day 8–10 | 前端串接 api-client（含 refresh） |
| Day 11–12 | E2E 測試（完整流程） |
| Day 13–14 | Bugfix, Code Review, Merge |
---

# 🏀 Team_Up - Sprint 3

## 🎯 Sprint Goal
建立基本的 **登入 → 瀏覽活動 → 參加活動** 流程，強化活動 API 與前端串接，完成 E2E MVP。

---

## 📌 Backlog

### 1. Events 功能進階
- [x] 在 `events` schema 增加 **capacity** 欄位
- [x] 加入 **活動狀態**：可報名 / 進行中 / 已結束
- [x] **報名檢查**：加入活動需判斷剩餘名額
- [ ] **活動搜尋 / 篩選**：依運動種類、日期
- [ ] **活動清單排序**：預設依時間排序（最近 → 最遠）

### 2. 前端串接 MVP
- [ ] **登入頁**：呼叫 `auth.login` / `auth.signup`，token 存入 localStorage
- [ ] **活動列表頁**：呼叫 `events.list`，顯示活動卡片
- [ ] **活動詳情頁**：呼叫 `events.get`，顯示細節與報名按鈕
- [ ] **加入/退出活動**：呼叫 `events.join` / `events.leave`
- [ ] **Token refresh 支援**：401 時自動 refresh 後重試

### 3. API Client 改善
- [ ] 完善 `withRefresh` 機制
- [ ] 在 wrapper 提供直覺的 `api.auth.me()`、`api.events.list()` 方法
- [ ] 統一 **環境變數**：`NEXT_PUBLIC_API_URL`、`NEXT_PUBLIC_API_BASE_URL`

### 4. 開發工具 & CI
- [ ] CI 增加 **codegen 驗證**：確保 `openapi.yaml` 與 client 一致
- [ ] CI 增加 **前端 lint/build** 檢查
- [ ] （可選）初版 E2E 測試（Playwright/Cypress）

---

## ✅ Definition of Done
1. `capacity` 與活動狀態邏輯完成，API 回傳 status 與剩餘名額  
2. 前端可完成「登入 → 瀏覽活動 → 參加活動」完整流程  
3. Token refresh 機制正常運作  
4. CI 能跑通 `pnpm codegen` + `pnpm -r build`  

---

## 🕒 Timeline (2 週 Sprint)
- **Day 1–3**: 後端 capacity / 狀態 / filter / sort  
- **Day 4–6**: 前端登入頁、活動清單、詳情頁  
- **Day 7–8**: 加入/退出活動 + token refresh  
- **Day 9–10**: 整合 E2E MVP 測試  
- **Day 11–12**: CI codegen & 前端 build 驗證  
- **Day 13–14**: Bugfix、Code Review、Merge  
