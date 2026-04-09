# Promotion & Wagering Engine PRD

## 1. 文件目的（Purpose）

**模組分類：** 促銷活動與流水計算方式與底層運作邏輯

**文件定位：** 本文件定義平台共用之帶有 WR（Wager Requirement，流水要求）活動的核心業務規則、狀態流轉、錢包狀態、流水計算、提款限制、活動關閉與人工處理流程。

**V1 重點：** 第一階段以**玩家主動參加的儲值型活動**為主，但引擎保留未來支援其他帶 WR 獎勵類型。

---

## 2. 文件範圍（Scope）

### 2.1 本文件涵蓋範圍

本文件涵蓋：

- 活動設定與玩家活動實例的定義
- 玩家參加流程
- bonus 入帳規則
- 單一錢包綁定規則
- WR 三種計算模型
- 有效流水判定
- 單注上限與貢獻度覆寫
- 單一 `ACTIVE` 與 `PENDING/FIFO`
- 活動狀態流轉
- 活動關閉與人工處理
- 前台必要提示與入口阻擋
- 稽核與 QA 驗收重點

### 2.2 本文件不涵蓋範圍

以下不在本文件展開：

- 非現金獎勵完整結算
- 完整前台 UI 視覺稿
- 完整後台頁面視覺稿

---

## 3. 固定原則（Fixed Principles）

1. **帳戶、多錢包與 WR層級**：一個帳戶可以擁有多個錢包(線上、線下)，每個錢包之間的活動不互通，是獨立的存在。此規格的定位是：**一套可套用於指定錢包的活動規則能力。(V1 only線上)**
2. **單一資金**：玩家只有一個 `Total Balance`。
3. **不分子錢包**：不建立 `Bonus Wallet` 或 `Promotion Wallet`。
4. **玩家主動參加**：V1 活動成立方式固定為玩家在儲值頁主動勾選活動，且符合條件的儲值成功後建立。
5. **單一 `ACTIVE`**：同一時間只允許一個 `ACTIVE` 玩家活動實例。
6. **`PENDING/FIFO`**：其他活動進入 `PENDING`，依建立時間先後遞補。
7. **`PENDING` bonus 立即入帳**： `PENDING` bonus 可在前一個 `ACTIVE` 活動期間先被使用。
8. **提款全鎖**：當玩家存在 `ACTIVE` 活動時，由該活動造成的提款限制為全面封鎖。
9. **`COMPLETED` / `OUT_OF_BALANCE` 正常解鎖**：這兩種終態會解除活動造成的提款限制。
10. **`CLOSED` 直接清空餘額**：`CLOSED` 時系統直接將玩家當前 `Total Balance` 清為 0。
11. **`CLOSED` 一次清空 queue**：當前 `ACTIVE` 與所有 `PENDING` 一併關閉，不自動遞補。
12. **後續完全人工處理**：`CLOSED` 後由客服 / 營運透過 manual adjustment 手動返還、補償或調整。
13. **終態不可重啟**：活動一旦進入終態，不得因後續結算資料而復活。

---

## 4. 核心名詞與資料模型

### 4.1 活動設定（Promotion Event）

由後台建立與管理的活動主檔，用來定義：

- 活動名稱
- 活動類型
- 參加門檻
- bonus 規則
- WR 模型
- WR 倍數
- 單注上限
- 遊戲貢獻度規則
- 其他限制條件

活動設定可有自己的管理狀態，例如：

- `Draft`
- `Enabled`
- `Disabled`

**活動設定 ID** 為活動主檔的唯一識別。

### 4.2 玩家活動實例（Player Promotion Instance）

當玩家實際符合條件並成功參加活動後，系統根據某一筆活動設定，在玩家身上建立的一筆獨立活動紀錄。

玩家活動實例至少需包含：

- 玩家活動實例 ID
- 對應的活動設定 ID
- Player ID
- 本金金額（Deposit Amount）
- 紅利金額（Bonus Amount）
- WR 模型（WR Model）
- WR 倍數（WR Multiplier）
- WR Target
- WR Progress
- 當前狀態（Current State）
- 建立時間（Created At）
- bonus 入帳時間（Bonus Granted At）
- 結束時間（Ended At）
- remark 與操作紀錄

其中以下欄位均為**建立當下固定下來的值**，後續不因新增儲值或新增 bonus 而改寫：

- Principal Amount
- Bonus Amount
- WR Model
- WR Multiplier
- WR Target

後續新增的儲值或 bonus，雖不改變既有玩家活動實例的計算基礎，但會進入玩家的 `Total Balance`，並在 Sticky 模式下受當前 `ACTIVE` 活動規則影響。

### 4.3 本金金額（Principal Amount）

WR 計算使用的本金來源。

V1 以儲值型活動為主，因此：

- `Principal Amount = Qualifying Deposit Amount`

未來若為無儲值活動，可為 0。

### 4.4 紅利金額（Bonus Amount）

活動發放給玩家的 bonus 金額。

### 4.5 流水目標（WR Target）

玩家需要完成的總流水要求。

### 4.6 流水進度（WR Progress）

玩家目前已完成的有效流水累積值。

### 4.7 已結算有效流水金額（Settled Valid Turnover）

經系統確認已完成結算，且符合當前活動有效條件之投注金額。

這是流水推進的唯一基礎口徑。

---

## 5. 玩家參加與活動建立

### 5.1 參加方式

V1 固定流程如下：

1. 玩家在儲值頁主動勾選活動。
2. 玩家送出符合條件的儲值。
3. 金流確認成功。
4. 系統校驗是否符合活動資格。
5. 系統建立玩家活動實例。
6. 系統依規則發放 bonus，並決定該實例為 `ACTIVE` 或 `PENDING`。

### 5.2 冪等保護

系統必須保證：

- 同一個合法觸發事件，只能建立一筆玩家活動實例。
- 同一個合法觸發事件，只能發放一次 bonus。

### 5.3 資格檢查

建立玩家活動實例前，系統必須校驗：

- 玩家是否已達該活動的可領取次數上限
- 該筆儲值是否符合最低 / 最高門檻
- 該筆儲值是否符合活動要求的支付方式或其他條件

---

## 6. Bonus 入帳與單一錢包綁定

### 6.1 單一錢包原則

平台底層不建立 `Bonus Wallet` 或 `Promotion Wallet`。

所有資金都直接體現在玩家的 `Total Balance` 中。

### 6.2 Bonus 入帳規則

- 若玩家活動實例建立後直接成為 `ACTIVE`，bonus 立即入帳至 `Total Balance`。
- 若玩家活動實例建立後進入 `PENDING`，bonus 也立即入帳至 `Total Balance`。

平台接受以下結果：

- `PENDING` bonus 可能在前一個 `ACTIVE` 活動期間先被使用、被輸掉、或混入派彩。
- 當該 `PENDING` 活動後續轉為 `ACTIVE` 時，其 WR 債務仍須從 0 開始照常完成。

### 6.3 單一錢包綁定（Sticky Bonus / Fund Binding）

當玩家存在一個 `ACTIVE` 活動時：

1. 玩家仍只有一個 `Total Balance`。
2. 該玩家所有可下注餘額都受當前 `ACTIVE` 活動規則約束。
3. 活動期間額外儲值進來的資金，也一併受當前 `ACTIVE` 活動限制。

### 6.4 活動期間額外儲值

當玩家已有 `ACTIVE` 活動時再次儲值：

- 該筆資金直接進入 `Total Balance`
- 該筆資金受當前 `ACTIVE` 活動限制
- 玩家不得將這筆新資金視為可獨立提款資金

---

## 7. WR 三種計算模型（Three WR Models）

引擎必須支援以下三種 WR 計算方式：

### 7.1 模型 A：本金金額 + 紅利金額

適用於：

- 首儲活動
- 高額儲值回饋

公式：

**WR Target = (Principal Amount + Bonus Amount) × WR Multiplier**

### 7.2 模型 B：本金金額

適用於：

- 只要求本金打碼的活動

公式：

**WR Target = Principal Amount × WR Multiplier**

### 7.3 模型 C：紅利金額

適用於：

- 無儲值送彩金
- KYC bonus
- 任務完成送 bonus

公式：

**WR Target = Bonus Amount × WR Multiplier**

---

## 8. WR 流水推進規則（WR Progress Rules）

### 8.1 哪些注單可以算流水

注單必須同時滿足以下條件，才能計入 WR：

1. 玩家活動實例狀態為 `ACTIVE`
2. 注單已結算（Settled）
3. 只算有效turnover(Valid Turnover)
4. 注單未被系統視為無效
5. 注單未違反單注上限
6. 注單命中的遊戲 / 供應商 / 類別具有有效貢獻度

### 8.2 單注上限（Max Stake Rule）

若：

**Bet Amount > Max Stake Limit**

則：

- 該注單的流水貢獻強制為 0，不拆分、不部分認列

### 8.3 流水貢獻度採三層覆寫（Cascading Override）

1. **Game ID 覆寫**
2. **Provider 覆寫**
3. **Category Default（類別預設值）**

### 8.4 Category Default 必填

每個遊戲都必須映射到一個 `Category`。

每個 `Category` 都必須配置一個預設流水貢獻度。

### 8.5 流水推進公式

**Added WR = Settled Valid Turnover × Final Contribution Rate**

**WR Progress(new) = WR Progress(old) + Added WR**

當：

**WR Progress >= WR Target**

時，系統必須立即將玩家活動實例狀態切為 `COMPLETED`。

---

## 9. 活動狀態定義與 FIFO

### 9.1 正式狀態

- `PENDING`
- `ACTIVE`
- `COMPLETED`
- `OUT_OF_BALANCE`
- `CLOSED`

### 9.2 各狀態定義

#### `PENDING`

- 活動已成立
- bonus 已入帳
- 尚未開始累積 WR
- 自身不產生新的提款限制
- 玩家是否能提款，取決於是否存在 `ACTIVE` 活動或其他系統限制

#### `ACTIVE`

- 當前唯一生效中的活動
- 結算後的有效投注會累積 WR
- 由活動造成的提款限制生效

#### `COMPLETED`

- `WR Progress >= WR Target`
- 活動正常完成
- 活動造成的提款限制解除
- 為終態，不可逆

#### `OUT_OF_BALANCE`

- WR 尚未完成
- 但玩家已無足夠餘額再透過正常投注推進活動
- 活動造成的提款限制解除
- 為終態，不可逆

#### `CLOSED`

- 活動被人工或系統強制終止
- `CLOSED` 時，當前 `ACTIVE` 與所有 `PENDING` 一併關閉
- 系統直接將玩家當前 `Total Balance` 清為 0
- 後續若需返還、補償或調整金額，由客服 / 營運透過 manual adjustment 處理
- 為終態，不可逆

### 9.3 單一 `ACTIVE`

同一時間只允許一個 `ACTIVE` 玩家活動實例。

### 9.4 FIFO 遞補

當前 `ACTIVE` 進入 `COMPLETED` 或 `OUT_OF_BALANCE` 後：

- 系統自動檢查 `PENDING` 佇列
- 將建立時間最早的下一筆玩家活動實例遞補為 `ACTIVE`

### 9.5 `CLOSED` 對佇列的影響

當目前 `ACTIVE` 活動進入 `CLOSED` 時：

- 系統不得自動遞補下一筆 `PENDING`
- 系統應將該玩家所有 `PENDING` 活動一併切換為 `CLOSED`
- 此設計目的是在人工處理時，一次清空該玩家當前所有 bonus / WR queue，避免後續活動殘留或在 adjustment 後再次自動綁定玩家資金

---

## 10. 提款限制與玩家功能鎖

### 10.1 `ACTIVE` 期間的提款限制

當玩家存在 `ACTIVE` 活動時：

- 玩家不得提款
- 由該活動造成的提款限制為全面封鎖

### 10.2 提款限制的責任邊界

Promotion Engine 只負責活動造成的提款限制。

最終是否允許提款，仍由伺服器綜合以下因素統一判斷：

- Promotion
- KYC
- AML
- Risk
- 其他帳戶限制

### 10.3 `Closed` 後的處理方式

當營運在 Player List 中對當前 `ACTIVE` 的玩家活動實例按下 `Closed` 時，系統必須於同一筆後端操作中自動完成以下事項：

1. 將該筆 `ACTIVE` 玩家活動實例狀態改為 `CLOSED`
2. 將該玩家所有 `PENDING` 玩家活動實例一併改為 `CLOSED`
3. 直接將玩家當前 `Total Balance` 清為 0
4. 記錄操作人、操作時間、關閉原因與備註

### 10.4 `Closed` 後的人工處理

活動進入 `CLOSED` 後：

- 客服 / 營運應透過 manual adjustment 流程，決定是否返還部分或全部金額
- 客服 / 營運亦可依個案進行補償或其他人工調整
- 本引擎不自動計算應返還金額，也不自動補償

---

## 11. `OUT_OF_BALANCE` 與餘額處理

### 11.1 `OUT_OF_BALANCE` 觸發條件

同時滿足以下條件時，可判定為 `OUT_OF_BALANCE`：

1. `Total Balance < Global Min Bet Amount`
2. `Unsettled Bets Count = 0`

### 11.2 `OUT_OF_BALANCE` 後處理

當玩家活動實例符合 `OUT_OF_BALANCE` 觸發條件時，系統執行以下動作：

- 將該筆玩家活動實例狀態切為 `OUT_OF_BALANCE`
- 解除該筆活動造成的提款限制
- 若有 `PENDING`，遞補下一筆為 `ACTIVE`

若下一筆遞補後的 `ACTIVE` 活動仍立即符合 `OUT_OF_BALANCE` 觸發條件，系統應於同一輪流程中再次判定，並可連續切換為 `OUT_OF_BALANCE`，直到：

1. 出現一筆可正常運作的 `ACTIVE` 活動，或
2. `PENDING` 佇列已空

### 11.3 餘額

當活動因 `OUT_OF_BALANCE` 結束時：

- 剩餘微小餘額不沒收
- 保留於 `Total Balance`
- 視為玩家自由可用餘額

---

## 12. 前台必要依賴

### 12.1 玩家參加前提示（在首儲規格撰寫）

### 12.2 進行/排隊中的活動資訊（在首儲規格撰寫）

### 12.3 遊戲入口阻擋

若某遊戲被當前活動明確排除：

- 前台應直接阻擋玩家進入遊戲入口

### 12.4 低貢獻遊戲提示

若某遊戲可進入，但流水貢獻度低於 100%：

- 前台需於進入前提示其貢獻度
- 前台應在活動資訊處可再次查閱該規則

### 12.5 `CLOSED` 後前台行為

當玩家活動被 `CLOSED` 並完成系統處理後：

- 玩家錢包餘額將顯示為 0
- 後續若有返還、補償或其他調整，以客服 / 營運 manual adjustment 結果為準

---