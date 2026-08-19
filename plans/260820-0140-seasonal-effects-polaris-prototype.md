# Plan — Seasonal Effects prototype trên Polaris base

**Ngày** 2026-08-20 · **Trạng thái** draft, chờ xác nhận 3 quyết định ở mục 3
**Nguồn logic** `../seasonal-effects-prototype/` (HTML thuần) + `PRD.md` v1.5
**Đích** `src/prototypes/seasonal-effects/` trong repo này

---

## 1. Đánh giá — hai bên đang lệch nhau ở đâu

### 1.1 Cái gì khớp sẵn

| Base có | Prototype HTML cần |
|---|---|
| `AdminFrame` (Frame + TopBar + Navigation) | Chrome admin thật — khỏi phải dựng lại |
| `HashRouter`, `base: './'` | Deploy Pages, deep link theo screen |
| `useMockData` 4 trạng thái | Home/Campaigns/Settings đều cần loading + empty + error |
| `src/mocks/` + `products.ts` | Resource picker product |
| `format.ts` | Ngày trong bảng campaign, `fmtD`/`fmtDT` của HTML thay bằng cái này |
| Polaris 13.9.5 + polaris-icons 9.3.1 | Gần như mọi widget trong HTML đều có bản Polaris |

### 1.2 Bốn xung đột thật, phải xử lý trước khi code

**(a) Base thiết kế cho "một prototype = một màn", app này là 6 màn có state dùng chung.**

`docs/prototype-rules.md`: *"No routing inside a prototype. One prototype is one screen or one
flow driven by local state."* Nhưng Seasonal Effects có 6 màn (Home · Campaigns · Campaign editor ·
Tab animation · Scroll to top · Settings) và **giá trị của prototype nằm đúng ở chỗ chúng nối với
nhau**:

- App embed off ở Home → chặn Publish ở Campaigns **và** ở editor (PRD 4.2.2)
- Toggle always-on ở Home và toggle ở màn module là **cùng một cờ** (PRD 9)
- Seasonal skin của campaign đang Live **ghi đè** màu nút scroll-to-top (PRD 9.2, edge case 16)
- Timezone ở Settings đổi dòng ghi chú trong tab Schedule của mọi campaign (PRD 9.3)

Tách thành 6 prototype riêng thì mất sạch 4 liên kết trên — tức mất phần đáng demo nhất.
→ **Đề xuất: 1 prototype, điều hướng bằng local state** (không thêm route react-router). Đúng chữ
"one flow driven by local state" của rule, và mỗi màn vẫn là 1 file riêng dưới `screens/`.

**(b) Sidebar 5 mục của app không có chỗ đặt.**

`AdminFrame` hiện render sidebar của *Shopify admin* (Home/Orders/Products/…) + section
"Prototypes". App thật lấy sidebar riêng qua App Bridge `<ui-nav-menu>` — khi app đang mở, 5 mục
của app hiện trong sidebar admin. Rule cấm prototype tự dựng sidebar ("do not build your own
header or sidebar"), và thay đổi chrome thì thuộc `src/shell/`.

→ **Đề xuất: mở rộng `AdminFrame` bằng một context `app-nav`** để prototype khai báo nav items,
AdminFrame render chúng thành một `Navigation.Section` mang tên app. Đây là bản mô phỏng trung
thực của `ui-nav-menu`, và dùng lại được cho mọi prototype dạng "app nhiều màn" sau này.

**(c) `no hex color` là lint error, mà domain của app này *là* màu.**

Không thể tránh: 12 seasonal palette, 3 brand colour, 6 màu + hover của nút scroll-to-top, màu
nền 12 ô artwork, và cả khung preview storefront giả (nó cố tình *không* dùng token admin — nó
đang giả làm theme của merchant).

Chỗ này phải phân biệt hai loại hex:
- **Hex là styling của UI admin** → vẫn cấm tuyệt đối, dùng `var(--p-color-*)`.
- **Hex là *nội dung* merchant chọn** (palette, brand colour, màu nút) và **hex của storefront giả**
  → là dữ liệu, không phải styling.

→ **Đề xuất: override eslint hẹp cho đúng 2 nhóm path**, kèm comment giải thích:
`src/mocks/seasonal-effects/palettes.ts` và
`src/prototypes/seasonal-effects/components/preview/**`.
Cộng thêm 1 dòng vào `docs/prototype-rules.md` nói rõ ranh giới. Đây là **sửa một rule đang được
đánh dấu non-negotiable**, nên cần bạn chốt (mục 3).

**(d) Vài widget trong HTML không có bản Polaris 1-1.**

Cụ thể: toggle switch (Polaris React 13 **không có** `Switch`), gallery ảnh có phân trang, colour
field hex + swatch, datetime picker, emoji picker, setup guide checklist. Xem bảng ánh xạ mục 4 —
mỗi cái có một cách dựng bằng component Polaris có sẵn, không thêm dependency.

### 1.3 Cái gì nên bỏ khi port

| HTML prototype | Quyết định | Vì sao |
|---|---|---|
| Web Audio oscillator (`playSample`) | **Bỏ**, thay bằng `Toast` "Sample would play here" | Không thêm giá trị review, thêm rủi ro autoplay |
| Màn `v-why` (why this structure) | **Bỏ khỏi app**, nội dung đã nằm trong `meta.ts` + PRD | Không phải màn của merchant |
| Nút `⤒ Upload` trong gallery | **Giữ**, hành vi = `Toast` như bản HTML | PRD 6.0.1 có nói tới gói trả phí |
| `admin.css` (544 dòng) | **Không port**. Chỉ giữ CSS cho khung preview storefront | Còn lại Polaris lo hết |
| `TODAY = 2026-12-16` ghim cứng | **Giữ**, chuyển vào `src/mocks/seasonal-effects/today.ts` | Mọi badge trạng thái phụ thuộc nó; demo phải đọc giống nhau mọi lần |

---

## 2. Kiến trúc đích

```
src/shell/
  admin-frame.tsx            ← sửa: nhận app nav từ context
  app-nav.tsx                ← MỚI: AppNavProvider + useAppNav (mô phỏng ui-nav-menu)

src/mocks/
  collections.ts             ← MỚI (resource picker collection)
  markets.ts                 ← MỚI (Shopify Markets, GID + primary flag)
  seasonal-effects/
    today.ts                 ← TODAY ghim cứng + helper so ngày
    campaigns.ts             ← 5 campaign fixture, shape app-owned
    presets.ts               ← 12 preset (PRD 5.1) — bộ giá trị khởi tạo
    effects.ts               ← 12 falling artwork · 4 decoration · 4 countdown style
    palettes.ts              ← 12 seasonal palette + 3 brand colour  [hex allowed]
    scroll-icons.ts          ← 30 icon SVG path (PRD 9.2)
    emoji.ts                 ← bộ emoji cho picker
    modules.ts              ← state khởi tạo của TabAnimation + ScrollToTop + Settings

src/prototypes/seasonal-effects/
  meta.ts
  index.tsx                  ← app shell: đăng ký app nav, giữ screen state, render screen
  state/
    app-state.tsx            ← Context: embed · always-on · campaigns · settings · modules
    campaign-status.ts       ← statusOf() / whenSub() / inTab() — port từ campaigns.js
    preset.ts                ← applyPreset() với rule "không xoá thứ merchant tự gõ" (PRD 5.2)
  screens/
    home.tsx
    campaigns.tsx
    campaign-editor.tsx
    tab-animation.tsx
    scroll-to-top.tsx
    settings.tsx
  components/
    toggle-row.tsx           ← dòng label + Checkbox làm on/off
    effect-section.tsx       ← Collapsible + toggle + dòng tóm tắt (PRD 6.0)
    tile-grid.tsx            ← gallery ảnh + Pagination + Upload (PRD 6.0.1)
    segmented.tsx            ← ButtonGroup variant="segmented"
    color-field.tsx          ← TextField hex + Popover + ColorPicker
    date-time-field.tsx      ← DatePicker trong Popover + Select giờ
    emoji-picker-modal.tsx
    resource-picker-modal.tsx
    fixed-time-range-modal.tsx
    publish-flow.tsx         ← dialog embed + dialog publish + toast (PRD 4.2.1, 4.2.2)
    setup-guide.tsx
    preview/
      storefront-preview.tsx ← khung store giả + canvas hạt/confetti/cursor
      effects-canvas.tsx     ← 1 canvas, 1 rAF, object pool — port từ editor.js
      browser-tab-preview.tsx← khung tab trình duyệt (PRD 9.1)
      scroll-preview.tsx     ← trang cuộn thật + nút có hover (PRD 9.2)
      preview-tokens.ts      ← palette của storefront giả  [hex allowed]
```

**Nguyên tắc**: `state/` không import Polaris; `screens/` không chứa logic dẫn xuất trạng thái;
`components/preview/**` là chỗ duy nhất có DOM/canvas thủ công.

---

## 3. Ba quyết định cần bạn chốt trước khi code

| # | Quyết định | Đề xuất | Nếu chọn khác thì đổi gì |
|---|---|---|---|
| 1 | 1 prototype 6 màn, hay 6 prototype riêng? | **1 prototype**, nav bằng local state | 6 prototype → bỏ hết cross-screen logic ở 1.2(a), state dùng chung thành module-level singleton, plan ngắn đi ~30% nhưng demo mất phần hay |
| 2 | Nới rule "no hex" cho fixture màu + preview storefront? | **Có**, override eslint 2 path + ghi vào docs | Không nới → phải encode palette dạng `rgb(31 111 74)` để lách regex (rule-lawyering, tôi không khuyên) hoặc bỏ hẳn phần chọn màu (mất PRD 6.5, 9.2, 11) |
| 3 | Sửa `AdminFrame` để nhận app nav? | **Có**, thêm `app-nav.tsx` | Không sửa → app nav thành `Tabs` trong `Page`, chấp nhận được nhưng lệch chuẩn App Bridge |

Mọi phase dưới đây viết theo phương án **đề xuất**.

---

## 4. Ánh xạ HTML → Polaris (bảng tra khi code)

### 4.1 Primitive

| HTML prototype | Polaris 13.9.5 | Ghi chú |
|---|---|---|
| `.sw` toggle switch | `Checkbox` (dòng effect) · `SettingToggle` (bật/tắt cả card) | **Polaris React 13 không có `Switch`.** Không tự vẽ switch — đó là vi phạm rule 4 |
| `.btn.pri` / `.btn` / `.btn.quiet` | `Button variant="primary"` / mặc định / `variant="tertiary"` | |
| `.seg` segmented | `ButtonGroup variant="segmented"` + `pressed` | Density, Speed, Volume, Size, Show after |
| `.pickRow` (2–3 nút lớn) | `ButtonGroup variant="segmented"`, hoặc `ChoiceList` khi cần ngữ nghĩa radio | PRD 6.0.1: "thấy đủ lựa chọn, chọn trong 1 cú bấm" |
| `.badge ok live` + `.dot` | `Badge tone="success" progress="complete"` | `progress` cho ra đúng chấm tròn, không cần CSS |
| `.badge warn` / `.neut` | `tone="attention"` / mặc định | Live=success · Scheduled=info · Paused=attention · Draft=default · Ended=default |
| `.alert warn` | `Banner tone="warning"` + `action` | |
| `.card` + `.hd h3` + `.subh` | `Card` + `BlockStack` + `Text variant="headingMd"` + `Text tone="subdued"` | |
| `.tabs` (có số đếm) | `Tabs` items có `badge` (fallback: nhồi số vào `content`) | |
| `.edTabs` (3 tab editor) | `Tabs` với `fitted={false}` | Preview nằm ngoài `Tabs` nên không đổi khi switch tab (PRD 3) |
| `.chev` + `.secBody` | `Collapsible` + `Button` `disclosure` + `ariaExpanded` | |
| `.modal` | `Modal` (`primaryAction`, `secondaryActions`) | `Modal` cần Frame → guard `useChromeHidden()` |
| `.toast` | `Toast` trong `Frame` | Cùng guard như trên |
| `table.t` | `IndexTable` + `useIndexResourceState` | |
| search + sort | `IndexFilters` + `useSetIndexFiltersMode` | Tabs lọc dùng luôn `tabs` prop của IndexFilters |
| `.bulkBar` | `promotedBulkActions` + `bulkActions` của IndexTable | Đếm dòng + Clear selection có sẵn |
| `input[type=number]` + suffix `Px` | `TextField type="number" suffix="Px"` | |
| `.cntInput` bộ đếm ký tự | `TextField showCharacterCount maxLength={30}` | PRD 9.1 |
| `select` | `Select` | Chỉ cho thứ không có hình (PRD 6.0.1) |
| `input[type=color]` + hex | `TextField` + `Popover` + `ColorPicker` | Đổi hex↔HSB bằng `hsbToHex`/`rgbToHsb`/`hexToRgb` **Polaris export sẵn** (xác nhận tên export khi code) |
| `input[type=datetime-local]` | `DatePicker` trong `Popover` + `Select` giờ/phút | Gói vào `date-time-field.tsx` dùng lại 6 chỗ |
| `.errHint` | `InlineError`, hoặc `TextField error` | |
| `#campEmpty` | `EmptyState` (`src/assets/empty-state.svg`) | Ghi rõ từ khoá không tìm thấy (PRD 4.0) |
| `.progress` / `1 of 3 done` | `ProgressBar` + `Icon CheckIcon` | |
| `#killSwitch` | `Button tone="critical"` trong `Card` + `Modal` confirm | |
| `.chips` market | `Tag` (read-only) + `Badge` cho primary | |
| `.resTile` | `InlineGrid` 3 cột `Card` clickable, hoặc `CalloutCard` | |

### 4.2 Ba widget phải tự dựng (không có bản Polaris)

Mỗi cái viết 1 lần, dùng lại — và trong comment ghi rõ **vì sao** phải tự dựng, để reviewer không
tưởng là quên tra Polaris.

1. **`tile-grid.tsx`** — gallery ảnh có phân trang (PRD 6.0.1). Polaris không có picker dạng ô
   preview. Dựng bằng `InlineGrid` + `button` unstyled bọc `Box` (border `--p-color-border-emphasis`
   khi selected) + `Pagination` của Polaris + nút `Upload` ở footer.
   Dùng cho: falling artwork (4 cột · 8/trang · 12 ô) · decoration (4 cột · 4) · skin palette
   (4 cột · 8/trang · 12) · countdown style (2 cột · 4) · scroll icon (7 cột · 30, `variant="icons"`).
2. **`effects-canvas.tsx`** — 1 canvas, 1 vòng `requestAnimationFrame`, object pool cho hạt rơi +
   confetti + cursor trail (PRD 15.3). Port thuật toán từ `editor.js` (`mk`, `drawParts`,
   `drawTrail`, `drawConf`, `burst`), bọc trong `useEffect` có cleanup **huỷ rAF khi unmount** —
   bản HTML dựa vào `VIEW_LOOPS`, React thì dựa vào cleanup.
3. **`scroll-preview.tsx`** — trang cuộn thật trong `Scrollable`, nút xuất hiện sau ngưỡng, đổi màu
   khi hover, cuộn về đầu bằng đúng easing đã chọn (PRD 9.2). Đây là điểm mấu chốt của màn đó, không
   thay bằng ảnh tĩnh được.

### 4.3 Ba chỗ cố ý *lệch* bản HTML để đúng chuẩn Shopify

| HTML | Đổi thành | Lý do |
|---|---|---|
| Icon ✎ cạnh tên campaign ở header | `Page.titleMetadata` = Badge trạng thái, và **Rename** trong `secondaryActions` | `Page` của Polaris không hỗ trợ sửa title inline; menu more-actions là pattern admin thật. Modal `Campaign name` giữ nguyên hành vi PRD 4.3 (Enter=Save, Cancel=trả tên cũ) |
| Nút `Save` cố định ở header editor | `ContextualSaveBar` khi có thay đổi chưa lưu | Đúng chuẩn admin. **Cần `useChromeHidden()` guard** (CLAUDE.md gotcha) |
| Resource picker tự dựng | `Modal` + `TextField` search + `ResourceList`/`IndexTable` chọn nhiều, kèm 1 dòng ghi *"App thật dùng App Bridge Resource Picker"* | Prototype tĩnh không có App Bridge |

---

## 5. Fixture — shape phải trung thực

Rule 7 của repo: giữ shape Admin API, GID thật, enum thật.

**Tài nguyên Shopify** → GID + enum hoa:
```ts
{ id: 'gid://shopify/Product/8291', title: 'Pine Forest Candle', status: 'ACTIVE' }
{ id: 'gid://shopify/Collection/4412', title: 'Holiday gifts', productsCount: 24 }
{ id: 'gid://shopify/Market/1', name: 'Vietnam', primary: true, enabled: true }
```

**Entity của app** (campaign, module) không phải resource Shopify → id thường, nhưng enum hoa và
field khớp mô hình khái niệm PRD 3:
```ts
interface Campaign {
  id: string;                     // 'campaign-1'
  name: string;
  preset: PresetKey;              // 'CHRISTMAS' | 'BFCM' | ... | 'SCRATCH'
  enabled: boolean;               // merchant bật/tắt
  published: boolean;             // đã từng publish → quyết định Draft vs Paused
  createdAt: string; updatedAt: string;              // ISO
  schedule: { visibilityEnabled: boolean; start: string | null; end: string | null;
              fixedRange: { enabled: boolean; days: DayRule[7] } };
  trigger:  { type: 'PAGE_LOAD' | 'DELAY' | 'ADD_TO_CART' | 'ELEMENT_CLICK';
              delay?: number; delayUnit?: 'SECONDS' | 'MINUTES'; elementClass?: string };
  targeting:{ pages: {...}; productScope: 'ALL' | 'SPECIFIC'; productIds: string[];  // GID
              collectionScope; collectionIds: string[]; excludeUrls: string[];
              marketIds: string[]; shopperType: 'EVERYONE' | 'FIRST_TIME' | 'RETURNING';
              frequency: 'ONCE_PER_DAY' | 'EVERY_PAGE_LOAD' | 'FIRST_VISIT';
              device: 'ALL' | 'DESKTOP' | 'MOBILE' };
  elements: { falling; decor; cursor; bar; skin; moments; music };
}
```

**`statusOf()` không lưu status** — dẫn xuất từ `enabled` + `published` + `TODAY` vs start/end
(PRD 4.1). Port nguyên logic từ `campaigns.js:26`, thêm nhánh `visibilityEnabled === false` →
chỉ còn `DRAFT | LIVE | PAUSED` (PRD 4.1, edge case 17).

**Fixture khởi tạo**: 5 campaign của `campaigns.js` (Christmas 2026 Live · Boxing Day Scheduled ·
New Year Paused · Lunar New Year Draft · Black Friday 2026 Ended) — bộ này phủ đủ 5 trạng thái với
`TODAY = 2026-12-16`, giữ nguyên.

Tiền/ngày đi qua `src/lib/format.ts`. `fmtD`/`dayDiff`/`whenSub` của HTML → viết lại trên
`formatDate` + helper trong `today.ts`.

---

## 6. Bốn trạng thái — ánh xạ theo màn

Toolbar `?state=` của host áp cho **cả prototype**, nên phải định nghĩa từng màn:

| Màn | `loading` | `empty` | `error` |
|---|---|---|---|
| Home | `SkeletonBodyText` trong từng card | Chưa có campaign nào → `EmptyState` "Create your first campaign", Setup guide `0 of 3` | `Banner tone="critical"` + Retry, ẩn các card dưới |
| Campaigns | `IndexTable loading` + `SkeletonBodyText` | `EmptyState` (không có campaign) và bản riêng cho **search không khớp**, ghi rõ từ khoá | `Banner tone="critical"` + Retry |
| Campaign editor | `SkeletonBodyText` bên trái, preview để placeholder | = màn Create campaign (preset `SCRATCH`, mọi effect off, badge Draft) | `Banner critical` trên cả 3 tab |
| Tab animation | Skeleton form + tab preview tĩnh | Đúng edge case 20: **message rỗng** → summary ghi `No message written yet`, preview không đổi title | `Banner critical` |
| Scroll to top | Skeleton form + preview tĩnh | Module `enabled = false` → preview ghi rõ nút không hiện | `Banner critical` |
| Settings | Skeleton từng card | Markets sync về 0 market → `EmptyState` nhỏ + link Shopify Settings → Markets | `Banner critical` trên card Markets |

---

## 7. Phase

Mỗi phase kết thúc bằng `pnpm typecheck && pnpm lint` (CLAUDE.md yêu cầu) và phải chạy được trên
`pnpm dev`.

### Phase 0 — Dọn base (nhỏ, làm trước)
1. `src/shell/app-nav.tsx`: `AppNavProvider` + `useRegisterAppNav(items)`; `AdminFrame` render thêm
   `Navigation.Section separator title="Seasonal Effects"` khi có items.
2. `eslint.config.js`: override cho `src/mocks/seasonal-effects/palettes.ts` và
   `src/prototypes/seasonal-effects/components/preview/**` — tắt riêng rule hex, kèm comment.
3. `docs/prototype-rules.md`: thêm ranh giới "hex là dữ liệu vs hex là styling".
4. `src/mocks/collections.ts`, `src/mocks/markets.ts`.
5. `pnpm new-prototype seasonal-effects` (không tạo tay — rule 5).

**Xong khi**: `#/p/seasonal-effects` mở được, sidebar hiện 5 mục của app.

### Phase 1 — Fixture + domain logic (không UI)
`today.ts` · `campaigns.ts` · `presets.ts` (12 preset PRD 5.1) · `effects.ts` · `palettes.ts` ·
`scroll-icons.ts` · `emoji.ts` · `modules.ts` · `campaign-status.ts` · `preset.ts` (rule 5.2:
preset ghi đè effect/artwork/màu, **giữ** tên · ngày · message merchant tự gõ) · `app-state.tsx`.

**Xong khi**: `statusOf()` trả đúng 5 trạng thái cho 5 fixture; `applyPreset` không xoá thứ đã gõ.

### Phase 2 — Building block dùng chung
`toggle-row` · `segmented` · `tile-grid` · `color-field` · `date-time-field` ·
`emoji-picker-modal` · `resource-picker-modal` · `effect-section`.

**Xong khi**: có 1 màn nháp render đủ 8 widget, bấm được, không hex ngoài file được phép.

### Phase 3 — Campaigns list (PRD 4.0 – 4.2.2)
`IndexFilters` (tabs 5 mục có số đếm · search theo tên · sort 6 chiều, default `updatedAt desc`) ·
`IndexTable` 8 cột · bulk `Activate/Deactivate/Duplicate/Delete` với rule riêng từng action ·
cột Actions đúng 2 icon · badge `⚠ Embed required` cạnh Create campaign · `publish-flow.tsx`
(dialog embed → dialog publish, nội dung khác nhau giữa Live và Scheduled).

**Xong khi**: chạy hết 4 bulk action trên dữ liệu thật; Ended bị bỏ qua và báo rõ số lượng
(edge case 8); Duplicate luôn ra Draft (edge case 10); Delete confirm liệt kê tên + cảnh báo Live
(edge case 9).

### Phase 4 — Campaign editor (phase lớn nhất, PRD 3, 5, 6, 7, 8)
`Page` (backAction · titleMetadata Badge · Rename · Publish) → `Layout`:
- **Trái**: `Tabs` 3 mục
  - *Elements*: card Template (grid 12 preset **luôn mở**) + 5 card nhóm effect
    (Atmosphere 3 dòng · Message & urgency · Storefront look · Shopper moments · Sound), mỗi dòng
    `effect-section` có tóm tắt khi đóng, bật toggle → tự mở (PRD 6.0)
  - *Schedule & trigger*: Visibility time (off → **ẩn** 2 field, không phải disable) · Fixed time
    range (nút Configure chỉ hiện sau khi bật) + modal 7 dòng thứ có validate · Trigger 4 lựa chọn ·
    dòng ghi chú timezone đang áp
  - *Targeting*: Display pages + resource picker · Exclude pages nhiều dòng · Market/Shopper/
    Frequency · Device + dòng cảnh báo
- **Phải**: `Layout.Section variant="oneThird"` + `Sticky` → preview + banner Request an effect /
  Ask for help. **Không remount khi đổi tab.**

Validate phải có: countdown window nằm ngoài visibility window (edge case 11) · fixed range thiếu
giờ (12) · `Mobile only` + chỉ cursor effect (15) · end date trong quá khứ (2).

### Phase 5 — Storefront preview
`storefront-preview.tsx` (khung tab + announcement bar + countdown 4 style + lights canvas +
grid sản phẩm + Cart + Thank-you) + `effects-canvas.tsx` (hạt · confetti · cursor trail) +
`preview-tokens.ts`. Seg `Desktop/Mobile` và `Home/Cart/Thanks`. Cleanup rAF khi unmount.

### Phase 6 — Home (PRD 4.2.2, 9, 14)
Card `App embed` trên cùng (toggle + badge) → `Banner warning` + Turn it on → subtitle đổi theo
embed → `setup-guide` (`N of 3 done`) → card `Always-on modules` (2 toggle **cùng cờ** với màn
module) → `Up next` → card trợ giúp có ✕ → `Resources` 3 ô.

### Phase 7 — Tab animation (PRD 9.1)
Favicon (2 nút lớn + emoji picker) · Animation 3 kiểu + dòng giải thích · Speed segmented ·
Message 1–5 dòng, `showCharacterCount maxLength={30}`, không xoá được dòng cuối (edge case 21) ·
card "Rules that stay on" · `browser-tab-preview` chạy đúng blinking/scrolling/typing, **huỷ timer
khi rời màn**.

### Phase 8 — Scroll to top (PRD 9.2)
6 nhóm cấu hình · grid 30 icon SVG · mọi màu có cặp hover · `Transparent background` **disable**
(không ẩn) 2 field nền · `Match the seasonal skin` bật sẵn + khi có campaign Live thì preview nói
rõ đang bị ghi đè (edge case 16) · `scroll-preview` cuộn thật + hover đổi màu.

### Phase 9 — Settings (PRD 9.3, 10, 11, 12)
Timezone 2 chế độ + khối "Synced from Shopify Admin" + Re-sync · Store health (speed guard 3 chế
độ, reduce-motion read-only, kill switch có confirm) · Markets read-only + primary + Re-sync +
last synced · Brand colours 3 swatch + Reset to theme + cảnh báo contrast < 4.5:1.

### Phase 10 — Hoàn thiện
4 trạng thái theo bảng mục 6 · a11y (mọi input có label thật, mọi icon-only button có
`accessibilityLabel`, badge luôn kèm chữ, chạy được bằng keyboard) · rà lại vocabulary (merchant/
storefront/variant/collection, sentence case, button là động từ) · `meta.ts` chuyển `in-review` ·
1 dòng vào `docs/` mô tả prototype · `pnpm build`.

---

## 8. Ước lượng

| Phase | Nội dung | Độ lớn |
|---|---|---|
| 0 | Dọn base | S |
| 1 | Fixture + logic | M |
| 2 | Building block | M |
| 3 | Campaigns list | M |
| 4 | Campaign editor | **XL** |
| 5 | Storefront preview | L |
| 6 | Home | M |
| 7 | Tab animation | M |
| 8 | Scroll to top | L |
| 9 | Settings | M |
| 10 | Hoàn thiện | M |

Đường tới demo được sớm nhất: **0 → 1 → 2 → 3 → 6** (Campaigns + Home chạy thật). Editor và 2
module always-on làm sau, không chặn phần đầu.

---

## 9. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| Không có `Switch` trong Polaris React 13 → dễ bị tự vẽ, vi phạm rule 4 | Chốt trước: `Checkbox` cho dòng, `SettingToggle` cho card. Ghi vào comment của `toggle-row.tsx` |
| Canvas + rAF rò rỉ khi đổi màn (React remount khác `VIEW_LOOPS` của bản HTML) | Cleanup trong `useEffect`; kiểm bằng cách đổi màn 20 lần rồi xem `Performance` |
| `Modal`/`Toast`/`ContextualSaveBar` chết khi `?chrome=off` | Guard `useChromeHidden()` ở mọi chỗ dùng — đúng gotcha trong CLAUDE.md |
| Editor phình thành 1 file 1500 dòng | Tách sẵn theo tab: `elements-tab.tsx` · `schedule-tab.tsx` · `targeting-tab.tsx` |
| Tên export utility màu của Polaris (`hsbToHex`…) khác dự đoán | Xác minh ngay đầu Phase 2, trước khi viết `color-field` |
| Tiếng Việt lọt vào UI | Copy trong app **toàn bộ tiếng Anh** (PRD 15b: v1 ra tiếng Anh); tiếng Việt chỉ trong plan/docs |

---

## 10. Định nghĩa "xong"

- 6 màn render đủ 4 trạng thái, `?state=` và `#/p/seasonal-effects` link được
- `pnpm typecheck && pnpm lint && pnpm build` sạch
- Không hex ngoài 2 path đã khai báo; không `fetch`/`XMLHttpRequest`; không dependency mới
- 4 liên kết cross-screen ở mục 1.2(a) chạy thật
- 23 edge case của PRD mục 16: phủ ít nhất 15 cái được nêu tên trong plan này, số còn lại ghi rõ
  là chưa phủ trong `meta.ts`
- Không copy `admin.css`; mọi màu admin là `var(--p-color-*)`

---

## 11. Revision 2 (2026-08-20) — sau khi verify Polaris 13.9.5 và đọc yêu cầu Built for Shopify

### 11.1 Ba chỗ plan v1 sai, đã sửa

| Plan v1 nói | Thực tế | Sửa thành |
|---|---|---|
| Dùng `SettingToggle` cho bật/tắt cấp card | `SettingToggle` **deprecated** trong 13.9.5, Polaris yêu cầu compose bằng primitive | `Card` + `InlineStack align="space-between"` + `Text` + `Badge` (On/Off) + `Button` (Turn on / Turn off) |
| Campaigns dùng `Page` mặc định | BFS: *"For resource index pages, use a full-width page"* | `<Page fullWidth>` cho Campaigns |
| Settings là các `Card` xếp dọc | BFS: dùng app settings layout pattern | `Layout.AnnotatedSection` (tiêu đề + mô tả bên trái, control trong card bên phải) |

Đã verify có export thật trong 13.9.5: `IndexFilters` · `useSetIndexFiltersMode` ·
`useIndexResourceState` · `ColorPicker` · `hsbToHex` / `rgbToHsb` / `hexToRgb` / `rgbToHex` ·
`Collapsible` · `Pagination` · `InlineGrid` · `Sticky` · `Scrollable` · `ProgressBar` ·
`ContextualSaveBar` · `Layout.AnnotatedSection`. **Không** có `Switch` — xác nhận lại quyết định
dùng `Checkbox`.

### 11.2 Mười hai điểm UI/UX tối ưu hơn bản HTML

Căn theo *Built for Shopify design requirements* và *Setup guide composition* của Shopify:

1. **Campaigns full-width** — bảng 8 cột thì trang hẹp làm cột Audience/When bị bóp (BFS index page).
2. **Cả 3 màn có preview đều là two-column** — BFS: *"For visual editors, use a two-column layout.
   This allows merchants to preview the outcome of their edits in real-time."* Bản HTML chỉ 2 cột ở
   editor; Tab animation và Scroll to top cũng là visual editor nên phải cùng layout.
3. **Settings dùng `Layout.AnnotatedSection`** — mỗi nhóm (Timezone · Store health · Markets · Brand)
   có tiêu đề + 1 câu giải thích bên trái, control bên phải. Bản HTML để mô tả chen trong card.
4. **Setup guide dựng đúng composition của Shopify** thay vì 3 dòng phẳng: header có nút ✕ dismiss và
   chevron collapse · dòng `X of Y steps completed` + `ProgressBar` · mỗi step = `Checkbox` +
   nút expand + mô tả + action button + ô illustration 80×80 · `Divider` giữa các step · step chưa
   xong đầu tiên mở sẵn · `Toast` khi tick xong một step. Giới hạn 5 step (Shopify: quá 5 thì
   merchant bỏ giữa đường) — app này có 3.
5. **Màu theo đúng semantic của BFS**: xanh = thành công · vàng = pending/paused · cam = cần chú ý ·
   **đỏ chỉ dùng cho lỗi và hành động bị chặn**. → Live `success` · Scheduled `info` ·
   Paused `attention` · Draft/Ended neutral. Banner "app embed off" là **`warning`, không phải
   `critical`** (cấu hình không sai, chỉ là chưa bật) — bản HTML dùng sắc thái đỏ. `critical` để
   dành cho kill switch và delete.
6. **Tabs đúng kỷ luật BFS**: *tabs chỉ được đổi nội dung bên dưới nó, không wrap xuống 2 dòng,
   không dịch chuyển khi switch*. → 3 tab của editor đặt **trong cột trái**, không đặt ngang cả
   trang, để rõ là chúng chỉ chi phối cột đó và preview đứng ngoài.
7. **`ContextualSaveBar`** khi có thay đổi chưa lưu, thay nút Save cố định ở header.
8. **Empty state phân biệt 2 ca**: chưa có campaign nào (CTA "Create campaign") vs search không khớp
   (echo lại từ khoá + nút Clear search). Bản HTML chỉ đổi 1 dòng chữ.
9. **Rename qua `Page.secondaryActions`** thay vì icon ✎ dán cạnh heading — `Page` không hỗ trợ sửa
   title inline, và icon cạnh title không phải pattern của admin.
10. **Mọi nội dung nằm trong container** (BFS: *"Make the majority of your app's content live in a
    container, such as a card"*) — kể cả dòng nhắc 2 module always-on ở cuối tab Elements.
11. **A11y vượt mức bản HTML**: tile trong gallery là `<button aria-pressed>`; `Collapsible` nối
    `ariaExpanded` + `ariaControls`; mọi icon-only button có `accessibilityLabel`; `Badge` luôn kèm
    chữ, không chỉ màu.
12. **Text neutral** (BFS: *"Present the majority of app text in a legible and neutral color"*) —
    chữ màu chỉ dùng cho `tone="subdued"` và `tone="critical"` ở thông báo lỗi.

### 11.3 Ba quyết định ở mục 3 — chốt theo phương án đề xuất
1 prototype 6 màn · nới `no hex` cho 2 path đã khai báo · mở rộng `AdminFrame` nhận app nav.

---

## 12. Build log (2026-08-20) — đã làm xong những gì

### 12.1 File đã tạo / sửa

**Base (Phase 0)**
- `src/shell/app-nav.ts` + `app-nav-provider.tsx` — MỚI. Prototype nhiều màn khai báo nav
  bằng `useRegisterAppNav()`, `AdminFrame` render thành một `Navigation.Section` — mô phỏng App
  Bridge `<ui-nav-menu>`. Tách 2 file vì file vừa export component vừa export hook thì vỡ Fast Refresh.
- `src/shell/admin-frame.tsx`, `src/app.tsx` — nối app nav vào chrome.
- `eslint.config.js` — override `no-restricted-syntax` cho đúng 2 path, kèm comment giải thích.
- `docs/prototype-rules.md` — thêm ranh giới "hex là dữ liệu vs hex là styling".
- `docs/getting-started.md` — thêm mục "Prototyping a whole app, not one screen".
- `src/mocks/collections.ts`, `src/mocks/markets.ts` — MỚI, dùng chung được cho prototype khác.

**Fixture (Phase 1)** — `src/mocks/seasonal-effects/`
`today.ts` · `effects.ts` · `palettes.ts` *(file duy nhất được hex)* · `presets.ts` (12 preset) ·
`campaigns.ts` (type + 5 fixture phủ đủ 5 trạng thái) · `modules.ts` · `scroll-icons.ts` (30 icon SVG,
port từ bản HTML) · `emoji.ts` (68 emoji có keyword).

**Domain logic** — `src/prototypes/seasonal-effects/state/`
`campaign-status.ts` (statusOf dẫn xuất + findConflicts) · `preset.ts` (applyPreset giữ thứ merchant
tự gõ) · `validation.ts` (12 rule chặn/cảnh báo) · `summaries.ts` · `app-state.ts` + `use-app-store.ts`.

**Building block** — `components/`
`segmented.tsx` · `options.ts` · `tile-grid.tsx` · `toggle-row.tsx` · `card-toggle.tsx` ·
`effect-section.tsx` · `color-field.tsx` · `date-time-field.tsx` · `setup-guide.tsx` ·
`publish-flow.tsx` · `resource-picker-modal.tsx` · `emoji-picker-modal.tsx` ·
`fixed-time-range-modal.tsx`.

**Preview** — `components/preview/` *(folder thứ hai được hex)*
`tile-previews.tsx` · `effects-canvas.tsx` · `storefront-preview.tsx` · `countdown.tsx` ·
`decorations.tsx` · `scroll-button.tsx` · `browser-tab-preview.tsx` · `scroll-preview.tsx`.

**6 màn** — `screens/`
`home.tsx` · `campaigns.tsx` · `campaign-editor.tsx` (+ `editor/elements-tab.tsx`,
`schedule-tab.tsx`, `targeting-tab.tsx`) · `tab-animation.tsx` · `scroll-to-top.tsx` · `settings.tsx`.

### 12.2 Thêm ngoài plan: deep-link theo màn

`?screen=home|campaigns|editor|tab-animation|scroll-to-top|settings` — màn đang mở nằm trong URL, cùng
cách `?state=` đã làm. Reviewer gửi được link tới đúng màn cần góp ý, và dùng luôn để verify từng màn.

### 12.3 Đã sửa lại sau khi tự soát

| Chỗ | Vấn đề | Sửa thành |
|---|---|---|
| `effects-canvas` | Dùng `setInterval` 250ms để "đánh thức" vòng rAF sau khi nó tự dừng — tức một timer chạy 4 lần/giây mãi mãi, đúng thứ mà cơ chế tự dừng tồn tại để tránh | Đánh thức bằng `useEffect` theo cờ bật/tắt, không có timer nào chạy khi rảnh |
| `Segmented`, `TileGrid` | Nhãn là `Text` rời, không gắn với nhóm nút → screen reader đọc 3 từ trơ trọi | Bọc `role="group" aria-label={label}` |
| `storefront-preview` | Dùng `useState({value:0})[0]` làm ô nhớ mutable — chạy được nhưng khó đọc | `useRef` |
| `campaign-editor` | Khi chưa có campaign nào (state `empty`) thì đứng ở skeleton mãi | `EmptyState` + nút Create campaign |
| Fixture | `noUncheckedIndexedAccess` làm `array[0]` thành `T \| undefined`, các helper `?? list[0]` đều lỗi type | `presets` thành `Record<PresetKey, Preset>` + mảng thứ tự; palette/market có hằng fallback có tên |

### 12.4 Verify

`pnpm typecheck` · `pnpm lint` · `pnpm build` — sạch, 0 error 0 warning.
6 màn đã render thật (headless Chrome, dump DOM) và ra đúng nội dung mong đợi, gồm bảng campaign 5 dòng
với badge trạng thái, banner cảnh báo trùng lịch, và khung preview storefront trong editor.

---

## 13. Vòng sửa UI theo feedback (2026-08-20, chiều)

### 13.1 Shell — repo này giờ chỉ chứa một app

| Sửa | Chi tiết |
|---|---|
| Bỏ banner `Prototype: … / Mock data only / Simulate state` | `prototype-host.tsx` chỉ còn lazy load + not-found. `?state=loading\|empty\|error` **vẫn chạy và vẫn link được**, chỉ không còn thanh điều khiển đè lên app |
| Bỏ mục `All prototypes` và section `Prototypes` khỏi sidebar | Sidebar còn: nav admin giả + section `Seasonal Effects` 5 mục |
| Route `/` | Trỏ thẳng vào `/p/seasonal-effects`, bỏ `PrototypeIndex` khỏi router |

### 13.2 Bỏ `ButtonGroup`, tự vẽ control

| Control | Trước | Sau |
|---|---|---|
| `Segmented` | `ButtonGroup variant="segmented"` — 4 nút to trông như 4 hành động cạnh tranh nhau | Một **track lõm** (nền `bg-surface-secondary`), ô đang chọn nổi lên bằng `bg-surface` + `shadow-100`. Đọc ra ngay là "một field có mấy lựa chọn", vẫn 1 cú bấm |
| Lựa chọn cần giải thích | Segmented + help text ở dưới | **`ChoiceCards` mới** — icon + dấu tick + tên + 1 câu, đúng mẫu ảnh: Favicon mode · 3 kiểu Animation · Content của nút scroll-to-top |
| Product/collection scope | Segmented All/Specific | **`ChoiceList` radio**, chọn `Specific` thì hiện nút `Select products` + **list product đã chọn dạng `Tag` xoá được ngay tại đó** (đúng ảnh mẫu) |
| Market | Checkbox `All markets` + ChoiceList nhiều lựa chọn | **`Select`**: `All markets` hoặc một market. Fixture Boxing Day đổi từ 3 market về 1 để select biểu diễn được đúng |
| Device | Segmented 3 ô | **`ChoiceList` radio** + help text từng dòng |

Một bug CSS tìm ra khi xem screenshot: `BlockStack` là grid nên nó **kéo giãn** con `inline-flex` → track segmented chiếm hết chiều ngang card. Sửa bằng `width: fit-content` khi không `fullWidth`.

### 13.3 Preview luôn hiện, chỉ cột config cuộn

`components/sticky-preview.tsx` — `position: sticky` + `max-height: calc(100vh - …)` + cuộn nội bộ. Áp cho
cả 3 màn có preview: campaign editor · tab animation · scroll to top. Một live preview mà cuộn mất khỏi
màn hình thì không còn là live preview.

### 13.4 Home

- **Bỏ card `Always-on modules` và `Up next`.**
- **Một cột dọc**: `Something not working as expected?` và `Resources` không còn nằm ở rail bên phải —
  chúng thuộc cùng một mạch đọc với các card khác.
- `Resources` thành 3 ô ngang, **cả ô là nút bấm** (thay vì một link xanh nằm trong hộp), icon + tên +
  mô tả thẳng một lề trái.
- **Setup guide dựng lại**: bỏ hẳn ô illustration 80×80 (mỗi step cao gấp đôi mà không nói thêm điều
  gì), progress bar chuyển `success` khi xong, không có `Divider` dưới step cuối, tiêu đề + progress +
  step gọn lại.

### 13.5 Editor

- **Template**: `size="large"`, 3 cột, tile tỉ lệ 2.4:1, tên **13–14px semibold** + dòng thứ hai là
  **khoảng ngày preset sẽ điền** (`Dec 1 – Dec 26`). Trước đó chữ 11px màu xám, đúng như phản hồi "cần to rõ".
- Mọi cặp field đổi từ `InlineStack wrap` + `Box minWidth` sang **`InlineGrid columns={{xs:1, md:2}}`** —
  hết hở khoảng trắng lệch, hai cột luôn bằng nhau.
- Tabs nằm **trong cột trái**, không kéo ngang cả trang (BFS: tab chỉ được đổi nội dung bên dưới nó).
- Subtitle gọn lại (`Dec 1 – Dec 26, 2026 · All markets · edits go live instantly`) để không rớt dòng.
- **Tab editor cũng deep-link được**: `?tab=schedule|targeting`.

### 13.6 Scroll to top

- Toàn bộ field cặp đôi → `InlineGrid` 2 cột (đây là màn bị báo "hở khoảng trắng").
- Grid 30 icon từ **7 cột → 6 cột**: 5 hàng đầy, không còn hàng cuối lẻ 2 ô.
- `Content` → `ChoiceCards` có icon.

### 13.7 Một lỗi nội dung sửa nhân đây

Banner cảnh báo trùng lịch nói *"Christmas 2026 sẽ không render"* — nghe như campaign chính của demo bị
tắt hẳn, trong khi thực tế nó chỉ nhường **đúng ngày 26/12**. `findConflicts` giờ trả về cả **cửa sổ
trùng nhau**, và câu cảnh báo ghi rõ ngày: *"both run on Dec 26 … for those days the later start date
wins, so Christmas 2026 steps aside"*.

### 13.8 Cách kiểm UI

Không đoán: render bằng headless Chrome (`--screenshot`) rồi **xem thật từng màn**. Đó là cách tìm ra
lỗi track segmented bị giãn, chữ template quá nhỏ, hàng icon lẻ, và card Resources lệch lề — không có
cái nào lộ ra qua typecheck hay lint.
