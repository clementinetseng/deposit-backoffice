# Untitled

# Reward History

**玩家獎勵紀錄總表**

這會是之後營運、客服、風控、QA 最常查的一張表。

---

# 先講我對你兩個判斷的結論

## 1. 取消 Player List，只做 Reward History

我支持。

因為你現在真正要查的，不是「玩家這個人」，而是：

> **玩家拿過哪些獎勵、現在跑到哪、能不能被關、是什麼類型、誰發的、何時發的。**
> 

這些都應該在同一張報表裡完成。

---

## 2. 不做展開頁面

我也支持。

如果每一列都做展開，而且展開後才抓資料，確實會有幾個問題：

- 前端交互變重
- server 會有很多零碎請求
- QA 很難測 edge case
- 使用者體驗也不一定比較好

### 我建議

**主表不要做 inline expand。**

改成：

- 主表只顯示核心欄位
- 每列提供 `View`
- 點 `View` 後開 Drawer / Side Panel
- Drawer 再 lazy load 詳細資料

這樣比較穩。

所以你的報表結構應該是：

## 主體

Reward History Table

## 補充細節

Reward Detail Drawer

---

# Reward History 報表的定位

這張表不是單純的 WR 報表，而是：

> **玩家所有獎勵紀錄的統一總表**
> 

未來可收：

- Deposit Bonus
- VIP Reward
- Manual Bonus
- Compensation
- Cashback / Rebate
- KYC Bonus
- Registration Bonus
- 其他 reward 類型

---

# 報表目標

這張表至少要能回答以下問題：

1. 這個玩家拿過哪些獎勵？
2. 這筆獎勵是什麼類型？
3. 有沒有 WR？
4. 現在狀態是什麼？
5. 金額多少？
6. 何時發的？
7. 如果有 WR，現在進度多少？
8. 是誰發的？
9. 是否能做 `Closed`？
10. 對應哪個活動設定 / 哪次派獎來源？

---

# 我建議的完整報表需求

---

# 1. 頁面名稱

## 頁面英文

**Reward History**

## 頁面中文

**玩家獎勵紀錄總表**

---

# 2. 頁面定位

## 目的

提供營運 / 客服 / QA 查詢所有玩家獎勵紀錄，並對「有 WR 且正在進行中」的獎勵執行 `Closed`。

## MVP 範圍

- 查詢
- 篩選
- 排序
- 查看詳情
- 有條件地 `Closed`

---

# 3. 主表欄位設計

我把欄位分成：

- **必要欄位**
- **建議補充欄位**
- **不要先做的欄位**

---

## 3.1 必要欄位

這些我認為一定要有。

| 中文 | 英文 | 說明 |
| --- | --- | --- |
| Reward Record ID | Reward Record ID | 獎勵紀錄主鍵 |
| Player ID | Player ID | 玩家 ID |
| Username | Username | 玩家名稱 |
| Reward Type | Reward Type | 獎勵類型 |
| Reward Name | Reward Name | 活動 / 獎勵名稱 |
| Source Module | Source Module | 來源模組 |
| Has WR | Has WR | 是否有 WR |
| Reward Amount | Reward Amount | 獎勵金額 |
| Current State | Current State | 當前狀態 |
| WR Progress / Target | WR Progress / Target | 有 WR 時顯示 |
| Granted At | Granted At | 發放時間 |
| Ended At | Ended At | 結束時間 |
| Operator | Operator | 若為人工操作 |
| Remark | Remark | 備註 |
| Actions | Actions | View / Closed |

---

## 3.2 我建議一定要再補的欄位

這些你如果不放，之後查案會不夠完整。

| 中文 | 英文 | 說明 |
| --- | --- | --- |
| Promotion Definition ID | Promotion Definition ID | 若此筆來自活動設定 |
| Player Promotion Instance ID | Player Promotion Instance ID | 若此筆為 WR 活動實例 |
| Currency | Currency | V1 雖然可能只有 PHP，但建議保留 |
| Principal Amount | Principal Amount | 有 WR 時非常重要 |
| Close Reason | Close Reason | 若狀態為 CLOSED |
| Created By Type | Created By Type | System / Manual / API |
| Related Wallet Transaction ID | Wallet Transaction ID | 對帳很好用 |

### 為什麼這幾個要補

- **Promotion Definition ID**：知道這筆是從哪個活動來的
- **Player Promotion Instance ID**：WR 類一定要能回追
- **Principal Amount**：未來查 WR 很常用
- **Close Reason**：客服與 QA 一定會問
- **Created By Type**：很快分出是系統送的還是人工送的
- **Wallet Transaction ID**：對帳很重要

---

## 3.3 主表不要先放的欄位

這些不要一開始就塞到主表，會太胖。

- WR Model
- WR Multiplier
- Bonus Cap
- Max Stake Limit
- Full Contribution Rules
- Player Scope
- Eligible Payment Method
- Detailed Terms Summary

這些應放在 `View Detail Drawer` 裡。

---

# 4. Reward Type 建議值

V1 雖然只先做 Deposit Bonus 的建立流程，但總表應該先能容納不同類型。

## 建議枚舉

- `Deposit Bonus`
- `VIP Reward`
- `Manual Bonus`
- `Compensation`
- `Cashback`
- `Rebate`
- `KYC Bonus`
- `Registration Bonus`
- `Other`

### MVP 要求

V1 不一定每種都能從後台建立，但表結構與報表過濾應保留這個欄位。

---

# 5. Has WR 與 Current State 的統一方式

這題很重要，因為有些獎勵有 WR，有些沒有。

## 5.1 Has WR

建議用：

- `Yes`
- `No`

這個欄位很重要，因為它決定：

- 要不要顯示 WR 欄位
- 能不能做 `Closed`

---

## 5.2 Current State

### 有 WR 的獎勵可用：

- `PENDING`
- `ACTIVE`
- `COMPLETED`
- `OUT_OF_BALANCE`
- `CLOSED`

### 無 WR 的獎勵建議先只用：

- `GRANTED`

如果未來需要，再擴：

- `REVOKED`
- `USED`
- `EXPIRED`

### MVP 建議

先不要為了統一而把所有 type 的 state 做太複雜。

只要保證：

- 有 WR 類型 → 用 WR 狀態
- 無 WR 類型 → 至少有 `GRANTED`

就夠了。

---

# 6. Actions 規則

## 每列都要有

- `View`

## 只有符合以下條件才顯示

- `Closed`

### `Closed` 顯示條件

1. `Has WR = Yes`
2. `Current State = ACTIVE`

這條一定要寫死。

---

# 7. 搜尋需求

我建議搜尋分成：

## 7.1 快速搜尋（Top Search）

單一輸入框，可搜尋以下欄位：

- Player ID
- Username
- Reward Name
- Reward Record ID
- Promotion Definition ID
- Player Promotion Instance ID

這樣最實用。

---

# 8. Filter 欄位需求

這張表的 filter 很重要，我建議做以下這批。

---

## 8.1 基本篩選

| 中文 | 英文 | 類型 |
| --- | --- | --- |
| Reward Type | Reward Type | Multi-select |
| Has WR | Has WR | Single-select |
| Current State | Current State | Multi-select |
| Source Module | Source Module | Multi-select |
| Created By Type | Created By Type | Multi-select |

---

## 8.2 時間篩選

| 中文 | 英文 | 類型 |
| --- | --- | --- |
| Granted At | Granted At | Date Range |
| Ended At | Ended At | Date Range |

### MVP 建議

時間篩選先做這兩個就夠。

- 發放時間
- 結束時間

---

## 8.3 金額篩選

| 中文 | 英文 | 類型 |
| --- | --- | --- |
| Reward Amount | Reward Amount | Min / Max |
| Principal Amount | Principal Amount | Min / Max |

### MVP 建議

如果工夠，加上會很好用。

不然 `Reward Amount` 先做即可。

---

## 8.4 操作相關篩選

| 中文 | 英文 | 類型 |
| --- | --- | --- |
| Operator | Operator | Search / Select |
| Close Reason | Close Reason | Multi-select |

這兩個對客服 / QA 很有價值。

---

# 9. 排序需求

## 預設排序

- `Granted At DESC`

## 可排序欄位

- Granted At
- Ended At
- Reward Amount
- Player ID
- Current State

---

# 10. Reward Detail Drawer（詳細資料）

你不想做展開，我支持。

所以每列點 `View` 後，開 Drawer。

---

## Drawer 區塊設計

### 區塊 A：Basic Summary

- Reward Record ID
- Player ID
- Username
- Reward Type
- Reward Name
- Source Module
- Has WR
- Current State
- Reward Amount
- Principal Amount
- Granted At
- Ended At
- Operator
- Remark

### 區塊 B：WR Details（僅 Has WR = Yes）

- WR Model
- WR Multiplier
- WR Target
- WR Progress
- Remaining WR
- Bonus Amount
- Principal Amount
- Max Stake Limit
- Exclude From Rebate Calculation

### 區塊 C：Source Linkage

- Promotion Definition ID
- Player Promotion Instance ID
- Wallet Transaction ID

### 區塊 D：Action

- `Closed`（僅符合條件才顯示）

---

# 11. 效能建議

你剛剛提到的 server 效能，我認為應該這樣定：

## 主表原則

- 不做 inline expand
- 不在列表一次拉太多細節
- 全部走 **server-side pagination**
- 全部走 **server-side filtering**
- 全部走 **server-side sorting**

## Drawer 原則

- 點 `View` 後才 lazy load 詳細資料

這樣最穩。

---

# 12. 報表聚合指標要不要做？

我建議 **MVP 先不做頂部 KPI cards**。

因為你現在要的是查詢報表，不是 dashboard。

真的要做，最多只做這 3 個：

- Total Reward Amount
- Total Records
- Total Participants

但老實說，MVP 可以先不做。

---

# 13. Export 需求

我建議要有，但可以先簡化。

## MVP 建議

- `Export CSV`

### 匯出範圍

- 匯出當前篩選結果
- 不匯出未載入的 Drawer 詳情欄位
- 匯出主表欄位即可

這對客服、營運會很有用。

---

# 14. 完整報表需求整理

下面這份可以直接給 RD / QA 當規格基底。

---

## Reward History 報表需求

### 頁面名稱

- Reward History

### 頁面目的

- 統一查詢玩家所有獎勵紀錄
- 查詢 WR 類與非 WR 類獎勵
- 對 WR 類且正在進行中的獎勵執行 `Closed`

### 主表欄位

- Reward Record ID
- Player ID
- Username
- Reward Type
- Reward Name
- Source Module
- Has WR
- Reward Amount
- Principal Amount
- Current State
- WR Progress / Target
- Granted At
- Ended At
- Operator
- Remark
- Actions

### 搜尋

- Player ID
- Username
- Reward Name
- Reward Record ID
- Promotion Definition ID
- Player Promotion Instance ID

### Filters

- Reward Type
- Has WR
- Current State
- Source Module
- Created By Type
- Granted At
- Ended At
- Reward Amount
- Principal Amount
- Operator
- Close Reason

### 排序

- Granted At DESC（預設）
- Ended At
- Reward Amount
- Player ID
- Current State

### Actions

- View：全部都有
- Closed：僅 `Has WR = Yes` 且 `Current State = ACTIVE`

### 詳情顯示

- 以 Drawer 呈現
- 點 View 才 lazy load

### 效能要求

- Server-side pagination
- Server-side filtering
- Server-side sorting
- 不做 inline expand

### 匯出

- Export CSV
- 匯出當前篩選結果

---

# 15. 我對這個方向的最終判斷

我認為這樣改之後，整個後台會更合理：

- **取消 Player List**
- **用 Reward History 當統一查詢入口**
- **未來 VIP 也能共用**
- **WR 與非 WR 同表管理**
- **主表輕量、詳情 Drawer lazy load**
- **效能與擴充都比較穩**

這個方向我支持。

如果你要，我下一步可以直接幫你把目前那份 **Backoffice MVP PRD 整份改寫成 Reward History 版本**，把 Player List 全部拿掉、改成新架構。