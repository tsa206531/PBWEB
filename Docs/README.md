# PromptBox

> 本地端 AI Prompt 管理工具 - 安全策展、AI 精準取用的機密 Context 保險庫

![Version](https://img.shields.io/badge/version-3.2.3-blue)
![img](img/01.jpg)

## 📖 簡介

PromptBox 是一個基於 Electron 的本地端應用程式，專為 AI 工作者打造，幫助您高效管理和使用 AI Prompts。v3.0 起升級為「人類策展、AI 安全取用」的機密 Context 保險庫——資料靜態加密、機密卡片密碼鎖定、MCP Tools 精準呼叫。v3.1 再補上「機密釋放（consent）」與「卡片串聯」：機密卡片可在使用者當次授權下安全餵給 AI，Prompt 之間可用 `{{@prompt:N}}` 遞迴組合。v3.2 系列持續收束機密 UX：強型別型別設定 GUI（v3.2）、前端架構重構（v3.2.1）、機密卡片變數支援（v3.2.2）、全站 UI 視覺與操作優化（v3.2.3）。

### ✨ 核心功能

- 📁 **資料夾分類**：使用多層資料夾管理 Prompts
- 🔍 **智慧搜尋**：快速搜尋標題、內容、標籤
- 📋 **一鍵複製**：快速複製 Prompt 到剪貼簿
- ⭐ **我的最愛**：標記常用 Prompts
- 🏷️ **標籤管理**：使用標籤靈活組織
- 📝 **Markdown 支援**：美觀的 Markdown 預覽
- 🎨 **變數樣板** (V1.5)：動態變數替換，提升 Prompt 重用性
- 🌓 **深色/淺色模式**：自動切換主題
- 🔄 **手動更新提示** (V2.0)：啟動時偵測新版本，引導前往下載頁
- 🧹 **清除快取與重設** (V2.1.2)：設定頁面一鍵還原出廠狀態
- 🔑 **變數 Key 自動清理** (V2.1.3)：儲存時自動移除孤立變數 Key
- 🔌 **MCP 伺服器** (V2.2+)：內建 MCP 伺服器（SSE + Streamable HTTP），讓 Cursor、VS Code、Claude Desktop 等 IDE 直接讀取與呼叫 Prompt
- 🖥️ **System Tray 模式** (V2.2)：關閉視窗後縮小至系統匣，MCP 服務持續運行
- 🔐 **靜態加密** (V3.0)：SQLite 資料庫以 SQLCipher 頁級加密，金鑰由 OS Keychain 保護
- 🛠️ **MCP Tools 化** (V3.0)：每個未鎖定 Prompt 自動暴露為 MCP Tool，AI 可帶參數精準呼叫並取得編譯後純淨字串
- 🔒 **資料鎖** (V3.0)：卡片一鍵鎖定，對 AI（MCP）完全隱藏
- 🔐 **機密卡片** (V3.0)：卡片級 AES-256-GCM 加密，需自訂密碼才可查看，預設 AI 無法取得
- 🪙 **具名多 Token** (V3.0)：以可撤銷的具名 Token 取代單一共用 Token，含速率限制
- 🔓 **機密釋放 / Consent** (V3.1)：機密卡片可設釋放策略（never/once/session）；AI 請求時主程序彈出授權窗，使用者輸密碼授權後「解一次、餵一次、不快取」
- 🧾 **釋放稽核** (V3.1)：每次機密釋放（允許/拒絕/逾時）皆寫入 append-only 稽核表（只記 metadata、存於加密 DB），MCP 面板可檢視
- 🔗 **卡片串聯** (V3.1)：在「串聯資料夾」內以 `{{@prompt:N}}` 遞迴組合其他卡片；含循環偵測、深度上限、🔴 鎖定/機密邊界（嚴禁間接洩漏）；變數取聯集
- 🧩 **串聯槽 + 值繼承** (V3.2)：串聯卡改用可編輯**串聯槽**（取代內容框）、**邊打邊即時展開預覽**；被引用卡已填的變數值自動帶入組合卡當預設（不衝突直接帶、同名不同值留空並標示），**不影響被引用卡本身**、永不寫回 content
- 🔣 **機密卡片變數支援** (V3.2.2)：機密卡解鎖後恢復完整變數鏈路（解析 → 填值 → 代入 → 複製），並可更新變數預設值（明文存 DB + 明確警示）；未解鎖零洩漏、密文永不改寫
- 👁️ **密碼可視切換** (V3.2.3)：所有密碼欄位（設定 / 變更 / 移除 / 解鎖）內建顯示/隱藏切換，降低「打錯密碼 → 永久鎖死」的不可逆風險
- ✨ **UI 視覺與操作優化包** (V3.2.3)：標籤灰階降噪、操作按鈕加大、標籤一鍵重設、串聯資料夾歸位固定導覽、預設卡片檢視、編輯 Modal 顯示 `#id`、全站「橘紅 = 機密」視覺語意
- 🧪 **單元 + 整合測試** (V3.1+)：Vitest 前端單元 / 元件測試 + 後端 handler 測試（`electron/__tests__`），v3.2.3 全套 **147 綠**

## 🚀 快速開始

### 開發環境

```bash
# 安裝依賴
npm install

# 重新編譯原生模組（v3.0 起使用加密版 SQLite）
npx electron-rebuild

# 啟動開發模式
npm run electron:dev

# 執行測試（Vitest：前端單元 / 元件 + 後端 handler，147 項）
npm test

# 後端整合測試（無 GUI，使用 Electron 內建 Node ABI）
ELECTRON_RUN_AS_NODE=1 ./node_modules/.bin/electron E2E/test-v322.cjs

# 打包應用程式
npm run electron:build
```

### 系統需求

- Node.js 18+
- Windows 10/11 或 macOS 10.15+

> **v3.0 升級注意**：首次啟動會將舊明文資料庫備份為 `promptbox.db.plain.bak` 並建立全新加密資料庫。舊資料不會自動遷移（使用者可手動匯入備份）。本版關閉自動更新，請前往 GitHub Releases 手動下載。

## 📦 專案結構

```
PromptBox/
├── .github/
│   └── workflows/
│       └── release.yml           # 自動打包發布 CI/CD
├── electron/                     # Electron Main Process
│   ├── handlers/                 # IPC 處理器
│   │   ├── promptHandlers.cjs    # Prompt CRUD + 鎖定 + 機密卡片 + variables 清空防護（v3.2.2）
│   │   ├── mcpHandlers.cjs       # MCP Token 管理 IPC
│   │   └── folderHandlers.cjs
│   ├── core/
│   │   └── prompts/
│   │       └── variableSync.cjs  # 變數同步單一真相純函式（v3.2.1，前後端 parity）
│   ├── __tests__/                # 後端 handler / schema 測試（Vitest）
│   ├── services/
│   │   ├── keyService.cjs        # safeStorage 金鑰管理（v3.0）
│   │   ├── cryptoService.cjs     # 卡片級 AES-256-GCM 加密（v3.0）
│   │   └── consentBroker.cjs     # 機密釋放 consent 跨 IPC 橋接（v3.1）
│   ├── autoUpdater.cjs           # 更新偵測（v3.0 改為手動下載）
│   ├── db.cjs                    # SQLCipher 加密資料庫 + 串聯資料夾 seed + 釋放稽核表（v3.1）
│   ├── mcpServer.cjs             # MCP 伺服器（Tools + Resources + consent + 串聯展開）
│   ├── schemaUtils.cjs           # MCP 弱型別推導 / 驗證 / 編譯 + expandChains 串聯展開（v3.1）+ mergeInheritedValues 值繼承（v3.2）
│   ├── tokenStore.cjs            # 具名多 Token 管理（v3.0）
│   ├── portDetector.cjs          # 動態 Port 偵測
│   ├── ipcHandlers.cjs           # IPC 整合入口
│   └── main.cjs                  # 主程序入口
├── src/
│   ├── components/               # Vue 元件
│   │   ├── PromptCard.vue        # 卡片（#id、鎖定、機密標示、灰階標籤 v3.2.3）
│   │   ├── PromptModal.vue       # 編輯彈窗（機密密碼、釋放策略、串聯槽、解鎖後變數 v3.2.2）
│   │   ├── SchemaPanel.vue       # 變數側欄面板（填值 + 強型別，v3.2）
│   │   ├── McpModal.vue          # MCP 設定（多 Token、釋放紀錄）
│   │   ├── ConsentModal.vue      # 機密釋放授權窗（並發佇列，v3.1）
│   │   ├── Sidebar.vue           # 側欄（串聯資料夾固定於 Main Nav、標籤重設，v3.2.3）
│   │   ├── UpdateModal.vue       # 更新提示（手動下載）
│   │   └── base/                 # 基礎元件（Input 含密碼可視切換，v3.2.3）
│   ├── composables/              # useSecretCard / useChainExpand / useStrongTyping（v3.2.1 拆分）
│   ├── stores/                   # Pinia 狀態管理（含 consent 佇列、稽核列表）
│   ├── constants/                # UI 樣式常數（v3.2.3）/ 教學卡片
│   ├── utils/                    # 工具函式（variables.js / schema.js + 單元測試）
│   └── locales/                  # 多語言（zh-TW / en / ja）
├── E2E/                          # 後端整合測試（ELECTRON_RUN_AS_NODE，真實加密 DB）
│   └── test-v322.cjs             # v3.2.2：機密卡變數 / update 清空防護（最新）
└── Doc/
    ├── PRD/                      # 產品需求文件
    ├── ADR/                      # 架構決策記錄
    ├── Tech Design/              # 技術設計文件
    └── Wishlist/                 # 功能待辦清單
```

## 🛠️ 技術棧

- **Frontend**: Vue 3 (Composition API) + Vite + Tailwind CSS
- **Desktop**: Electron
- **State**: Pinia
- **Database**: SQLite — `better-sqlite3-multiple-ciphers`（SQLCipher 靜態加密，v3.0）
- **Crypto**: Node.js `crypto`（scrypt KDF + AES-256-GCM，卡片級加密，v3.0）
- **Key Management**: `electron.safeStorage`（OS Keychain 金鑰保護，v3.0）
- **Markdown**: markdown-it + highlight.js
- **i18n**: vue-i18n（zh-TW / en / ja）
- **MCP**: @modelcontextprotocol/sdk + Express（Tools + Resources，Streamable HTTP + SSE）
- **Schema Validation**: Ajv（MCP 弱型別驗證，v3.0）
- **Testing**: Vitest + @vue/test-utils（前端單元 / 元件 + 後端 handler 測試，v3.2.3 全套 147 綠）
- **Update**: electron-updater + GitHub Releases（v3.0 改為手動下載提示）
- **CI/CD**: GitHub Actions

## 📚 版本歷程

### V3.2.3 (2026-07-11) - UI Polish

> 8 項獨立純前端微調一次收整，**零後端 / MCP 改動**，每項可獨立 revert。校正「視覺權重與操作成本和實際重要性不成比例」的累積摩擦：不重要的搶眼（七彩標籤）、重要的不顯眼（機密區塊與星星同色）、高頻的太費力（標籤逐顆取消）、高風險的沒防呆（密碼純遮罩）。

- 🏷️ **標籤灰階降噪**：移除 `PromptCard` / `PromptList` 兩份字數 hash 七彩配色，收斂為單一樣式常數 `TAG_BADGE_CLASS`（含 dark 模式）——標題與內容回到視覺主角
- 🖱️ **操作按鈕加大**：卡片鎖定 / 編輯 / 複製按鈕 `w-8`→`w-11`（44px）、icon 18→24px，grid / list 兩檢視同步
- 🧹 **標籤一鍵重設**：Sidebar Tags 區常駐「重設」鈕（無選取時停用半透明），`filterStore.clearTags()` 一鍵清空多選標籤
- 🧭 **串聯資料夾歸位**：內建串聯資料夾移入 Main Nav 固定導覽（我的最愛之下、教學之前），與使用者自建資料夾做結構區隔；「不可刪 / 不可改名 / 不可拖曳」改由結構保證，順手移除迴圈內特判
- 🃏 **預設卡片檢視**：`viewMode` 預設 `list`→`grid`（拍板僅改預設值、不做持久化）
- 🔢 **編輯 Modal 顯示 #id**：編輯既有卡片時標題旁顯示 `#id`（`text-sm` 灰色 mono；新增卡與串聯卡不顯示），GUI 與 MCP / 回報流程引用體驗一致
- 🟠 **「橘紅 = 機密」視覺語意**：機密語意 amber 全站 10 處換橘紅系（Modal 機密區塊、列表 lock badge / key icon、一般卡的機密功能入口）；「忘記密碼永久無法復原」警語升 red；amber 保留給最愛星星 / 鎖定 toggle 等一般強調
- 👁️ **密碼可視切換（本版最高優先）**：`base/Input.vue` 內建 visibility 切換，設定 / 變更 / 移除 / 解鎖等全部密碼欄位自動受益；`type="button"` 不搶 Enter、unmount 自動重置遮罩、aria-label i18n 三語——直接降低「打錯密碼 → 永久鎖死」的不可逆風險
- 🧪 **測試**：新增 Sidebar / Input / filterStore / preferenceStore / PromptModal `#id` 案例，全套 **147 passing** + `vite build` 通過

### V3.2.2 (2026-07-10) - Secret Card Variables

> 機密卡片解鎖後恢復完整變數鏈路（`{{變數}}` 解析 → 填值 → 代入 → 複製），且**不破壞任何機密安全不變式**：明文僅存記憶體、密文永不改寫、未解鎖零洩漏（UI 與前版逐像素一致）。

- 🔣 **解鎖後變數面板（FR-1）**：`SchemaPanel` 顯示條件放寬，解析來源改解鎖明文（`effectiveContent` 單一 computed）；機密卡固定弱型別（強型別另案 WL-019）
- 📋 **複製代入變數（FR-2）**：`copyUnlocked` 走 `replaceVariables`（未填保留 `{{佔位符}}`），單顆按鈕一律代入，與一般卡片行為一致
- 💾 **預設值可更新（FR-3）**：機密 + 已解鎖時允許儲存 `variables` 預設值（**永不**寫 content / schema_definition）；連帶修復 MCP 釋放路徑 `secretDefaults` 凍結——AI 端不再拿到加密前的舊快照；預設值明文存 DB + 面板警示（決策記錄見 ADR-3.2.2）
- 🛡️ **後端清空防護（FR-4）**：`prompts:update` 在 content 缺席時跳過孤立 key 同步、僅正規化後原樣存入——修掉「variables-only update 全部 key 被清成 `{}`」的既存資料破壞風險；一般卡路徑位元級不變
- 💬 **設密提示（FR-5）**：含變數的卡片設為機密時提示「變數面板將於解鎖後才可使用」（i18n 三語），消除「設了機密才發現變數壞掉」的驚訝感
- 🧹 **清理連帶**：`clearSecretState()` 清明文時連帶清變數填值——關 Modal / 換卡即清，機密填值不殘留到下一張卡

### V3.2.1 (2026-06-23) - Frontend TechDebt

> 純技術債清理，對外行為不變；為 v3.2.2+ 的機密 UX 系列打地基。

- 🧩 **God Component 拆分（FR-6）**：`PromptModal.vue` script 504→287 行，機密 / 串聯 / 強型別狀態拆出 `useSecretCard` / `useChainExpand` / `useStrongTyping` composables
- 🎯 **變數同步單一真相（FR-1，消 C8）**：前後端兩份重複的孤立 key 清理邏輯收斂為 `electron/core/prompts/variableSync.cjs` 純函式，17 筆前後端 parity 測試護欄
- ⚛️ **資料夾批次原子化（FR-2）**：修掉 `editFolder` / `deleteFolder` 浮動 Promise 競態（「資料夾已改名、部分卡片未改名」的中間態）
- 🔀 **預設值單一真相（FR-3）**：修正弱 / 強型別 default 雙寫漂移——toggle 切換時雙向遷移值、存檔只寫當前模式那一份
- ⚡ **強型別效能（FR-5）**：`highlightJson` 不再於每個 keystroke 重算
- 🧪 全套 **111 passing** + `vite build` 通過

### V3.2.0 (2026-06-23) - StrongTyping GUI & 串聯槽

> 純前端 / GUI 路徑強化，建立在 v3.1 串聯（FR-4）之上。**MCP 路徑與 content 儲存格式不變**（仍只存 `{{@prompt:N}}` token、永不寫回展開結果），向後相容。

- 🔗 **可編輯串聯槽**：串聯資料夾卡片在 Edit 檢視改用可編輯的「串聯槽」取代內容大框，手打 `{{@prompt:N}}` token；輸入時 **debounce 即時展開預覽**，Preview 分頁渲染「展開＋填值後」的 Markdown 結果（`renderedContent` 既有行為，已補回歸測試）
- 🧬 **變數值繼承（規則 d）**：展開時順帶蒐集被引用卡（含遞迴）已填的變數值，經純函式 `mergeInheritedValues`（`electron/schemaUtils.cjs`）合併後當組合卡預設——**不衝突直接帶入、同名不同值留空並以琥珀色提示標示**；只填空欄位且每變數只自動帶一次（不覆寫使用者已填/清空的值），**不影響被引用卡本身**。`prompts:expand-preview` 回傳擴充為 `{ content, vars, inherited, conflicts }`
- 🐞 **執行期修復**：(1) IPC `An object could not be cloned`——`overrides` 為 Vue 響應式 Proxy 經結構化複製失敗，store 層轉純物件修正；(2)「Expanding...」卡死——`runExpandPreview` 以 `try/finally` 確保 busy 旗標必定重置。詳見 [Doc/DebugLog/V3.2debug_ChainSlot.md](Doc/DebugLog/V3.2debug_ChainSlot.md)
- 🧪 **測試**：新增 `mergeInheritedValues` 單元測試（規則 d / 衝突 / 空值 / 壞資料）與 PromptModal 元件測試（串聯槽渲染、衝突旗標、Preview 展開填值、debounce 重跑），全套 **88 passing**

### V3.1.0 (2026-06-10) - Prompt Chaining & Secret Release

> 完全建立在 v3.0 既有元件之上，不引入新基礎建設、不新增執行期依賴（僅新增 devDependency `vitest` / `@vue/test-utils` / `jsdom`）。100% 相容 v3.0：未釋放機密卡片仍 human-only，非串聯資料夾行為不變。

- 🔓 **機密釋放 / Consent（FR-1）**：機密卡片可設 `release_policy`（`never` 預設 / `once` / `session`）。AI `tools/call` 命中 `once`/`session` 卡片時，主程序透過 `consentBroker` 彈出授權窗並 `await`；使用者輸密碼授權 → 重用 `cryptoService` 解一次 → 編譯餵一次 → 明文即棄（不快取、不寫檔、不寫 log）。`never` 維持 v3.0 行為（`MethodNotFound`、不洩漏存在性）
- 🧾 **釋放稽核（FR-2）**：新增 `secret_release_audit` append-only 表（只記 metadata、不記明文/密碼、存於加密 DB），MCP 面板新增「釋放紀錄」檢視
- 🔗 **卡片串聯（FR-4）**：擴充編譯引擎，於 `{{var}}` 替換**之前**多一道 `expandChains()` 遞迴展開 `{{@prompt:N}}`；串聯資訊只存 `content` token、**不新增 DB 欄位**。單一內建「串聯資料夾」成員即生效；含循環偵測、深度上限（5）、🔴 鎖定/機密邊界（經串聯間接洩漏次數＝0）；變數取聯集；前端 edit-time 記憶體展開預覽，**永不寫回 content**
- 🛡️ **嚴格 token**：`{{@prompt:N}}` 正則杜絕誤判（拼錯/缺冒號/id 非數字皆當純文字），與 `{{var}}` 變數天然不互相干擾
- 🧪 **測試安全網（FR-5）**：引入 Vitest，覆蓋 `variables.js` / `schemaUtils.cjs`（derive / compile / 串聯 / 循環 / 深度 / 機密邊界）核心函式，並新增 PromptModal 元件掛載 smoke test；新增 `E2E/test-v31.cjs`（19 項，真實加密驅動 DB）

### V3.0.0 (2026-06-03) - MCP Tools & Vault Security

> **⚠️ 重大版本**：資料庫從明文升級為 SQLCipher 加密。首次啟動會備份舊資料（`promptbox.db.plain.bak`）並建立新加密庫；舊資料不自動遷移。請手動下載安裝此版本。

- 🔐 **靜態加密（SQLCipher）**：整個本地資料庫以 AES-256 頁級加密；金鑰由 OS Keychain（Windows DPAPI / macOS Keychain）保護，金鑰不落明文
- 🛠️ **MCP Tools 化（弱型別）**：每個未鎖定 Prompt 自動暴露為 `prompt_{id}` Tool；`{{var}}` 推導為 JSON Schema（全 string + required）；AI 帶參數呼叫後端直接編譯返回純淨字串，省 Token、可驗證
- ✅ **Ajv 弱驗證 + 對話引導式錯誤**：缺必填參數返回 `Missing required property 'x'. Please ask the user to provide it.`
- 🔔 **`notifications/tools/list_changed`**：Prompt 新增/編輯/鎖定後即時通知已連線 IDE 刷新 Tool 列表
- 🔒 **資料鎖（is_locked）**：卡片一鍵 🔒 鎖定，對 MCP 的 tools/list、tools/call、resources 完全隱藏
- 🔐 **機密卡片（卡片級加密）**：使用者設自訂密碼，以 scrypt（N=2¹⁷）+ AES-256-GCM 加密 content；密碼永不儲存；GUI 需密碼查看；AI 永遠無法取得
- 🪙 **具名多 Token（FR-8）**：單一共用 Token 升級為可具名、可個別撤銷的多 Token；驗證失敗 → 401；逾速率（60 req/min per token）→ 429；支援向下相容自動遷移
- 📋 **description 欄位**：Prompt 新增說明欄位，作為 MCP Tool 的 description（空則 fallback 至 title）
- **#id 顯示**：卡片左下角顯示 `#id`（GitHub Issue 風格），為 Prompt Chaining 鋪路
- 🔄 **手動更新（v3.0 起）**：關閉自動靜默安裝，改為「發現新版 → 提示 → 前往下載頁手動安裝」，避免無聲重置使用者資料
- 🧪 **整合測試覆蓋**：新增 E2E 整合測試（66 項），以真實 SDK + 加密 DB 驗證 MCP Tools、Token 認證、機密卡片全流程

### V2.3.0 (2026-05-28) - MCP Streamable HTTP

- 🌊 **Streamable HTTP 傳輸**：新增 `/mcp` 端點支援 MCP Streamable HTTP（stateless，每請求新建 server + transport），與 legacy SSE 並存

### V2.2.0 (2026-05-26) - MCP Integration

- 🔌 **本地 MCP SSE 伺服器**：內建符合 Model Context Protocol 標準的 SSE 伺服器（`127.0.0.1`），讓外部 IDE 透過 `ListResources` / `ReadResource` 直接讀取 Prompt 資產
- 🛡️ **Token 認證**：每次安裝自動生成隨機 Token，支援 `Authorization: Bearer` Header 與 `?token=` URL 參數
- 🖥️ **System Tray 模式**：關閉主視窗後應用程式縮小至系統匣持續運行，MCP 服務不中斷
- 🎛️ **MCP 設定面板**：側欄新增 MCP 設定按鈕，可查看伺服器狀態、管理 Token、啟動/停止伺服器、一鍵產生 IDE 設定 JSON

### V2.1.3 (2026-03-24) - Variable Key Sync

- 🔑 **孤立變數 Key 自動清理**：儲存 Prompt 時，自動偵測並移除 `variables` 中已不存在於 `content` 的孤立 Key

### V2.1.2 (2026-03-11) - Installation & System Reset

- 📂 **自訂安裝路徑**：Windows 安裝精靈開放選擇安裝磁碟與資料夾
- 📦 **免安裝便攜版**：新增 Release 產出 `.zip` 格式
- 🧹 **清除快取與重設機制**：設定頁面一鍵清除所有資料並還原出廠狀態

### V2.1.0 (2026-03-10) - Performance Optimization

- ⚡ **極速啟動體驗**：Skeleton Screen 與 `ready-to-show` 視窗優化
- 🔄 **非同步資料載入**：SQLite 資料庫讀取非同步化
- 📦 **打包體積優化**：Vite `manualChunks` + esbuild Bundle 分割

### V2.0 (2026-03-09) - Auto Update

- 🔄 **自動更新機制**：整合 `electron-updater`，軟體啟動時自動比對 GitHub Releases 最新版本
- 🔒 **CSP 安全性強化**：加入 Content-Security-Policy Header

### V1.5 (2026-02-16) - Variables Template

- ✨ 新增變數樣板功能（`{{variableName}}` 語法）+ Variables Panel 元件

### V1.2 (2026-02-15) - Pinia & Markdown

- 🔄 引入 Pinia 狀態管理 + Markdown 預覽

### V1.0 - Initial Release

- 基礎 Prompt 管理功能、SQLite 本地儲存、資料夾與標籤系統

## 📖 文件

- [V3.2.3 PRD - UI 視覺與操作優化](./Doc/PRD/v3.2.3_PRD_UIPolish.md)
- [V3.2.3 Tech Design - UI 視覺與操作優化](./Doc/Tech%20Design/v3.2.3_TD_UIPolish.md)
- [V3.2.2 PRD - 機密卡片變數支援](./Doc/PRD/v3.2.2_PRD_SecretCardVariables.md)
- [V3.2.2 Tech Design - 機密卡片變數支援](./Doc/Tech%20Design/v3.2.2_TD_SecretCardVariables.md)
- [ADR-3.2.2: 機密卡片的變數預設值以明文儲存](./Doc/ADR/ADR-3.2.2-機密卡片的變數預設值以明文儲存.md)
- [V3.2.1 PRD - 前端技術債清理](./Doc/PRD/v3.2.1_PRD_FrontendTechDebt.md)
- [V3.2.1 Tech Design - 前端技術債清理](./Doc/Tech%20Design/v3.2.1_TD_FrontendTechDebt.md)
- [V3.2 Tech Design - 強型別型別設定 GUI](./Doc/Tech%20Design/v3.2_TD_StrongTyping_GUI.md)
- [V3.2 PRD - 強型別型別設定 GUI](./Doc/PRD/v3.2_PRD_StrongTyping_GUI.md)
- [V3.1 Tech Design - 機密釋放與卡片串聯](./Doc/Tech%20Design/v3.1_TD_SecretRelease_PromptChaining.md)
- [V3.0 PRD - MCP Tools & Vault Security](./Doc/PRD/v3.0_PRD_MCP_Tools_Security.md)
- [V3.0 Tech Design - MCP Tools & Vault Security](./Doc/Tech%20Design/v3.0_TD_MCP_Tools_Security.md)
- [ADR-004: v3.0 範圍重評估](./Doc/ADR/ADR-004.md)
- [ADR-003: 產品靈魂（機密 Context 保險庫）](./Doc/ADR/ADR-003-soul.md)
- [V2.3.0 PRD - Streamable HTTP](./Doc/PRD/v2.3_PRD_StreamableHTTP.md)
- [V2.2.0 PRD - MCP Integration](./Doc/PRD/v2.2_PRD_MCP.md)
- [V2.1.3 PRD - Variable Key Sync](./Doc/PRD/v2.1.3_PRD_變數Key孤立清理.md)
- [V2.0 PRD - Auto Update](./Doc/PRD/V2.0_PRD_AutoUpdate.md)
- [版本號更新規則 SOP](./Doc/更新本版號規則.md)
- [ADR-001: Variables Template](./Doc/ADR/ADR-001-Variables-Template.md)
