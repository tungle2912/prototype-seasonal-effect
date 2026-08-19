# Plan: Shopify Prototype Base (static, GitHub Pages)

- **Ngày**: 2026-08-19
- **Trạng thái**: ✅ Đã triển khai (2026-08-19) — còn chờ chốt mục 8 (repo public/private, tên repo GitHub)
- **Slug**: `shopify-prototype-base`
- **Repo**: `/Users/mac/Workspace/prototype-base`

## Kết quả triển khai

Tất cả 7 phase đã xong. Khác biệt so với plan (đều là cải thiện, đã verify):

| Plan | Thực tế | Vì sao |
|---|---|---|
| `base: '/prototype-base/'` | `base: './'` | Đường dẫn tương đối chạy ở mọi subpath — không phải hardcode tên repo, đổi tên repo không cần sửa config |
| `IndexFilters` cho index page | `ResourceList` + `Filters` | Ít prop bắt buộc hơn, cùng độ trung thực |
| Không có | `src/shell/chrome-state.ts` | `ContextualSaveBar` cần Frame, nên prototype phải biết chrome đang bật/tắt |
| `docs/architecture.md` | Bỏ | Layout đã mô tả trong `getting-started.md`; thêm file nữa là trùng lặp |
| 2 prototype mẫu giữ lại | Đã xoá (2026-08-19, theo yêu cầu) | Base giao đi trống, chỉ còn `_template`; xoá luôn `mocks/reviews.ts` vì chỉ demo đó dùng |

Đã verify bằng browser thật (agent-browser): index liệt kê prototype, deep link `#/p/<slug>`
hoạt động, IndexTable + bulk action + pagination, modal product picker, `ContextualSaveBar`,
validation, toast, và cả 4 state (`?state=loading|empty|error`).

3 bug phát hiện và sửa trong lúc verify:
1. Sao rating xếp dọc do wrap trong cột hẹp → `InlineStack wrap={false}` + text ẩn cho screen reader.
2. `Page` co về 564px làm layout 2 cột bị stack — do bọc trong `BlockStack` (flex item làm `Page`
   mất `max-width` + auto margin) → bỏ wrapper flex.
3. `"Discount applied to 1 products"` → pluralize.

> Bản này thay thế hoàn toàn plan "dựng base cho Shopify app" trước đó. Đây **không phải** app thật: không OAuth, không server, không DB, không webhook.

---

## 1. Outcome / Scope

### Outcome
Một **static site host trên GitHub Pages**, bundle sẵn thư viện Polaris, dùng để **dựng prototype UI cho feature mới** nhanh chóng. Mỗi feature là một thư mục; site tự động liệt kê tất cả prototype ở trang chủ. Gửi link cho PM/designer/khách xem trực tiếp trên browser, không cần cài đặt, không cần dev store.

### In scope
1. Static SPA (Vite + React + TypeScript), deploy tự động lên GitHub Pages.
2. **Polaris bundle thẳng vào build** — không phụ thuộc CDN runtime.
3. **Admin shell** mô phỏng khung Shopify admin (top bar, sidebar) để prototype trông như thật.
4. **Prototype registry**: thêm 1 folder → tự xuất hiện ở trang index, không phải sửa route thủ công.
5. Mock data theo đúng hình dạng & thuật ngữ Shopify.
6. Rules chuẩn Shopify cho prototype (design + naming + data).
7. Script tạo prototype mới.

### Non-goals
- Gọi API Shopify thật (Admin/Storefront) — toàn bộ data là mock.
- Auth, session, database, webhook, billing.
- Embed vào Shopify admin thật (cần server + App Bridge → khác hẳn mục tiêu).
- Code prototype dùng lại trực tiếp cho production (xem mục 6, Rule "prototype là đồ bỏ").

### Acceptance criteria
- [x] `pnpm dev` chạy local, trang index liệt kê prototype.
- [ ] Push lên `main` → GitHub Actions deploy, truy cập được Pages URL. **Chưa làm** — repo chưa
      init git/chưa có remote; cần chốt public/private trước (mục 8).
- [x] ~~Có ≥2 prototype mẫu (1 trang list + 1 trang detail/form) dùng Polaris.~~ Đã build và verify
      (IndexTable list + form có ContextualSaveBar), sau đó **xoá theo yêu cầu** — base giao đi trống.
- [x] Thêm prototype mới chỉ cần tạo 1 folder — không sửa file router.
- [x] Deep link tới từng prototype hoạt động (F5 không 404) — HashRouter.
- [x] `docs/prototype-rules.md` + `CLAUDE.md` tồn tại.
- [x] `pnpm lint && pnpm typecheck` sạch.

---

## 2. Quyết định kiến trúc

| Hạng mục | Chọn | Lý do |
|---|---|---|
| Bundler | Vite + React 18 + TS | Nhanh, static output hợp GitHub Pages |
| **UI** | **`@shopify/polaris` v13.9.5 (React, qua npm)** | Xem phân tích bên dưới — **không** dùng Polaris web components |
| Icons | `@shopify/polaris-icons` v9.3.1 | Bộ icon chính thức |
| Router | `react-router` v7 ở chế độ **HashRouter** | GitHub Pages không rewrite được URL; hash router miễn nhiễm 404 khi F5 |
| Đăng ký prototype | `import.meta.glob` của Vite | Auto-discover, zero config khi thêm feature |
| Mock data | Fixture TS tĩnh trong `src/mocks/` | Không cần server, type-safe |
| Deploy | GitHub Actions + `actions/deploy-pages` | Chính thức, không cần branch `gh-pages` |
| Package manager | pnpm | Nhanh |

### ⚠️ Vì sao Polaris React, không phải Polaris web components

Plan cũ chọn Polaris web components (`cdn.shopify.com/shopifycloud/polaris.js`). Với bối cảnh mới thì **sai**, 3 lý do:

1. **Yêu cầu của bạn là bundle thẳng thư viện.** Web components chỉ phân phối qua script tag CDN — không vendor được, và tự động update theo Shopify nên prototype có thể vỡ sau vài tháng mà không ai đụng vào code. Polaris React pin version trong `package.json`, build ra sao thì mãi như vậy.
2. **Không có admin chrome trên GitHub Pages.** Title bar / navigation menu của App Bridge render *bên ngoài iframe* của app, do admin thật vẽ. Trên GitHub Pages không có admin → mất luôn khung. Polaris React có sẵn `Frame` + `TopBar` + `Navigation` để **tự dựng lại khung admin** — đúng thứ prototype cần.
3. **Hệ sinh thái.** Polaris React có đủ component + `polaris-icons`, chạy standalone hoàn toàn (chỉ cần `AppProvider` + import CSS).

Đánh đổi: nếu sau này production dùng web components thì code prototype không bê thẳng sang được. Chấp nhận được — cả hai chung một design system nên **độ trung thực về hình ảnh/UX là như nhau**, mà đó mới là thứ prototype cần.

---

## 3. Cấu trúc thư mục

```
prototype-base/
├── src/
│   ├── main.tsx
│   ├── app.tsx                       # AppProvider + HashRouter + registry
│   ├── shell/
│   │   ├── admin-frame.tsx           # Frame + TopBar + Navigation giả lập admin
│   │   └── prototype-index.tsx       # trang chủ: list toàn bộ prototype
│   ├── prototypes/                   # ⭐ mỗi feature = 1 folder
│   │   ├── _template/                # copy folder này để tạo cái mới
│   │   │   ├── meta.ts               # { title, description, status, tags }
│   │   │   └── index.tsx
│   │   ├── bulk-discount-editor/
│   │   └── product-review-list/
│   ├── mocks/
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   ├── customers.ts
│   │   └── shop.ts
│   └── lib/
│       ├── registry.ts               # import.meta.glob → danh sách prototype
│       └── format.ts                 # money, date theo chuẩn Shopify
├── docs/
│   ├── getting-started.md
│   ├── prototype-rules.md            # ⭐ rules chuẩn Shopify
│   └── deployment.md
├── scripts/
│   └── new-prototype.mjs             # scaffold folder mới
├── plans/
├── .github/workflows/deploy.yml
├── CLAUDE.md
├── vite.config.ts
└── package.json
```

---

## 4. Phases

### Phase 0 — Scaffold + GitHub Pages (0.5 ngày)
1. `pnpm create vite . --template react-ts`, cài pnpm deps.
2. `vite.config.ts`: đặt **`base: '/prototype-base/'`** (bắt buộc — GitHub Pages phục vụ project site ở subpath; thiếu dòng này toàn bộ asset 404).
3. Khởi tạo git, push lên GitHub, bật Pages với source = **GitHub Actions**.
4. `.github/workflows/deploy.yml`: checkout → pnpm install → vite build → `actions/upload-pages-artifact` → `actions/deploy-pages`.

**Validation**: trang trắng mặc định của Vite hiển thị được tại URL Pages.

**Gotcha**: nếu sau này đổi sang custom domain hoặc user site (`<user>.github.io`), phải sửa `base` về `'/'`.

---

### Phase 1 — Polaris + admin shell
1. Cài `@shopify/polaris@13.9.5` + `@shopify/polaris-icons@9.3.1` (pin exact version, không dùng `^`).
2. `main.tsx`: import `@shopify/polaris/build/esm/styles.css`.
3. Bọc app bằng `<AppProvider i18n={enTranslations}>`.
4. `admin-frame.tsx` — dựng lại khung admin bằng Polaris:
   - `Frame` + `TopBar` (search giả, user menu giả)
   - `Navigation` sidebar với các mục Shopify quen thuộc (Home, Orders, Products, Customers…) + mục "Prototypes"
   - Responsive: mobile navigation toggle
5. Thêm toggle "ẩn/hiện admin chrome" — lúc chụp ảnh gửi khách thì bật, lúc soi component thì tắt.

**Validation**: một trang Polaris bất kỳ render đúng, có khung admin, không lỗi CSS.

---

### Phase 2 — Prototype registry ⭐ (phần lõi)
Đây là thứ quyết định base này có được dùng lâu dài hay không: **thêm feature phải không tốn công**.

1. `lib/registry.ts`:
   ```ts
   const modules = import.meta.glob('../prototypes/*/index.tsx')
   const metas   = import.meta.glob('../prototypes/*/meta.ts', { eager: true })
   ```
   → sinh mảng `{ slug, title, description, status, tags, Component }`, bỏ qua `_template`.
2. Route động: `/#/p/:slug` → lazy load component tương ứng (`React.lazy` + `Suspense`).
3. `prototype-index.tsx`: trang chủ dùng Polaris `IndexTable` hoặc `ResourceList` — hiển thị title, description, badge status (`draft` / `in-review` / `approved`), filter theo tag.
4. `_template/` gồm `meta.ts` + `index.tsx` tối thiểu, có comment hướng dẫn.
5. `scripts/new-prototype.mjs`: `pnpm new-prototype bulk-discount-editor` → copy `_template`, thay slug/title.

**Validation**: tạo prototype mới bằng script, refresh → tự xuất hiện ở index, deep link chạy.

---

### Phase 3 — Mock data chuẩn Shopify
1. Fixture có **hình dạng giống Admin API** (`gid://shopify/Product/123`, `handle`, `variants`, `status: ACTIVE|DRAFT|ARCHIVED`) — để sau này nối API thật thì shape đã đúng.
2. Số liệu thật tế: giá có currency, ngày tháng hợp lý, tên sản phẩm không phải "Test 1 2 3".
3. `lib/format.ts`: format tiền theo `Intl.NumberFormat`, ngày theo chuẩn admin.
4. Helper giả lập độ trễ (`await delay(600)`) để prototype có loading state thật, không "nháy" tức thì.

**Validation**: 2 prototype mẫu ở Phase 4 dùng được fixture, hiển thị đúng định dạng tiền/ngày.

---

### Phase 4 — 2 prototype mẫu
Làm mẫu để định chuẩn chất lượng cho các prototype sau:

1. **List page** — `IndexTable` + filter + bulk action + pagination + empty state + loading skeleton.
2. **Detail/form page** — `Page` (có back action, primary action) + `Card` + `FormLayout` + validation + `ContextualSaveBar` (thanh save của Shopify) + toast khi lưu.

Mỗi prototype phải thể hiện đủ **4 trạng thái**: loading / empty / error / có data. Dùng query param hoặc nút debug để chuyển state, tiện demo cho khách.

**Validation**: click qua đủ 4 state không lỗi console.

---

### Phase 5 — Rules ⭐
**A. `docs/prototype-rules.md`**:

- **Design**
  - Chỉ dùng component Polaris; **cấm** tự viết lại Button/Card/Table.
  - Dùng design token của Polaris (`--p-color-*`, `--p-space-*`), không hardcode hex/px.
  - CSS custom chỉ cho layout ngoài phạm vi Polaris, đặt cạnh component, không global.
  - Bám layout admin: `Page` > `Layout` > `Card`; đúng thứ tự primary/secondary action.
- **Nội dung & thuật ngữ**
  - Dùng đúng từ Shopify: *merchant*, *storefront*, *variant*, *collection*, *fulfillment*, *draft order*. Không "user", "item", "shop owner".
  - Copy theo Shopify content guidelines: câu ngắn, sentence case, nút là động từ ("Save", "Create discount").
  - Không lorem ipsum trong bản gửi khách.
- **Data**
  - Mock phải giống dữ liệu thật (ID dạng GID, giá có tiền tệ, ngày hợp lý).
  - **Không** đưa dữ liệu thật của khách hàng / cửa hàng vào repo (xem cảnh báo mục 6).
- **Trạng thái**
  - Prototype nào cũng phải có loading / empty / error / success.
  - `meta.ts` phải cập nhật `status` đúng thực tế.
- **Phạm vi**
  - Prototype là **đồ bỏ**: ưu tiên tốc độ và độ trung thực hình ảnh, không tối ưu kiến trúc.
  - Không thêm state management, không gọi network thật, không thêm dependency nặng.
  - Muốn lên production thì viết lại trong repo app thật — không copy-paste.

**B. `CLAUDE.md`**: bản rút gọn cho AI agent — stack, lệnh chạy, quy tắc thêm prototype (luôn qua `pnpm new-prototype`), điều cấm (tự chế component, hardcode màu, thêm dep, gọi API thật).

**Tooling**: ESLint + Prettier + tsconfig strict + rule cấm hardcode màu hex trong `.tsx`.

---

### Phase 6 — Docs & bàn giao
1. `docs/getting-started.md`: clone → install → `pnpm new-prototype <slug>` → dev → push (tự deploy).
2. `docs/deployment.md`: cách Pages hoạt động, gotcha `base`, cách đổi domain.
3. README root: link Pages + ảnh chụp index.

---

## 5. Thứ tự thực thi

```
P0 → P1 → P2 → P3 → P4 → P5 → P6
```
Tuyến tính, mỗi phase phụ thuộc phase trước. **Ước lượng ~2–3 ngày công** (nhẹ hơn nhiều so với plan app base).

---

## 6. Rủi ro

| Rủi ro | Ảnh hưởng | Giảm thiểu |
|---|---|---|
| **Repo public → prototype lộ ra ngoài** | Lộ feature chưa ra mắt / thông tin khách | Xem cảnh báo bên dưới |
| Sai `base` trong vite.config | Trắng trang, asset 404 | Ghi rõ trong deployment.md; test trên Pages ngay Phase 0 |
| Prototype bị đem vào production | Nợ kỹ thuật | Rule "đồ bỏ" + banner "PROTOTYPE" trên UI |
| Base phình thành app thật | Mất mục đích ban đầu | Non-goals rõ ràng; cấm thêm network layer |
| Polaris v13 khoá React 18 | Không lên React 19 được | Chấp nhận; prototype không cần React mới |

### ⚠️ Cảnh báo bảo mật cần bạn quyết
GitHub Pages trên **repo public thì site public** — bất kỳ ai có link đều xem được, Google có thể index. Nếu prototype chứa feature chưa công bố hoặc tên khách hàng thì đây là rủi ro thật. Ba lựa chọn:
- **Repo public** — đơn giản nhất, chỉ dùng cho nội dung không nhạy cảm.
- **Repo private + Pages private** — cần GitHub Team/Enterprise (Pages cho repo private là tính năng trả phí).
- **Host chỗ khác** (Vercel/Netlify có password protection, hoặc Cloudflare Access).

---

## 7. Việc cần verify khi bắt đầu

- [ ] Đường dẫn import CSS của Polaris v13 (`@shopify/polaris/build/esm/styles.css`) — xác nhận lại theo bản cài thực tế.
- [ ] `ContextualSaveBar` còn ở Polaris v13 hay đã đổi tên/deprecated.
- [ ] Tên chính xác của repo trên GitHub (quyết định giá trị `base`).

---

## 8. Open questions (cần bạn chốt)

1. **Repo public hay private?** → xem cảnh báo mục 6, ảnh hưởng cả lựa chọn hosting.
2. **Tên repo GitHub** là `prototype-base` chứ? Cần để set `base` đúng.
3. Có cần **route password đơn giản** (chặn người lạ ở mức tối thiểu) không, hay để mở?
4. Prototype có cần **responsive mobile** không, hay chỉ desktop admin?
5. Có cần chế độ **so sánh before/after** (đặt cạnh UI hiện tại vs UI mới) không? Khá hữu ích khi trình bày nhưng thêm việc ở Phase 2.
