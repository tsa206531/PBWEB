# PRD — 權益層與授權碼驗證（Entitlement & Licensing）

## 1. 文件資訊

| 欄位 | 內容 |
|---|---|
| 名稱 | PromptBox 權益層與授權碼驗證 |
| 代號 | FP02 階段 C1（entitlement）／接 FP03 Hybrid「第一筆營收最小接縫」 |
| 日期 | 2026-06-16 |
| 狀態 | 📝 草稿（Draft，尚未實作） |
| 負責人 | Chen Yin Lian |
| 文件放置位置 | `Doc/Future plans/PRD_Entitlement_Licensing.md` |
| 上位決策 | [ADR-005 §四/§七](../ADR/ADR-005.md)（乾淨 build / 信任邊界 / 離線弱授權）、[ADR-002 §6](../ADR/ADR-002-商業化與部署模式.md)（買斷、地端優先、不自建後端）、[FP02 §2.1](../Future%20plans/FP02.md)（`entitlement.cjs` 接縫）、[FP03 §三/六](../Future%20plans/FP03.md)（Hybrid 順序） |
| 取代 | [V2.1 PRD Freemium](../web/V2.1_PRD_Freemium.md) 的**線上 API 驗證**做法（與「不打電話回家」隱私立場衝突，本 PRD 改為離線簽章弱驗證）；功能分層思路保留 |

> **一句話**：核心永遠免費且不聯網；付費走「**買斷當前版本（永久可用）+ 更新權年費續訂**」，授權用**你私鑰簽、App 公鑰離線驗**的弱驗證 token；
> 真正的能力閘門在 **main process**（renderer 永不可信）；企業/醫療地端用「**乾淨 build + 站點授權檔 + 合約**」，**不靠密碼狗**。

---

## 2. 本版核心問題（只寫一個）

**如何在「不打電話回家、可離線、可驗證隱私」的前提下，建立一條能收到第一筆錢、又不在未來重構時被丟棄的最小授權接縫？**

---

## 3. 背景與動機

- **為什麼現在做**：產品已具差異化護城河（中立 + 安全：MCP、卡片級加密、資料鎖），但全功能免費、無升級誘因、開發無穩定收入（FP03 §一）。
- **為什麼不照 V2.1 那版做**：V2.1 用 Lemon Squeezy **線上 API 驗證 License Key**，每次（或偶爾）要連網驗真——與 [ADR-005 §七](../ADR/ADR-005.md) 的隱私立場「不打電話回家」衝突。本 PRD 改為**離線簽章 token**，把「線上」這一步移到**人工頻道外**（購買時 email 發 key），App 端全程離線。
- **為什麼是「最小接縫」**：FP03 已裁定 Hybrid——第一筆營收走最小 gate，但 gate 種在「未來 registry 也會用的同一個 `entitlement` 接縫」上，不是丟棄品。
- **不做會怎樣**：持續零營收零驗證；或反過來，為了授權做一堆重 DRM（密碼狗、node-lock）過度工程，違反 [ADR-005 §七](../ADR/ADR-005.md)「Pro 走弱授權、接受一定比例被破解」。

---

## 4. 版本與分層定義

### 4.1 三軸定位（破除「並列版本」誤會，依 [ADR-005 §三](../ADR/ADR-005.md)）

| 線 | 軸 | 拓樸 | 授權機制 |
|---|---|---|---|
| 免費版 / 個人進化版 | **同一 mode（本地）的容量分級** | local-first，單機 | 離線簽章弱驗證 |
| 團隊雲端版 | **換 mode（cloud）** | client/server | **伺服器端權益（強驗證，伺服器即權威）** |
| 企業/醫療地端 | **mode（on-prem）+ compliance 層** | 客戶內網 / 氣隙 | 乾淨 build + 站點授權檔 + 合約 |

> 重點：這**不是 5 個並列 edition**，是 **2~3 個 mode × 容量/功能 tier × 合規層**。定價與工程依此切，才不會打架。

### 4.2 免費版限制（Free）

| 項目 | 免費上限 | 備註 |
|---|---|---|
| 卡片數 | **50 張** | 容量感，付費解除 |
| 資料夾數 | **3 個** | 容量感，付費解除 |
| 卡片串聯 | **最多串接 3 張** | 「試吃」串聯功能 |
| 每卡變數數 | **35 個** | 軟上限，多數 prompt 用不到 35；有感但幾乎不痛（已決 U1） |
| MCP | ✅ 保留 | 安全/中立護城河，免費才有意義 |
| 加密鎖 / 機密卡片 | ✅ 保留 | 同上，安全為品牌核心 |

> **設計原則**：免費限制要「有感但不痛苦」——容量類（卡數/資料夾）是自然的升級觸發點；**功能殘缺類（如砍變數數）會惹人厭，避免**。

### 4.3 個人進化版（Personal）

- **模式**：**買斷當前版本（永久可用）+ 更新權續訂**——首購含一段更新權；續訂只買「繼續拿新更新」，**不續訂仍永久可用**最後拿到的版本（Sublime Text / 獨立工具標準做法）。詳見 §5.1。
- **內容**：解除 §4.2 所有容量限制。
- **定價（方向已定，數字待 §11 U2 微調）**：
  - 首購 **US$25~29**：解鎖全部限制 + 含 **12 個月更新權** + 永久 fallback。
  - 第二年起續訂（再買 12 個月更新權）：**40% 優惠**（≈ US$15~17/年）。不續訂 = 停在最後版本永久用，App **不會 time-bomb**。
  - 預付促銷：**連買 2 年送 1 年**（共 36 個月更新權）。
- **聯合購買促銷**：**買 4 送 1**——機制 = 一次付 4 份、發 5 把獨立 key，無額外架構成本。

### 4.4 團隊雲端版（Team）

- **mode 變更（cloud）**：屬 server 側 greenfield，**本 PRD 不設計其授權機制**——一旦有伺服器，**伺服器自己就是權威（強驗證）**，不需要也不該用離線弱簽章。
- 定價、帳號、多人共享 → 待第一個付費個人版驗證後另立 PRD（[ADR-002 §6](../ADR/ADR-002-商業化與部署模式.md) 不平行開發）。

### 4.5 企業內部地端 / 醫療內部（Enterprise / Medical on-prem）

見 §7。**標準防線 = 乾淨 build + 站點授權檔 + 合約；密碼狗僅作氣隙單機逐案 add-on，不是標配。**

---

## 5. 授權模型決策

### 5.1 收費模型：買斷 + 更新權（為何不是訂閱、卻仍年年有收入）

> 關鍵洞見：**「更新權」的到期把關在「你的下載／購買伺服器」，不在使用者執行中的 App。** 你拿到年度續訂收入，App 端卻完全不需要做任何時間檢查。

- **買斷 ≠ 凍結，也 ≠ 時間炸彈**：付一次 → **永久可用當前版本**；更新權到期只代表「**不能再下載更新**」，已安裝版本照常永久跑。
- **為何與離線弱驗證相容**：
  - 訂閱制最怕使用者**把系統時間往回調**騙過期；本模型**執行中的 App 從不檢查到期**——`updatesUntil` 只是**資訊欄位**，由下載伺服器在使用者**主動**抓更新時驗，App runtime 永不 time-bomb。
  - 故「不打電話回家」成立（唯一伺服器接觸 = 使用者自願下載更新），弱驗證足夠（[ADR-005 §七](../ADR/ADR-005.md)）。
- **年度收入來源 = 續訂更新權**（你想推新功能、使用者想拿 → 自然續）。另一相容槓桿是**大版本升級費**（`maxVersion`），兩者可單用或併用。
- 呼應 [ADR-002](../ADR/ADR-002-商業化與部署模式.md)「本地端應用適合買斷」，同時解掉「買斷沒有 recurring 收入」的顧慮。

### 5.2 信任邊界（defense-in-depth，[ADR-005 §七](../ADR/ADR-005.md)）

- **唯一可信閘門在 main process**：未授權的能力，其 IPC handler / 容量上限檢查**在 main 強制**；免費上限（卡數/資料夾）由 `promptHandlers` 在 create 時擋。
- **renderer `licenseStore` 永不可信**：只負責「藏 UI / 顯示 👑 upsell」，不可作為真正的能力判定。

### 5.3 Mod / 付費模組的關係（現在不做，但留位子）

- **第一個付費版不需要任何 mod**——就是 §4.3「解除容量限制」（FP03 候選 1）。
- token 格式預留 `entitlements: []`，未來要加 mod（如 **AI 包**，[ADR-002](../ADR/ADR-002-商業化與部署模式.md) Pro 內容、唯一天生需聯網者）只填旗標，**無新基礎設施**。
- registry / 完整模組契約屬 [FP02 階段 B3/C](../Future%20plans/FP02.md)「看商業確定性才做」，**本 PRD 排除**。

---

## 6. 技術架構

### 6.1 授權 Token 結構（離線、簽章、弱驗證）

```jsonc
// 你用私鑰簽，App 內嵌公鑰驗。私鑰永遠不進 binary。
{
  "v": 1,                  // token 格式版本
  "type": "personal",      // "personal" | "site"
  "customer": "buyer@email | 組織名",
  "updatesUntil": "2027-06-16", // 更新權到期【僅資訊欄位】：由下載伺服器驗；App runtime 從不據此鎖功能
  "maxVersion": 3,         // （選用槓桿）大版本上限：appMajor <= maxVersion 才解鎖；不用可省略
  "entitlements": [],      // 未來 mod 旗標；core 不需要，留空
  "seats": 1,              // personal=1；site=N（見 §7）
  "machineId": null,       // v1 一律 null（不綁機器）；phase-2 node-lock 才填指紋
  "issuedAt": "2026-06-16"
  // 刻意【無】runtime 到期欄位 → App 永不 time-bomb（見 §5.1）
  // signature: Ed25519(canonical(payload), privateKey)
}
```

- **演算法**：Ed25519（小、快、現代）。**私鑰離線保管**（簽 key 用一支小工具或 serverless function，不在 App 內）。**公鑰嵌在 binary**。
- **偽造防線**：沒私鑰簽不出合法 token；改 `maxVersion`/`seats`/`machineId` → 簽章立刻失效。
  （但**移除整段檢查**仍可破——這是弱驗證，符合 [ADR-005 §七](../ADR/ADR-005.md)「接受一定比例被破解」。）

### 6.2 驗證流程（main process）

```
1. 讀本機加密儲存的 token + sig
2. 公鑰驗章 → 失敗 ⇒ 視為 Free（不阻擋使用，僅鎖付費功能）
3. （若採 maxVersion 槓桿）appMajor > token.maxVersion ⇒ 視為 Free（提示升級至新版本線）
4. token.machineId != null 且 ≠ 目前指紋 ⇒ 視為 Free（phase-2 才會走到）
5. 全通過 ⇒ 授權成立，套用 entitlements；解除容量上限
※ runtime【不檢查】updatesUntil／到期日——到期只擋「下載新版」，不擋執行（§5.1）
```

> **優雅退化**：任何驗證失敗都是**安全退回免費版**（fail-safe，[ADR-002 §1](../ADR/ADR-002-商業化與部署模式.md)），絕不當機、絕不鎖死既有本地資料。

### 6.3 本機儲存

- 用 Electron `safeStorage` 加密後存入設定（`electron-store` / 設定檔），**不入 SQLite**（避免與 prompt 資料耦合，沿用 V2.1 §6.3 決策）。
- 可複用既有 `services/keyService.cjs` / `cryptoService.cjs` 的金鑰存取基礎設施。

### 6.4 entitlement 接縫（FP03 的「種子」）

- 新增 `electron/platform/entitlement.cjs`，最小對外面：
  ```js
  isPro()              // = 有效 token && appMajor <= maxVersion
  isEntitled(key)      // = isPro() && entitlements.includes(key)；v1 mod 為空恆走 isPro
  ```
- **這不是完整 registry**，但與未來 registry 共用同一個 `entitlement`——升級不重做（[FP03 §三](../Future%20plans/FP03.md)）。

### 6.5 付費平台（不自建後端）

- 用現成金流發 key：**Lemon Squeezy**（對個人開發者友善、支援台灣金流、自動處理 VAT；[V2.1 §6.4](../web/V2.1_PRD_Freemium.md)）或 Gumroad / Stripe Payment Link。
- **平台只負責結帳 + 把 token 寄給使用者**（email / license 欄位）。**App 端不呼叫平台 API**——token 由你（離線簽章工具）產生，平台代為遞送。這就把 V2.1 的「線上驗證」改成「線下發放 + 離線驗章」，兌現隱私立場。

---

## 7. 企業 / 醫療地端：乾淨 build + 站點授權檔（不靠密碼狗）

### 7.1 為何不用密碼狗

| 問題 | 說明 |
|---|---|
| 席次不擴展 | N 人 → N 支狗，採購/燒錄/寄送/RMA 全是成本 |
| 環境敵意 | 企業/醫院**常禁 USB**、**VDI 無 USB passthrough**、資料中心伺服器無人插狗 |
| 粒度錯 | 企業要**站點/組織授權**，非逐台綁定 |
| 威脅模型錯 | 企業**不盜版**（靠合約，被稽核代價遠大於授權費）；密碼狗對**合規**亦零幫助 |

### 7.2 做法 A — 乾淨 build（per-customer，[ADR-005 §四](../ADR/ADR-005.md)）

- build 開關（如 `EDITION=enterprise`）在**編譯期整塊排除聯網碼**（auto-updater、遙測、不需要的外連）——**不是 `if` 關掉，是不打包進 binary**。
- 烙客戶身分 / 浮水印。賣點對醫療/隱私客戶**可驗證**：「反組譯確認聯網碼根本不在裡面」。
- PromptBox 具體：electron-builder 條件打包（企業版不 bundle `autoUpdater.cjs`、遙測編譯期 strip）。

### 7.3 站點授權檔（site license）

```jsonc
{ "type": "site", "org": "○○醫院", "seats": 200, "maxVersion": 3, /* sig */ }
```

- 綁**組織身分**（或客戶內部伺服器 hostname），**非逐台機器**。客戶 IT 用既有派送工具（GPO/SCCM/MDM）把**同一 build + 同一張授權檔**推到全部機器。
- 每個實例用內嵌公鑰**離線驗章**；氣隙環境免連網、免硬體。
- **席次 enforcement**：v1 用**合約自報**（`seats` 僅作文件）；要技術性數人頭才需客戶內網跑一支 license daemon——**確定有需求才做**。

### 7.4 密碼狗的唯一定位

僅留給**氣隙、單機、高度監管的少量工作站**（醫材式、金鑰需存防篡改硬體）作**逐案談的 add-on**，**不是標準 SKU**。

---

## 8. 功能需求（逐條）

| # | 功能 | 需求細項 |
|---|---|---|
| F1 | **免費容量上限（main 強制）** | `promptHandlers` create 時：非 Pro 且超過 50 卡 / 3 資料夾 / 串接 >3 張 ⇒ 拒絕並回可辨識錯誤碼供前端顯示 upsell |
| F2 | **License Key 輸入與離線驗章** | 設定頁輸入框（僅 Free 顯示）；貼上 token → **main 驗章**（非呼叫平台 API）；成功切 Pro、即時解鎖、不需重啟；失敗顯示對應訊息（無效簽章 / 版本線過舊 / 格式錯） |
| F3 | **付費牆 / Upsell（非侵入）** | 受限處顯示 👑（不阻擋）；觸發上限時彈輕量 Modal 說明價值 + 「立即升級」開系統瀏覽器到金流頁 |
| F4 | **設定頁授權狀態** | Free：顯示「升級」入口；Pro：顯示「👑 已啟動」、版本線（`maxVersion`）、購買識別、啟動日期、「管理授權」連結 |
| F5 | **大版本升級流程** | v4 binary 對 `maxVersion:3` token 驗為 Free → 顯示「升級至 v4 版本線」入口（既有資料與 v3 功能不受影響） |
| F6 | **既有用戶 grandfather** | 既有免費用戶若已超過新上限：**保留其現有資料與容量**，新限制只對「新建超出部分」或新用戶生效（避免 paywall 反彈，[FP03 §五](../Future%20plans/FP03.md)） |

---

## 9. 非功能需求

- **隱私（品牌核心）**：App 端**不打電話回家**；授權驗證全離線。金流頁在系統瀏覽器開，不在 App 內嵌追蹤。
- **離線**：已啟動授權離線永久可用（買斷無到期）。
- **安全**：token 不明文儲存（`safeStorage`）；驗章與容量閘門**只在 main process**；公鑰嵌 binary、私鑰永不外流。
- **防濫用（誠實前提）**：採**弱驗證**，接受一定比例被破解（[ADR-005 §七](../ADR/ADR-005.md)）；**不做硬 DRM**。企業外洩靠**浮水印乾淨 build 可溯源 + 合約**。
- **可逆性**：整套 = 一個 `entitlement` 接縫 + 幾個容量 `if`；最壞移除近乎零沉沒成本（[FP03 §二](../Future%20plans/FP03.md) Path M 可逆性高）。

---

## 10. 分期實作（Strangler Fig，每步可獨立 merge）

### Phase 1 — 第一筆營收最小接縫（必做，≈2~3 人天，FP03 候選 1）
- [ ] `platform/entitlement.cjs`：`isPro()` / `isEntitled()`（main、defense-in-depth）。
- [ ] Ed25519 簽/驗工具 + 公鑰嵌入；token 結構（§6.1）。
- [ ] `safeStorage` 加密儲存 token；啟動讀取。
- [ ] F1 容量上限（main 強制）+ F6 grandfather。
- [ ] F2 輸入/驗章 UI + F3 upsell Modal + F4 設定頁狀態。
- [ ] 金流串接（Lemon Squeezy / Gumroad）發 token；上線收第一筆錢。

### Phase 2 — 視轉換率（看商業確定性才做）
- [ ] 第一個 mod（建議 **AI 包**）走 `entitlements` 旗標；必要時才引入完整 registry（[FP02 階段 B3/C](../Future%20plans/FP02.md)）。
- [ ] F5 大版本升級流程（發 v4 時才需要）。

### Phase 3 — 視盜版實況（多半不必做）
- [ ] **機器指紋 + 離線啟用（node-lock）**：僅在**觀察到互傳氾濫**、或氣隙單機 add-on 需求時才升級；接縫同一個 token 的 `machineId` 欄位，**升級不重做**。

### Enterprise track（與上述並行、逐案）
- [ ] `EDITION=enterprise` 乾淨 build 開關（編譯期排除聯網碼 + 浮水印）。
- [ ] 站點授權檔（`type:"site"` + `seats`）簽發流程。

---

## 11. 未決議題（待創辦人拍板）

| # | 議題 | 建議 |
|---|---|---|
| U1 | ✅ 已決：免費版每卡變數上限 **35**（軟上限，極少觸頂） | — |
| U2 | 個人定價方向已定（數字微調待定）：首購 **$25~29**（含 12 個月更新權 + 永久 fallback）、續訂 **−40%**、連買 2 年送 1 年。**採「更新權」模型**（非訂閱 time-bomb、非純大版本上限） | 見 §4.3 / §5.1 |
| U3 | 大版本升級費比例 | 建議新購的 40~60% 折扣（業界慣例） |
| U4 | 第一筆營收路徑 | 本 PRD 採 [FP03](../Future%20plans/FP03.md) 候選 1（解除上限）；若改候選 2（AI 包）需先做 Phase 2 |
| U5 | 金流選型 | Lemon Squeezy（台灣金流 + 稅務）vs Gumroad vs Stripe Payment Link |

---

## 12. 明確排除（避免範圍蔓延）

- ❌ 完整 registry / moduleContract / preload 泛型橋（[FP02 階段 B3/C](../Future%20plans/FP02.md)，看商業確定性才做）。
- ❌ 團隊雲端版的授權機制（server greenfield，伺服器即權威，另立 PRD）。
- ❌ 合規控制項（ISO27001/SOC2/HIPAA/IEC62304）——屬流程/證據，非本 PRD（[ADR-005 §三](../ADR/ADR-005.md)）。
- ❌ v1 的 node-lock / 密碼狗 / 線上每次驗真（過度工程，違反 [ADR-005 §七](../ADR/ADR-005.md)）。

---

## 13. 成功指標

- 上線 30 天內 Free→付費轉換率 ≥ 2%（Freemium 基準）。
- 授權驗章成功率 > 99%（無誤判把付費用戶降回 Free）。
- 既有用戶 paywall 反彈（負評/退費）≈ 0（grandfather 生效驗證）。
- 「收到第一筆錢」——FP03 Hybrid 的真正目標：驗證 willingness-to-pay。
