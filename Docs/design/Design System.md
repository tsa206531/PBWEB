# PromptBox — Design System 逆向拆解報告

> 來源:`PromptBox/src/style.css`、`tailwind.config.js`、`src/components/**/*.vue`、`index.html`(Skeleton)
> 方法:靜態掃描全部 17 個 Vue 元件 + Tailwind 設定,將實際出現的 utility class 反推為 Design Tokens。
> 技術棧:Vue 3 + Tailwind CSS(`darkMode: "class"`)+ CSS Variables(RGB channel 格式,支援 `<alpha-value>` 透明度插值)。

---

## 1. 核心色彩系統 (Color Palette)

### 1.1 語義色 Token(雙主題)

架構特徵:所有顏色以 **RGB channel 三元組** 存於 CSS 變數(如 `--color-primary: 0 159 183`),由 Tailwind 以 `rgb(var(--token) / <alpha-value>)` 消費,因此**任何語義色都可直接掛透明度修飾符**(`bg-primary/10`)。深色模式以 `.dark` class 切換整組變數,元件層幾乎零 `dark:` 前綴。

| Token | 角色 | Light | Dark |
|---|---|---|---|
| `primary` | 主色(品牌青) | `#009FB7` | `#2BB0C9` |
| `primary-hover` | 主色 hover(Light 變暗、Dark 變亮) | `#007F93` | `#4EC6DB` |
| `bg-main` | 全域背景 | `#F4F4F8` | `#0F172A` |
| `bg-sidebar` | 側欄/頁首背景 | `#FFFFFF` | `#0D121C` |
| `bg-card` | 表面色(卡片、Modal、輸入容器) | `#FFFFFF` | `#111827` |
| `border-light` | 標準邊框/分隔線 | `#E6E6EA` | `#1F2937` |
| `text-main` | 主要文字 | `#1F2933` | `#E5E7EB` |
| `text-secondary` | 次要文字/圖示 | `#6B7280` | `#9CA3AF` |
| `btn-secondary` | 次要按鈕/icon 按鈕 hover 底色 | `#D9EEF2` | `#1F2937` |

背景三層結構:`bg-main`(頁面)→ `bg-sidebar`(導航殼)→ `bg-card`(內容表面)。Light 模式下 sidebar 與 card 同為白色,靠 `border-light` 分界;Dark 模式下三層有明確深淺差。

### 1.2 狀態色 (Semantic Status)

| Token | Light | Dark | 實際用途 |
|---|---|---|---|
| `status-success` | `#2FBF71` | `#4ADE80` | 成功狀態 |
| `status-warning` | `#FED766` | `#FACC15` | 警告狀態 |
| `status-error` | `#FE4A49` | `#F87171` | 錯誤/危險 |

補充:元件層同時混用 Tailwind 原生色作即席狀態色(逆向時應收斂進 token):
- Danger 按鈕/文字:`red-500` `#EF4444` / hover `red-600` `#DC2626`
- 運行指示燈:`green-500` `#22C55E`(運行)、`red-500`(錯誤)、`gray-400` `#9CA3AF`(停止)
- 收藏星號:`yellow-400` `#FACC15`;鎖定:`amber-500` `#F59E0B`;機密:`orange-600`/dark `orange-400`
- Info icon 圈:`bg-blue-100 text-blue-600`;Danger icon 圈:`bg-red-100 text-red-600`;Warning icon 圈:`bg-yellow-100 text-yellow-600`

### 1.3 透明度階(Alpha Scale)— 本專案的核心手法

不透明色階很少,**層次幾乎全靠同一顏色的透明度變化**:

| CSS 渲染值 | 用途 |
|---|---|
| `rgb(var(--color-primary) / 0.05)` | 確認鈕 hover 底(`hover:bg-primary/5`) |
| `rgb(var(--color-primary) / 0.10)` | 選中態底色(nav / tag / view toggle:`bg-primary/10`) |
| `rgb(var(--color-primary) / 0.20)` | 選中項邊框(`border-primary/20`)、主按鈕彩色陰影 |
| `rgb(var(--color-primary) / 0.30)` | 文字反白選取 `selection:bg-primary/30` |
| `rgb(var(--color-primary) / 0.50)` | focus ring(`ring-primary/50`)、卡片 hover 邊框 |
| `rgb(var(--color-text-main) / 0.05)` | 中性 hover 底(ghost:`hover:bg-text-main/5`) |
| `rgba(0,0,0,0.5)` | Modal 遮罩 `bg-black/50` + `backdrop-filter: blur(4px)` |
| `rgb(34 197 94 / 0.10~0.30)` | 更新提示按鈕(`bg-green-500/10`、hover `/20`、border `/30`) |

### 1.4 漸層 (Gradients)

唯一漸層為 Skeleton shimmer(載入骨架):

```css
.sk {
  background: #e6e6ea;
  background-image: linear-gradient(90deg, #e6e6ea 0%, #f0f0f4 50%, #e6e6ea 100%);
  background-size: 200% 100%;
  animation: sk-shimmer 1.4s infinite linear;
}
@keyframes sk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 2. 排版與字體階層 (Typography)

### 2.1 字體族

| Token | Stack | 載入 |
|---|---|---|
| `font-display`(全域 body) | `"Inter", sans-serif` | Google Fonts,weights 300/400/500/600/700/800 |
| `font-mono` | Tailwind 預設 mono stack | 程式碼/Prompt 內容(Textarea)、`#id` 小字 |
| Icon | `Material Symbols Outlined` | variable font,`FILL` 軸 0↔1 切換實心(`font-variation-settings: "FILL" 1`) |

### 2.2 字級階層(實測值)

專案為工具型桌面 App,**無傳統 H1–H6 大階層**,以功能角色分級:

| 角色 | Size | Weight | Line-height | Letter-spacing | 出處 |
|---|---|---|---|---|---|
| App 標題(Logo) | 18px (`text-lg`) | 700 | 1.75rem | `-0.025em` (`tracking-tight`) | Header |
| Modal 標題 | 18px (`text-lg`) | 700 | 1.75rem | normal | ConfirmModal h3 |
| 卡片標題 | 14px (`text-sm`) | 700 | 1.25 (`leading-tight`) | normal | PromptCard h3 |
| 內文/按鈕(md) | 14px (`text-sm`) | 500 | 1.25rem | normal | 按鈕、nav、輸入框 |
| 內文(等寬) | 14px | 400 | 1.625 (`leading-relaxed`) | normal | Textarea(mono) |
| 輔助文字 | 12px (`text-xs`) | 400–500 | 1rem | normal | 錯誤訊息、計數、tag |
| 區段標題(overline) | 12px (`text-xs`) | 600 | 1rem | `+0.05em` (`tracking-wider`) + `uppercase` | Sidebar「資料夾/標籤」 |
| 微文字 | 10–11px (`text-[10px]`/`[11px]`) | 700(tag)/400 | 1 (`leading-none`) | normal | tag badge、#id、版權列 |

字重使用律:**400 內文 / 500 可互動文字 / 600 區段標 / 700 強調與標題**;300、800 已載入但罕用。

### 2.3 圖示尺寸階

`16px`(sm 按鈕/內聯)→ `18px`(輔助動作)→ `20px`(標準:nav、header、md 按鈕)→ `24px`(lg 按鈕、icon action、Modal 圖示)。

---

## 3. 空間、幾何與佈局 (Spacing, Geometry & Layout)

### 3.1 間距系統 — 4px 基準網格

全面遵循 Tailwind 的 **4px base unit**,實際使用的階為:

```
4 → 6 → 8 → 12 → 16 → 20 → 24 → 32 (px)
(gap-1, gap-1.5, gap-2/p-2, p-3/gap-3, p-4/gap-4, p-5, p-6/gap-6, pt-8)
```

| 場景 | 值 |
|---|---|
| 內聯元素間距(icon↔文字、tag 群) | 4–8px (`gap-1`~`gap-2`) |
| 表單 label→控件 | 6px (`mb-1.5`);錯誤訊息 4px (`mt-1`) |
| 控件內距(input/nav item) | `px-3 py-2`(12×8) |
| 卡片內距 | 20px (`p-5`) |
| Modal 內距 | 24px (`p-6`) |
| 側欄容器 | `p-3`(12px)+ 頂部 `pt-8`(32px) |
| 區塊間距(sidebar 區段) | 24px (`gap-6`) |
| 卡片 Grid gap | 16px |

### 3.2 版面骨架(固定尺寸)

| 元素 | 值 |
|---|---|
| Sidebar 寬 | 256px (`w-64`),`shrink-0` |
| Header 高 | 75px (`h-[75px]`),`sticky top-0` |
| 搜尋框寬 | 320px (`w-80`),置中 |
| 卡片 Grid | `repeat(3, 1fr)`、gap 16px |
| Icon 按鈕觸控目標 | 44×44px (`w-11 h-11`) |
| 主題切換鈕 | 36×36px (`w-9 h-9`) |
| Modal 寬 | `max-w-sm`(384px,確認框)~ 依複雜度增大 |

### 3.3 圓角分級 (Border Radius)

| 級別 | 值 | 適用 |
|---|---|---|
| `rounded` (DEFAULT,已覆寫) | **4px** | 微元件:tag chip、view-toggle 內鈕 |
| `rounded-md` | 6px | tag badge |
| `rounded-lg` | **8px** | 標準級:按鈕、輸入框、nav item、toast、icon 按鈕 |
| `rounded-xl` | **12px** | 容器級:卡片、Modal |
| `rounded-full` | 9999px | 圓形:狀態點、Modal icon 圈(48px) |

規律:**元件內容物 8px、承載容器 12px、裝飾 4–6px**。

### 3.4 邊框寬度

全站統一 **1px**(`border`);無 2px 邊框。特殊變體:機密內容佔位用 `border-dashed`;選中資料夾用 `border border-primary/20`(未選中保留 `border-transparent` 佔位防跳動)。

### 3.5 深度層級(Box Shadow × Z-Index)

| 層 | Z-index | Shadow | 對應介面 |
|---|---|---|---|
| L0 基底 | auto | none | 頁面、側欄(以邊框分界,非陰影) |
| L1 表面 | auto | `shadow-sm` `0 1px 2px rgb(0 0 0/0.05)` | 搜尋框、header 小按鈕 |
| L2 懸浮 | auto | `shadow-md` `0 4px 6px -1px rgb(0 0 0/0.1), 0 2px 4px -2px rgb(0 0 0/0.1)` | 卡片 hover |
| L3 強調 | auto | `shadow-lg`(彩色):`0 10px 15px -3px rgb(var(--color-primary)/0.2), 0 4px 6px -4px …` | 主按鈕(primary/danger 用各自色 20% 投影)、toast |
| L4 抽屜/面板 | `z-50` | `shadow-xl` / `shadow-2xl` | Settings/MCP Modal、側面板 |
| L5 疊加 Modal | `z-[60]` | `shadow-2xl` `0 25px 50px -12px rgb(0 0 0/0.25)` | Confirm/Consent(疊在 L4 之上) |
| L6 系統級 | `z-[100]` | `shadow-2xl` | 更新提示 Modal |
| Sticky header | `z-10` | none | 頁首 |

Modal 遮罩統一:`fixed inset-0 bg-black/50 backdrop-blur-sm`。
特色手法:**主要 CTA 使用「同色系 20% 透明陰影」**(`shadow-lg shadow-primary/20`)取代灰陰影,是本專案辨識度最高的深度語言。

---

## 4. 核心元件與互動狀態 (Component Patterns & States)

### 4.1 Button(`base/Button.vue`)

基底:`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed`

| Variant | Default | Hover | 陰影 |
|---|---|---|---|
| primary | `bg-primary text-white` | 換色為 `primary-hover`(Light 減亮 ~12%、Dark 增亮) | `shadow-lg shadow-primary/20` |
| secondary | `bg-bg-card border border-border-light text-text-main` | `bg-gray-50`(+5% 灰底) | 無 |
| ghost | 透明 + `text-text-secondary` | `bg-text-main/5` + 文字升為 `text-main` | 無 |
| danger | `bg-red-500 text-white` | `bg-red-600` | `shadow-lg shadow-red-500/20` |

| Size | Padding | 字級 | Icon |
|---|---|---|---|
| sm | 8×4 | 12px | 16px |
| md(預設) | 16×8 | 14px | 20px |
| lg | 24×12 | 16px | 24px |

### 4.2 Input / Textarea(`base/Input.vue`、`base/Textarea.vue`)

- 結構:label(14px/500/`text-secondary`,下方 6px)→ 控件 → 錯誤訊息(12px/`red-500`,上方 4px)
- 控件:`px-3 py-2 bg-bg-main border border-border-light rounded-lg`(**輸入底色用 bg-main,與 bg-card 表面形成內凹對比**)
- Placeholder:`text-gray-400`
- Focus:`ring-1 ring-primary` + `border-primary`(輸入框用 1px ring;按鈕用 2px ring/50)
- Error:`border-red-500`;Disabled:`opacity-50 cursor-not-allowed`
- Textarea 專屬:`font-mono text-sm leading-relaxed`,預設 4 rows,`resize-vertical`

### 4.3 Card(`PromptCard.vue`)

```
p-5 rounded-xl bg-bg-card border border-border-light h-full cursor-pointer
hover: border-primary/50 + shadow-md;標題文字 group-hover:text-primary
transition-all
```
內部:標題 14px/700 → 內容預覽 12px/`text-secondary`/`line-clamp-3` → 底部 tag 群 + 44px icon actions。
Tag badge(全站單一來源 `TAG_BADGE_CLASS`):`px-2 py-1 rounded-md text-[10px] font-bold border bg-gray-100 text-gray-500 border-gray-200`(dark: `gray-800/gray-400/gray-700`)。

### 4.4 Nav Item(Sidebar)

| 狀態 | 樣式 |
|---|---|
| Default | `px-3 py-2 rounded-lg text-text-secondary`,icon 20px |
| Hover | `bg-text-main/5` + 文字→`text-main`,icon 染 hover 色 |
| Active | `bg-primary/10 text-primary`(資料夾另加 `border-primary/20`,icon FILL=1 實心) |

### 4.5 Modal

遮罩 `bg-black/50 backdrop-blur-sm` → 容器 `bg-bg-card rounded-xl shadow-2xl border border-border-light overflow-hidden`。確認框:48px 圓形狀態 icon 圈(`bg-{color}-100 text-{color}-600`)+ 底部 2 欄按鈕以 `divide-x` 分隔、`py-3`。

### 4.6 Toast

`bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg`,固定 `bottom-8` 水平置中,含 `green-400` 狀態 icon,顯示 2000ms。

### 4.7 互動狀態邏輯總表

| 狀態 | 全站統一規則 |
|---|---|
| Hover(實色鈕) | 換色為預先定義的 hover token(非濾鏡);Light 主題變暗、Dark 主題變亮 |
| Hover(中性面) | 疊 `text-main/5`(5% 前景色)或 `gray-50`;卡片另加邊框上色 + `shadow-md`(**無 Y 位移**) |
| Focus | 按鈕:`ring-2 ring-primary/50`;輸入:`ring-1 ring-primary + border-primary`;容器:`focus-within:border-primary` |
| Active/Selected | `bg-primary/10 + text-primary`(±`border-primary/20`) |
| Disabled | `opacity-50 cursor-not-allowed`(不改色相) |
| Copied 回饋 | icon 換 `check`,1000ms 還原 |

### 4.8 動效 (Motion)

| 動效 | 參數 |
|---|---|
| 通用過渡 | `transition-all` / `transition-colors`,Tailwind 預設 150ms |
| Modal 進場 | fade 200ms ease + `scaleIn`(scale 0.95→1 + opacity,200ms ease-out) |
| Toast | 進 300ms ease-out(translateY 8px→0)、出 200ms ease-in |
| 折疊箭頭 | `rotate-180`,200ms |
| Skeleton | shimmer 1.4s linear infinite |
| 更新提示 icon | `animate-pulse` |

---

## 5. 工程化輸出

### 5.1 Design Tokens(JSON)

```json
{
  "color": {
    "light": {
      "primary": "#009FB7",
      "primaryHover": "#007F93",
      "bgMain": "#F4F4F8",
      "bgSidebar": "#FFFFFF",
      "bgCard": "#FFFFFF",
      "borderLight": "#E6E6EA",
      "textMain": "#1F2933",
      "textSecondary": "#6B7280",
      "btnSecondary": "#D9EEF2",
      "statusSuccess": "#2FBF71",
      "statusWarning": "#FED766",
      "statusError": "#FE4A49"
    },
    "dark": {
      "primary": "#2BB0C9",
      "primaryHover": "#4EC6DB",
      "bgMain": "#0F172A",
      "bgSidebar": "#0D121C",
      "bgCard": "#111827",
      "borderLight": "#1F2937",
      "textMain": "#E5E7EB",
      "textSecondary": "#9CA3AF",
      "btnSecondary": "#1F2937",
      "statusSuccess": "#4ADE80",
      "statusWarning": "#FACC15",
      "statusError": "#F87171"
    },
    "alpha": {
      "hoverSubtle": "primary @ 0.05 | textMain @ 0.05",
      "selectedBg": "primary @ 0.10",
      "selectedBorder": "primary @ 0.20",
      "brandShadow": "primary @ 0.20",
      "selection": "primary @ 0.30",
      "focusRing": "primary @ 0.50",
      "cardHoverBorder": "primary @ 0.50",
      "overlay": "#000000 @ 0.50"
    },
    "accent": {
      "danger": "#EF4444",
      "dangerHover": "#DC2626",
      "favorite": "#FACC15",
      "locked": "#F59E0B",
      "secret": "#EA580C",
      "info": "#2563EB",
      "running": "#22C55E"
    }
  },
  "typography": {
    "fontFamily": {
      "display": "'Inter', sans-serif",
      "mono": "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace",
      "icon": "'Material Symbols Outlined'"
    },
    "fontWeight": { "regular": 400, "medium": 500, "semibold": 600, "bold": 700 },
    "scale": {
      "micro":    { "size": "10px", "lineHeight": 1,        "weight": 700, "use": "tag badge / #id" },
      "caption":  { "size": "12px", "lineHeight": "16px",   "weight": 400, "use": "輔助文字、錯誤訊息" },
      "overline": { "size": "12px", "lineHeight": "16px",   "weight": 600, "letterSpacing": "0.05em", "transform": "uppercase", "use": "區段標題" },
      "body":     { "size": "14px", "lineHeight": "20px",   "weight": 400, "use": "內文" },
      "bodyMedium": { "size": "14px", "lineHeight": "20px", "weight": 500, "use": "按鈕、nav、label" },
      "cardTitle":  { "size": "14px", "lineHeight": 1.25,   "weight": 700 },
      "code":     { "size": "14px", "lineHeight": 1.625,    "weight": 400, "family": "mono" },
      "heading":  { "size": "18px", "lineHeight": "28px",   "weight": 700, "use": "Modal / App 標題" }
    },
    "iconSize": { "sm": "16px", "md": "18px", "lg": "20px", "xl": "24px" }
  },
  "spacing": {
    "base": "4px",
    "scale": [4, 6, 8, 12, 16, 20, 24, 32],
    "component": {
      "controlPadding": "12px 8px",
      "cardPadding": "20px",
      "modalPadding": "24px",
      "labelGap": "6px",
      "gridGap": "16px",
      "sectionGap": "24px"
    },
    "layout": {
      "sidebarWidth": "256px",
      "headerHeight": "75px",
      "searchWidth": "320px",
      "touchTarget": "44px"
    }
  },
  "radius": {
    "sm": "4px",
    "md": "6px",
    "lg": "8px",
    "xl": "12px",
    "full": "9999px",
    "mapping": { "chip": "sm", "badge": "md", "control": "lg", "container": "xl", "pill": "full" }
  },
  "border": { "width": "1px", "style": ["solid", "dashed(placeholder)"] },
  "elevation": {
    "z": { "sticky": 10, "modal": 50, "modalStacked": 60, "system": 100 },
    "shadow": {
      "surface": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "hover": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      "brandCta": "0 10px 15px -3px rgb(var(--color-primary) / 0.2), 0 4px 6px -4px rgb(var(--color-primary) / 0.2)",
      "panel": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      "modal": "0 25px 50px -12px rgb(0 0 0 / 0.25)"
    },
    "overlay": "rgba(0,0,0,0.5) + backdrop-blur(4px)"
  },
  "motion": {
    "duration": { "fast": "150ms", "base": "200ms", "enter": "300ms" },
    "easing": { "enter": "ease-out", "exit": "ease-in", "generic": "ease" },
    "patterns": {
      "modalIn": "opacity 0→1 + scale 0.95→1, 200ms ease-out",
      "toastIn": "translateY 8px→0 + fade, 300ms ease-out",
      "shimmer": "background-position 200%→-200%, 1.4s linear infinite"
    }
  },
  "states": {
    "hover": { "solid": "swap to *-hover token", "neutral": "overlay textMain @5%", "card": "border primary@50% + shadow.hover" },
    "focus": { "button": "ring 2px primary@50%", "input": "ring 1px primary + border primary" },
    "selected": { "bg": "primary@10%", "text": "primary", "border": "primary@20%" },
    "disabled": { "opacity": 0.5, "cursor": "not-allowed" }
  }
}
```

### 5.2 Tailwind 移植 — `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // RGB channel + <alpha-value>:讓所有語義色支援 /10 /20 /50 透明度修飾符
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",
        "bg-main": "rgb(var(--color-bg-main) / <alpha-value>)",
        "bg-sidebar": "rgb(var(--color-bg-sidebar) / <alpha-value>)",
        "bg-card": "rgb(var(--color-bg-card) / <alpha-value>)",
        "border-light": "rgb(var(--color-border-light) / <alpha-value>)",
        "text-main": "rgb(var(--color-text-main) / <alpha-value>)",
        "text-secondary": "rgb(var(--color-text-secondary) / <alpha-value>)",
        "btn-secondary": "rgb(var(--color-btn-secondary) / <alpha-value>)",
        "status-success": "rgb(var(--color-status-success) / <alpha-value>)",
        "status-warning": "rgb(var(--color-status-warning) / <alpha-value>)",
        "status-error": "rgb(var(--color-status-error) / <alpha-value>)",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem", // 4px — chip 級
        md: "0.375rem",     // 6px — badge
        lg: "0.5rem",       // 8px — 控件標準
        xl: "0.75rem",      // 12px — 容器
        full: "9999px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
```

主題變數(`src/style.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-primary: 0 159 183;        /* #009fb7 */
    --color-primary-hover: 0 127 147;  /* #007f93 */
    --color-bg-main: 244 244 248;      /* #f4f4f8 */
    --color-bg-sidebar: 255 255 255;   /* #ffffff */
    --color-bg-card: 255 255 255;      /* #ffffff */
    --color-border-light: 230 230 234; /* #e6e6ea */
    --color-text-main: 31 41 51;       /* #1f2933 */
    --color-text-secondary: 107 114 128; /* #6b7280 */
    --color-btn-secondary: 217 238 242;  /* #d9eef2 */
    --color-status-success: 47 191 113;  /* #2fbf71 */
    --color-status-warning: 254 215 102; /* #fed766 */
    --color-status-error: 254 74 73;     /* #fe4a49 */
  }

  .dark {
    --color-primary: 43 176 201;       /* #2bb0c9 */
    --color-primary-hover: 78 198 219; /* #4ec6db */
    --color-bg-main: 15 23 42;         /* #0f172a */
    --color-bg-sidebar: 13 18 28;      /* #0d121c */
    --color-bg-card: 17 24 39;         /* #111827 */
    --color-border-light: 31 41 55;    /* #1f2937 */
    --color-text-main: 229 231 235;    /* #e5e7eb */
    --color-text-secondary: 156 163 175; /* #9ca3af */
    --color-btn-secondary: 31 41 55;     /* #1f2937 */
    --color-status-success: 74 222 128;  /* #4ade80 */
    --color-status-warning: 250 204 21;  /* #facc15 */
    --color-status-error: 248 113 113;   /* #f87171 */
  }

  body {
    @apply bg-bg-main text-text-main font-display selection:bg-primary/30;
  }
}
```

### 5.3 純 CSS Variables 移植(無 Tailwind 環境)

```css
:root {
  /* ===== Color ===== */
  --color-primary: 0 159 183;
  --color-primary-hover: 0 127 147;
  --color-bg-main: 244 244 248;
  --color-bg-sidebar: 255 255 255;
  --color-bg-card: 255 255 255;
  --color-border-light: 230 230 234;
  --color-text-main: 31 41 51;
  --color-text-secondary: 107 114 128;
  --color-btn-secondary: 217 238 242;
  --color-status-success: 47 191 113;
  --color-status-warning: 254 215 102;
  --color-status-error: 254 74 73;

  /* ===== Typography ===== */
  --font-display: "Inter", sans-serif;
  --font-mono: ui-monospace, Consolas, monospace;
  --text-micro: 10px;
  --text-caption: 12px;
  --text-body: 14px;
  --text-heading: 18px;
  --tracking-overline: 0.05em;
  --tracking-tight: -0.025em;

  /* ===== Spacing (4px grid) ===== */
  --space-1: 4px;  --space-1-5: 6px; --space-2: 8px;
  --space-3: 12px; --space-4: 16px;  --space-5: 20px;
  --space-6: 24px; --space-8: 32px;

  /* ===== Geometry ===== */
  --radius-sm: 4px; --radius-md: 6px; --radius-lg: 8px;
  --radius-xl: 12px; --radius-full: 9999px;
  --border-w: 1px;

  /* ===== Elevation ===== */
  --shadow-surface: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-hover: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-brand-cta: 0 10px 15px -3px rgb(var(--color-primary) / 0.2),
                      0 4px 6px -4px rgb(var(--color-primary) / 0.2);
  --shadow-modal: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --overlay: rgb(0 0 0 / 0.5);
  --z-sticky: 10; --z-modal: 50; --z-modal-stacked: 60; --z-system: 100;

  /* ===== Motion ===== */
  --duration-fast: 150ms; --duration-base: 200ms; --duration-enter: 300ms;
}

.dark {
  --color-primary: 43 176 201;
  --color-primary-hover: 78 198 219;
  --color-bg-main: 15 23 42;
  --color-bg-sidebar: 13 18 28;
  --color-bg-card: 17 24 39;
  --color-border-light: 31 41 55;
  --color-text-main: 229 231 235;
  --color-text-secondary: 156 163 175;
  --color-btn-secondary: 31 41 55;
  --color-status-success: 74 222 128;
  --color-status-warning: 250 204 21;
  --color-status-error: 248 113 113;
}

/* 使用範例 — RGB channel 格式使透明度可自由組合 */
.btn-primary {
  background: rgb(var(--color-primary));
  color: #fff;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  font: 500 var(--text-body) / 1.25 var(--font-display);
  box-shadow: var(--shadow-brand-cta);
  transition: all var(--duration-fast);
}
.btn-primary:hover { background: rgb(var(--color-primary-hover)); }
.btn-primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgb(var(--color-primary) / 0.5);
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.card {
  background: rgb(var(--color-bg-card));
  border: var(--border-w) solid rgb(var(--color-border-light));
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  transition: all var(--duration-fast);
}
.card:hover {
  border-color: rgb(var(--color-primary) / 0.5);
  box-shadow: var(--shadow-hover);
}

.nav-item[aria-current="true"] {
  background: rgb(var(--color-primary) / 0.1);
  color: rgb(var(--color-primary));
}
```

---

## 附錄:移植到新專案的 5 條核心公理

1. **單一色相 + 透明度階**:整個介面只有一個品牌青,層次由 `5% / 10% / 20% / 50%` 透明度階生成。新專案換品牌色只需改 2 個變數。
2. **RGB channel 變數格式**是整套系統的技術地基——變數存 `R G B` 而非 hex,透明度才能在使用端自由組合。
3. **雙主題靠變數翻轉,不靠 `dark:` 前綴**:hover 方向相反(Light 變暗、Dark 變亮)要在 token 層解決。
4. **幾何律**:1px 邊框 + 8px 控件圓角 + 12px 容器圓角 + 4px 網格間距,不引入第二套數值。
5. **深度語言**:平時靠邊框分層,hover 才給灰陰影;唯一常駐陰影是 CTA 的「品牌色 20% 投影」。
