# PRD — Seasonal Effects App (Shopify)

**Version** v1.5 · Draft
**Ngày** 2026-08-19
**Owner** Ly (PO/BA)
**Prototype** admin: `seasonal-effects-prototype/admin.html`

**Thay đổi so với v1.4**
- Bỏ storefront demo khỏi prototype — chỉ còn admin + PRD này.
- Campaign editor còn **3 tab**: tab `Template` gộp vào `Element` (mục 3).
- Mọi lựa chọn artwork / style là **gallery ảnh có phân trang**, không còn dropdown chữ (mục 6.0.1).
- **Tab animation** tách khỏi campaign thành **module always-on riêng** ở sidebar (mục 9.1).
- **Scroll to top** rời Settings thành **module always-on riêng** ở sidebar (mục 9.2).
- **Bỏ cursor effect module always-on.** Cursor effect chỉ còn là một effect theo mùa trong campaign (mục 6.3).
- Bỏ mục `Effects` (library, `Later`) khỏi sidebar; nó vẫn nằm ngoài scope v1 như cũ.

---

## 1. Bối cảnh & vấn đề

Merchant muốn store "có không khí lễ" (Noel, Halloween, BFCM, Tết…) để kích thích impulse buy, nhưng:

- Làm thủ công phải sửa theme/liquid, cần dev.
- Phải nhớ gỡ ra sau lễ — hầu như không ai nhớ.
- Sợ hiệu ứng làm chậm store và vỡ layout mobile.

Các app hiện có trên App Store (Dakaas, FX, Qe, Seasonly…) giải quyết được phần "thêm hiệu ứng" nhưng bỏ trống 3 thứ: **lịch chạy theo dịp**, **nhắm đúng khách**, và **chứng minh giá trị**. Hệ quả là cả category bị commodity hoá, giá đua xuống $1.89/tháng.

### Định vị v1

> Không phải "app hiệu ứng có nhiều mẫu nhất", mà là **"app trang trí theo mùa tự chạy đúng lịch, không làm chậm store"**.

Hai vế của định vị này đều là thứ đối thủ không có, và vế thứ hai — **tốc độ** — là selling point mạnh nhất vì nó trả lời đúng nỗi sợ khiến merchant không dám cài. Xem spec đầy đủ ở **mục 15**; các ngưỡng ở đó là ràng buộc sản phẩm, không phải mục tiêu kỹ thuật để cân nhắc.

---

## 2. Scope

### Trong v1

| Nhóm | Nội dung |
|---|---|
| Campaign | Tạo/sửa/nhân bản/xoá/bật/tắt campaign, preset, lịch chạy, trigger, targeting |
| Campaign list | Search theo tên · sort theo name/created/updated · chọn nhiều dòng + bulk action · cột Actions |
| Effects (trong campaign) | Falling effect · Decorations · Cursor effect · Announcement bar + countdown · Seasonal skin · Cart & thank-you moments · Background music |
| Always-on modules (sidebar) | **Tab animation** (mục 9.1) · **Scroll to top** (mục 9.2) |
| Store health | Speed guard, reduce-motion, kill switch |
| Brand | Đọc màu từ theme, cho phép ghi đè, kiểm tra tương phản |
| Markets | Sync read-only từ Shopify Markets |
| Support | Banner "Request an effect / Ask for help" |

### Ngoài v1 (Later)

- **Effects library** màn riêng (v1 chọn effect ngay trong campaign; mục sidebar đã bỏ)
- **Cursor effect always-on** (v1 chỉ có bản theo mùa trong campaign)
- Product image decoration (mũ/viền/badge lên ảnh sản phẩm)
- Games (advent calendar, hidden object hunt)
- Custom artwork upload

### Không làm

- Bất cứ thứ gì trên trang checkout (Shopify không cho, và không nên).
- Ghi đè file theme hoặc file ảnh sản phẩm.
- **Không làm feature đo hiệu suất.** Không A/B split, không đo conversion / time on site,
  không chạy Lighthouse mỗi đêm, không công bố speed score trong app. Xem mục 13.
- **Không có màn Results.** Không có báo cáo hiệu quả theo từng effect.

---

## 3. Mô hình khái niệm

```
Shop
├── Settings (1)              ← store-wide, không theo mùa
│   ├── timezoneMode
│   ├── speedGuard
│   ├── accessibility
│   ├── brandColours
│   └── markets (read-only, sync từ Shopify)
├── TabAnimation (1)          ← always-on module (mục 9.1)
│   ├── enabled
│   ├── favicon   { mode: emoji | siteFavicon, emoji }
│   ├── animation { style: blinking | scrolling | typing, speed }
│   └── messages[1..5]        ← mỗi message tối đa 30 ký tự
├── ScrollToTop (1)           ← always-on module (mục 9.2)
│   ├── enabled
│   ├── behaviour { scrollAnim, buttonAnim, showAfter }
│   ├── button    { content, icon, text, colours + hover twins,
│   │               transparentBg, border{width,style,colour,hoverColour},
│   │               shape, size, matchSeasonalSkin }
│   └── placement { position, offsetX, offsetY, device }
└── Campaign (n)              ← theo mùa, có vòng đời
    ├── name, preset, createdAt, updatedAt
    ├── schedule { start, end, timezoneMode, fixedRange[7] }
    ├── trigger  { type: pageLoad | delay | addToCart | elementClick, delay?, elementClass? }
    ├── targeting { pages[], productScope, productIds[], collectionScope, collectionIds[],
    │               excludeUrls[], markets, shopperType, frequency, device }
    └── elements { falling, decor, cursor, bar (+countdown{start,end,followCampaign}),
                   skin, moments, music }
```

**Campaign editor chia thành 3 tab**, preview bên phải **không đổi khi chuyển tab** — merchant sửa
tab nào cũng thấy kết quả ngay trên cùng một khung preview:

| Tab | Nội dung |
|---|---|
| **Elements** | Template (preset) ở card đầu, rồi 7 effect gom theo nhóm và collapse được (mục 6.0) |
| **Schedule & trigger** | Visibility time (bật/tắt được), display in fixed time range, trigger (mục 7) |
| **Targeting** | Display pages, market, shopper, frequency, device (mục 8) |

**Vì sao Template gộp vào Element.** Chọn dịp lễ và chỉnh xem nó trông ra sao là **một việc**, không phải
hai. Tách ra 2 tab thì merchant chọn preset ở tab 1, sang tab 2 mới thấy nó làm gì, thấy sai lại quay
về tab 1 — mỗi lần đổi ý là 2 lần chuyển tab. Gộp lại thì đổi preset và thấy kết quả nằm trên cùng một
màn hình.

**Rule của card Template**
- Card đầu tiên trong tab Elements. Grid preset **luôn hiện**, không có nút `Change` / `Done` và không gấp lại.
- Ô đang chọn có viền đậm — đó là chỉ báo trạng thái duy nhất cần thiết, nên không cần thêm chip tên preset.
- Lý do bỏ nút gấp: đổi preset là việc merchant làm ngay khi mở campaign, và một nút `Change` biến nó
  thành 2 cú bấm. Grid 12 ô cao 3 hàng, không đáng để đánh đổi thêm một bước.
- Tên campaign **không** nằm ở đây — nó ở header, sửa qua icon ✎ (mục 4.3).

**Nguyên tắc phân chia**: cái gì **có mùa** thì nằm trong Campaign; cái gì **luôn có** thì là **module riêng
ở sidebar**. Đây là lý do tab animation và scroll-to-top không nằm trong campaign — chúng không được
biến mất khi Noel kết thúc.

### 3.1 Layout editor & live preview

**Editor không chia 50/50.** Dùng đúng cấu trúc 2 cột chuẩn của Polaris: `Layout.Section` (primary)
cho phần editor, `Layout.Section variant="oneThird"` cho preview. Chia đôi làm khung preview to hơn
mức cần thiết trong khi form — nơi merchant thực sự làm việc — bị bó lại còn một nửa. Áp cho cả 3 màn
có preview: campaign editor, Tab animation, Scroll to top.

**Mobile là mặc định, desktop mở trong modal.**

| Rule | Lý do |
|---|---|
| Preview trong rail 1/3 **luôn là khung mobile** (~320px), sticky | Phần lớn traffic storefront là mobile, và khung điện thoại vừa đúng bề rộng của rail |
| Chọn `Desktop` ở segmented Device → **mở modal `size="large"`** và render preview desktop trong đó | Storefront desktop cần bề rộng thật; nhồi layout 1440px vào 1/3 màn hình thì không kiểm được gì |
| Đóng modal → quay về mobile. Khung mobile **không remount** khi mở/đóng modal, cũng như khi đổi tab | Remount là restart tuyết — xem mục 6.0 |
| Trang preview: **Home · Cart**. Không có trang cảm ơn | Trang cảm ơn thuộc checkout, không preview được — mục 6.6 |
| Khung mobile: grid sản phẩm 2 cột; desktop 4 cột | Theme thật reflow đúng như vậy, 4 thẻ rộng 70px không đọc ra storefront |
| Cursor trail **không chạy** trong khung mobile | Desktop-only, mục 6.3 |
| Nút `Add to cart` trong preview bắn đúng moment add-to-cart | Mỗi moment bật lên đều phải kiểm được ngay trong preview (mục 6.6) |

### 3.2 Back action trên mọi page

Mọi `Page` đều có `backAction`, không chỉ campaign editor:

| Page | Back về |
|---|---|
| Campaigns · Tab animation · Scroll to top · Settings | Home |
| Campaign editor (mọi trạng thái: data / loading / empty / error) | Campaigns |
| Home | Không có — đây là gốc |

**Lý do.** Sidebar cho biết merchant **đang ở đâu**, không cho biết **đường ra**. App chạy trong iframe
của admin nên nút back của trình duyệt không đáng tin, và một màn cấu hình dài mà không có back thì
merchant phải nhắm lại vào sidebar để thoát. Back action của trạng thái error cũng phải có — đó chính
là lúc merchant cần thoát nhất.

---

## 4. Campaign — trạng thái & vòng đời

### 4.0 Màn danh sách Campaign

Bảng campaign dùng **Polaris IndexTable**: mỗi dòng có checkbox, chọn 1 hoặc nhiều dòng thì hiện
thanh bulk action.

| Thành phần | Rule |
|---|---|
| Checkbox từng dòng | Chọn/bỏ chọn 1 campaign. Checkbox ở header chọn **toàn bộ dòng đang hiển thị** (đã lọc + đã search), không phải toàn bộ database |
| Bulk action | `Activate` · `Deactivate` · `Duplicate` · `Delete`, kèm số dòng đang chọn và nút `Clear selection` |
| Search | Theo **tên campaign**, khớp chuỗi con, không phân biệt hoa thường. Không tìm thấy → empty state ghi rõ từ khoá |
| Sort | `name` (A→Z, Z→A) · `created_at` (mới/cũ nhất) · `updated_at` (mới/cũ nhất). Mặc định `updated_at` mới nhất |
| Cột | Checkbox · Campaign · When · Audience · Created · Updated · Status · **Actions** |
| Cột Status | **Chỉ badge trạng thái.** Không có toggle trong bảng |
| Cột Actions | **Đúng 2 icon: ✎ Edit và 🗑 Delete.** Không có menu `⋯` |
| Bật / tắt một campaign | Tick checkbox dòng đó rồi bấm **Activate** / **Deactivate**. Một dòng hay hai mươi dòng dùng chung một cơ chế — không có hai đường bật/tắt khác nhau để đồng bộ và để test |
| Click vào dòng | Mở campaign editor |
| Tab lọc | Vẫn giữ `All · Live · Scheduled · Not running · Ended`, số đếm tính lại theo dữ liệu thật |

**Rule của từng bulk action**

| Action | Rule |
|---|---|
| Activate | Áp dụng rule publish của mục 4.2.1 và 4.2.2: embed off → chặn và mở dialog embed; có campaign chưa từng publish → dialog `Publish N campaigns now?`. Campaign **Ended** bị bỏ qua (phải sửa ngày trước) |
| Deactivate | `enabled = false` cho mọi dòng đã chọn → Paused (hoặc Draft nếu chưa từng publish) |
| Duplicate | Bản sao tên `{name} copy`, luôn ở trạng thái **Draft** (`enabled = false`, `published = false`), `created_at = updated_at = now`. Không bao giờ tự lên storefront |
| Delete | **Bắt buộc confirm**, liệt kê tên campaign sẽ xoá, cảnh báo campaign đang Live sẽ tắt ngay. Không undo |

Mọi action làm đổi cấu hình đều cập nhật `updated_at`. Sau khi action xong, bỏ chọn toàn bộ.

**Badge `Embed required`** đặt ngay **bên trái nút Create campaign**, chỉ hiện khi app embed đang off.
Click vào badge mở đúng dialog hướng dẫn ở mục 4.2.2 với nút chính **Enable now**. Badge biến mất
ngay khi embed được bật.

### 4.1 Trạng thái

Trạng thái **không lưu trực tiếp**, mà suy ra từ 2 biến:
- `enabled` (boolean) — merchant bật hay tắt
- `today` so với `start`/`end`

| Trạng thái | Điều kiện | Hiển thị |
|---|---|---|
| **Draft** | `enabled = false` và chưa từng bật lần nào | Badge xám, dòng mờ |
| **Scheduled** | `enabled = true`, `today < start` | Badge xám |
| **Live** | `enabled = true`, `start ≤ today ≤ end` | Badge xanh, chấm nhấp nháy |
| **Paused** | `enabled = false` và đã từng bật | Badge vàng, dòng mờ |
| **Ended** | `today > end` | Badge xám, dòng mờ. **Bulk Activate bỏ qua** và báo rõ đã bỏ qua, phải sửa ngày trước |

Tab lọc: `All · Live · Scheduled · Not running (Draft + Paused) · Ended`.

**Khi `Visibility time` bị tắt** (mục 7.1): không có `start`/`end` để so, nên campaign chỉ có thể là
**Draft · Live · Paused**. Không bao giờ có Scheduled hay Ended, và merchant phải tự tắt khi hết dịp —
UI phải nói rõ điều đó ngay tại toggle `Visibility time`.

### 4.2 Rule chuyển trạng thái

- **Activate** (bulk action, hoặc nút Publish trong editor): `enabled = true` → hệ thống tính lại ra Live hoặc Scheduled tuỳ ngày. Merchant **không** chọn trực tiếp Live/Scheduled.
- **Deactivate**: `enabled = false` → Paused (nếu đã từng bật) hoặc Draft.
- Campaign **Ended**: Activate không có tác dụng và bị bỏ qua kèm thông báo. Muốn chạy lại phải mở ra đổi ngày → khi `end` được đẩy về tương lai, Activate ăn lại.

### 4.2.1 Confirm khi publish lần đầu — BẮT BUỘC

Bật một campaign **chưa từng publish** (`published = false`) luôn phải qua dialog xác nhận. Từ lần thứ hai trở đi bật/tắt thẳng, không hỏi.

**Dialog `Publish "{name}" now?`**

| Phần | Nội dung |
|---|---|
| Tiêu đề | `Publish "{campaign name}" now?` |
| Câu dẫn — nếu sẽ thành **Live** | *"This puts the campaign on your live storefront. Shoppers will start seeing it right away."* |
| Câu dẫn — nếu sẽ thành **Scheduled** | *"This schedules the campaign. It will start on its own on the start date — you will not need to come back."* |
| Tóm tắt | Runs (khoảng ngày) · Audience (market + shopper type) · Effects on (số effect đang bật) |
| Nút | `Cancel` / `Publish` |

**Rule**
- Cancel → **không đổi gì**: campaign giữ nguyên trạng thái, lựa chọn dòng vẫn còn để merchant thử lại.
- Publish → `published = true`, `enabled = true`, trạng thái tính lại theo ngày, hiện toast/modal xác nhận.
- Dialog xuất hiện ở **cả hai nơi**: bulk **Activate** trong bảng Campaigns, và nút Publish trong campaign editor.
- Nội dung dialog phải khác nhau giữa Live và Scheduled — merchant cần biết cái này lên ngay hay đợi tới ngày.

### 4.2.2 Phụ thuộc App embed — kiểm tra trước khi publish

**Nguyên tắc: không có app embed thì không có gì hiển thị, dù campaign đang Live.** Đây là nguồn ticket support số một của mọi app storefront trên Shopify — merchant publish xong, ra store không thấy gì, tưởng app hỏng.

**App embed sống ở Home, không phải Settings.** Đây là control mà merchant cần thấy và bấm ngay khi
mở app — đặt trong Settings (nơi ít ghé) trì hoãn đúng lúc cấp bách nhất. Card `App embed` là thứ đầu
tiên trên Home, phía trên cả banner cảnh báo.

**Rule**

1. App phải **biết trạng thái app embed** và hiển thị nó ở 4 chỗ:

| Chỗ | Khi embed OFF |
|---|---|
| Home — card `App embed` (trên cùng) | Toggle chuyển off, badge đổi `On` → `Off`, sub đổi thành *"Not active — the storefront is showing none of your effects"* |
| Home — banner cảnh báo (ngay dưới card) | *"Nothing is showing on your storefront — the app embed is off, so every campaign below is inactive no matter what its status says."* + nút **Turn it on** |
| Home — subtitle | Đổi từ *"Christmas is live"* thành *"Christmas cannot run — the app embed is off"* |
| Home — Setup guide | Bước 1 chuyển về chưa xong, đếm lại `0 of 3 done`, có nút **Turn on** |
| Campaigns + Campaign editor | Banner cảnh báo riêng, nội dung phù hợp ngữ cảnh |
| Campaigns — cạnh nút Create | Badge `⚠ Embed required` bên trái nút **Create campaign**, click mở dialog hướng dẫn (mục 4.0) |

2. **Chặn publish khi embed off.** Bấm Publish (hoặc bulk Activate) khi embed đang off → **không** publish, mà mở dialog hướng dẫn:

> **Turn on the app embed first**
> Nothing this app does reaches your storefront until the embed is enabled in your theme.
> A campaign can be published without it, but shoppers will see nothing.
> 1. Open your theme editor
> 2. Go to **App embeds** in the left panel
> 3. Switch on **Seasonal Effects**, then Save
>
> `[Not now]` `[Enable now]`

3. Nút **Enable now** deep-link thẳng tới theme editor với app embed được chọn sẵn (Shopify hỗ trợ URL dạng này) — không bắt merchant tự đi tìm.
4. Sau khi bật, app **tự kiểm tra lại** trạng thái embed khi merchant quay lại tab admin, không bắt bấm refresh.
5. Trạng thái embed phải được kiểm tra lại **khi merchant đổi theme** — theme mới thường chưa bật embed.

**Luồng đầy đủ**

```
Merchant bấm Publish
   ├── embed OFF  → dialog "Turn on the app embed first"
   │                 → Open theme editor → bật → quay lại → app tự nhận
   │                 → bấm Publish lại
   └── embed ON   → dialog "Publish {name} now?"
                     ├── Cancel  → không đổi gì
                     └── Publish → Live hoặc Scheduled tuỳ ngày
```

### 4.3 Đổi tên campaign

Tên campaign nằm ở **header của editor**, không phải một field trong tab.

- Bên phải tên có icon **✎**; click mở modal `Campaign name` gồm 1 input và 2 nút `Cancel` / `Save`.
- `Save` → cập nhật tên trên header. `Enter` trong input = `Save`.
- `Cancel` (và click ra ngoài modal) → **trả về tên cũ**, không lưu gì.
- Tên rỗng → header hiển thị `Untitled campaign`, vẫn lưu được vì tên chỉ dùng nội bộ.
- Tên **không hiển thị trên storefront**.

### 4.4 Xung đột giữa các campaign

Khi 2 campaign cùng Live trong một khoảng thời gian và cùng nhắm một market:

- Hệ thống **cảnh báo ở màn Campaigns** ngay khi lưu, không đợi tới ngày.
- Rule giải quyết: **campaign có ngày bắt đầu muộn hơn thắng**. Campaign còn lại tự động không render (không tự tắt, chỉ không hiển thị) để merchant không mất cấu hình.
- Không bao giờ render 2 seasonal skin cùng lúc.

---

## 5. Preset

Preset là **bộ giá trị khởi tạo**, không phải ràng buộc.

### 5.1 Danh sách v1

Thứ tự trong grid: 4 dịp bán chạy nhất trước (Christmas · Black Friday · Cyber Monday · Halloween),
rồi phần còn lại, `Start from scratch` cuối cùng.

| Preset | Falling | Skin | Countdown style | Khoảng ngày mặc định | Ghi chú |
|---|---|---|---|---|---|
| Christmas | Snowfall | Pine & red | Pill | 1–26/12 | Bật đủ 6 effect (trừ music) |
| Black Friday | Cash | Đen | Labelled | 27/11–1/12 | Tắt decorations + cursor |
| **Cyber Monday** | Lightning | Electric blue | Labelled | 30/11–1/12 | 24 giờ, countdown `Labelled` vì khách so giá nhiều tab |
| Halloween | Bats | Amber | Digit boxes | 25/10–1/11 | Tắt cart moments |
| **Singles' Day 11.11** | Gift boxes | Đỏ | Labelled | 11/11 (1 ngày) | Countdown là trọng tâm — chỉ đúng một ngày |
| Valentine | Hearts | Đỏ | Plain text | 7–15/2 | |
| Lunar New Year | Blossom | Đỏ & vàng | Pill | 10–20/2 | |
| **Mother's Day** | Bouquets | Rose | Plain text | 3–9/5 | Bật cursor trail; countdown nhắc mốc kịp giao hàng |
| **Father's Day** | Gift boxes | Navy | Pill | 14–20/6 | |
| **Summer sale** | Sunshine | Sun | Plain text | 21/6–31/7 | Dài nhất, nhẹ nhất — tắt decorations, cursor và cart moments |
| Back to school | Sparkle | Xanh | — (tắt countdown) | 10/8–5/9 | Tối giản nhất |
| Start from scratch | — | None | — | rỗng | Tất cả tắt |

Ngày mặc định chỉ điền khi field còn rỗng (mục 5.2) — đổi preset không xoá ngày merchant đã nhập.

### 5.2 Rule khi đổi preset

Merchant đổi preset bất cứ lúc nào. Khi đổi:

| Trường | Hành vi |
|---|---|
| Effects on/off, artwork, decoration style, màu skin, countdown style, cart moments | **Ghi đè** theo preset mới |
| Campaign name | **Giữ**, nếu merchant đã tự đặt tên. Chỉ ghi đè nếu tên hiện tại đang là tên mặc định của một preset |
| Ngày bắt đầu / kết thúc | **Giữ**, nếu đã có giá trị. Chỉ điền nếu đang rỗng |
| Nội dung announcement bar | **Giữ**, nếu merchant tự viết. Ghi đè nếu đang là text mặc định của preset |
| Audience / pages / frequency | **Luôn giữ** — preset không đụng tới |
| Tab animation, scroll-to-top | **Luôn giữ** — chúng là module always-on, preset của campaign không đụng tới |

Quy tắc chung: **preset không được xoá thứ merchant tự gõ.**

### 5.3 Effect fallback

Mỗi preset kèm bộ artwork riêng (mũ phù thủy cho Halloween, nơ cho Valentine…). Nếu artwork của một preset chưa có, dùng artwork mặc định và **log lại** để bổ sung, không để trống.

---

## 6. Spec từng effect

### 6.0 Cách tab Elements được tổ chức

Sau card Template (mục 3) là 7 effect gom thành 5 card theo **việc chúng làm cho shopper**, thứ tự từ
thứ shopper cảm nhận trước đến thứ chạm tới họ sau:

| Card | Effect | Vì sao gom chung |
|---|---|---|
| **Atmosphere** | Falling effect · Decorations · Cursor effect | Trang trí môi trường, chạy suốt thời gian shopper ở trên trang |
| **Message & urgency** | Announcement bar + countdown | Thứ duy nhất shopper **đọc** thay vì **cảm nhận** |
| **Storefront look** | Seasonal skin | Đổi màu 5 thành phần có sẵn, không thêm thành phần mới |
| **Shopper moments** | Cart & thank-you | Bắn theo sự kiện, không chạy liên tục |
| **Sound** | Background music | Mặc định tắt, và là thứ duy nhất phát ra tiếng |

Cuối tab có **một dòng nhắc** trỏ sang 2 module always-on (`Tab animation`, `Scroll to top`), để merchant
đi tìm chúng trong campaign không bị bế tắc.

**Rule của từng dòng effect**

- Mỗi dòng có **icon collapse (chevron)** ở bên trái toggle; chevron quay 90° khi mở.
- Click bất kỳ đâu trên dòng (trừ toggle) để mở/đóng.
- Các dòng **độc lập**: mở dòng này không đóng dòng khác, để so sánh 2 effect cạnh nhau.
- **Bật toggle của một dòng thì dòng đó tự mở ra.** Merchant vừa bật cái gì thì luôn muốn xem nó là gì —
  bắt họ bấm thêm một lần nữa là một bước vô nghĩa.
- Tắt toggle **không** đóng dòng: họ có thể đang so sánh cấu hình trước khi bỏ.
- Dòng đóng vẫn phải hiện **tóm tắt cấu hình hiện tại** (ví dụ `Snowfall · medium · brand colour`), để
  không cần mở mới biết đang set gì.

### 6.0.1 Mọi lựa chọn hình ảnh là gallery, không phải dropdown

**Nguyên tắc: không ai biết `Sparkle` trông như thế nào từ chữ `Sparkle`.** Mọi trường mà giá trị là một
thứ **nhìn thấy được** đều dùng một grid ô có preview thật, không dùng `<select>`:

| Trường | Grid | Preview trong mỗi ô |
|---|---|---|
| Falling effect — artwork | 4 cột · 8 ô/trang · 12 artwork | Nền màu theo mùa + artwork rải như lúc đang rơi |
| Decorations — style | 4 cột · 4 style | Hình thu nhỏ của đúng vị trí nó gắn vào (dây đèn mép trên, tuyết ở footer…) |
| Seasonal skin — palette | 4 cột · 8 ô/trang · 12 palette | Ô màu kèm hình nút và badge thu nhỏ |
| Countdown style | 2 cột · 4 style, **ô thấp dạng dải** (tỉ lệ ~5:1), nền sáng | Đúng cách con số sẽ hiện trên bar. Countdown là một dải số: ô 4:3 tốn hết chiều cao vào nền trống và đẩy phần còn lại của bar ra ngoài màn hình, còn 4 ô nền gần-đen liền nhau đọc ra như một cảnh báo |
| Scroll to top — icon | 7 cột · 30 icon (mục 9.2) | Chính icon đó, vẽ bằng SVG |

**Rule chung của grid**
- Ô đang chọn có **viền xanh** (hoặc nền đậm với grid icon), không chỉ đổi màu chữ.
- Grid **phân trang** khi quá một trang; nút `‹ ›` kèm chỉ số `1/2`. Không bao giờ cho grid dài hơn 2 hàng,
  vì phần dưới sẽ đẩy phần cấu hình còn lại xuống ngoài màn hình.
- Grid nào cho **upload artwork riêng** thì nút `⤒ Upload` nằm ở góc dưới trái, cùng hàng với phân trang.
  Upload thuộc gói trả phí, và **áp cùng ngưỡng kích thước** ở mục 15.1 — ảnh nặng không được phép
  lọt qua đây để làm chậm store.
- Chỉ còn dùng `<select>` cho những thứ **không có hình**: track nhạc, hành vi khi countdown về 0, kiểu
  animation của scroll, market, shopper, frequency.

**Những trường 2–3 lựa chọn thì hiện hết, không cuộn.** `Colour` (stock / brand), `Density` (light /
medium / dense), `Position`, `Device`… dùng nút lớn hoặc segmented control — thấy đủ lựa chọn
và chọn xong trong **một** cú bấm, thay vì mở dropdown rồi chọn (hai cú bấm) cho một trường chỉ có
ba giá trị.

**Đại lượng đo được thì dùng slider, không phải nút cũng không phải ô số.** Dùng Polaris `RangeSlider`
cho: `Volume` (0–100%, bước 5), `Speed` của tab animation (5 mức), `Border width` và `Side / Bottom
offset` của scroll-to-top (px). Ba nút `Quiet · Medium · Loud` buộc merchant đoán khoảng cách giữa hai
mức và không cho họ dừng ở giữa; một ô số thì buộc họ **gõ** một giá trị mà chỉ có thể đánh giá bằng
mắt. Slider cho kéo trong lúc đang nhìn preview — đó là lý do preview nằm ngay cạnh. Mỗi slider hiện
số đọc được ở cuối track (`45%`, `20px`, `Normal`), không chỉ có cái bóng nước hiện lúc kéo.

### 6.1 Falling effect

| Thuộc tính | Giá trị |
|---|---|
| Effect | Snowfall, Falling leaves, Sparkle, Hearts, Cash, Gift boxes, Bats, Lightning, Blossom, Diwali lamps, Bouquets, Sunshine (12 loại) — chọn trong gallery ảnh (mục 6.0.1) |
| Colour | `Stock artwork` (màu gốc) hoặc `Brand palette` (đổi sang màu thương hiệu) — 2 nút, không dropdown |
| Density | Light / Medium / Dense — segmented control |

**Rule render**
- Lớp hiệu ứng là overlay trong suốt, `pointer-events: none` — **không bao giờ chặn click**. Đây là khiếu nại 1-sao phổ biến nhất của category này.
- Số hạt thực tế = `density × hệ số speed guard` (mục 10).
- Hạt được tái sử dụng (object pool), không tạo mới liên tục.
- Không render trên checkout.

### 6.2 Decorations

Trang trí tĩnh gắn vào một vị trí cố định: dây đèn mép trên · vòng lá ở header · lớp tuyết ở footer · mạng nhện ở 4 góc.

- Dây đèn nhấp nháy: **tắt animation** nếu shopper bật reduce-motion, giữ nguyên đèn tĩnh.
- Không được đè lên announcement bar → khi bar bật, decoration đẩy xuống dưới bar.

### 6.3 Cursor effect

| Thuộc tính | Giá trị |
|---|---|
| Particles | Same as the falling effect / Sparkle |
| Length | Short / Medium / Long |

Cursor effect **chỉ tồn tại trong campaign**, không có bản always-on. Lý do: con trỏ có thương hiệu là
thứ gắn với dịp lễ (mũ phù thủy, bông tuyết), và một module riêng cho nó khiến sidebar dài ra mà thêm
đúng một quyết định merchant hiếm khi đổi. Ai muốn nó chạy quanh năm thì để campaign không có
`Visibility time` (mục 7.1).

**Rule không cho tắt** — đây là những thứ khiến cursor effect của đối thủ bị review 1 sao:

1. **Desktop only.** Thiết bị cảm ứng không có con trỏ → script **không tải** trên mobile, không tốn byte.
2. **Con trỏ hệ thống quay lại khi hover input, link, button, select, textarea.** Con trỏ bị ẩn trên một
   field đang gõ là khiếu nại làm merchant gỡ app.
3. **Không bao giờ chặn click.** Một canvas overlay duy nhất, `pointer-events: none`.
4. **Respect reduce-motion.** Shopper bật giảm chuyển động: không trail, không burst.
5. **Trần cứng 120 hạt** trên màn hình, không phải một setting. Vượt thì hạt cũ nhất bị xoá.
6. **Tự dừng khi không có gì chuyển động**: trail rỗng hoặc tab bị ẩn → huỷ vòng lặp rAF.
7. Vẽ trên **cùng một canvas** với các effect khác (mục 15.3), không tạo DOM element cho từng hạt.

### 6.4 Announcement bar + countdown

| Thuộc tính | Giá trị |
|---|---|
| Message | text tự do |
| Show countdown | on/off |
| **Countdown runs** | **Start time / End time riêng của countdown**, tách khỏi lịch campaign |
| Follow the campaign schedule instead | on/off — bật thì countdown dùng luôn visibility time của campaign và 2 field trên bị disable |
| Countdown style | Pill · Plain text · Digit boxes · Labelled — grid ô thấp dạng dải (mục 6.0.1) |
| When it hits zero | Hide the bar / Keep bar, drop timer / Switch to follow-up message |

**Rule**
- Bar chèn **trên cùng và đẩy nội dung xuống**, không phủ đè menu.
- Nếu theme đã có announcement bar: mặc định **xếp bên dưới bar của theme**. Có tuỳ chọn thay thế, không bao giờ tự động ghi đè.
- Countdown có **mốc thời gian riêng** (`countdown.start` / `countdown.end`), không dùng chung với
  `campaign.end`. Lý do: một campaign Noel chạy cả tháng nhưng flash sale chỉ đếm ngược 3 ngày cuối.
- Mặc định 2 field này **điền sẵn bằng lịch campaign**; bật `Follow the campaign schedule instead`
  thì countdown khoá theo campaign và tự đổi khi merchant sửa lịch campaign.
- **Validate**: `countdown.start < countdown.end`, và cả 2 phải nằm **trong** visibility window của
  campaign. Ra ngoài → cảnh báo ngay tại field, vì phần ngoài window không ai thấy được.
- Trước `countdown.start`: bar vẫn hiện nếu đang bật, nhưng **chưa có timer**.
- ⚠️ **Không hỗ trợ countdown reset theo phiên.** Đếm ngược giả là quảng cáo gây hiểu lầm, bị xử lý ở EU/UK.
- Bar có nút đóng; đã đóng thì không hiện lại trong cùng phiên.

### 6.5 Seasonal skin

**Phạm vi tác động — chỉ 5 thành phần:**
1. Nút chính (Add to cart, Checkout)
2. Badge sale
3. Giá gạch (compare-at price)
4. Nền announcement bar
5. Thanh tiến trình free-shipping

Không đổi font, không đổi layout, không đổi toàn bộ theme.

**Rule màu**
- Preset palette là điểm khởi đầu; merchant mở ra chọn màu riêng cho từng vai trò (primary / accent / text-on-primary).
- **Kiểm tra tương phản ≥ 4.5:1** giữa chữ và nền trước khi áp. Không đạt → chặn và đề xuất màu chữ thay thế.
- Skin ghi đè ở **tầng hiển thị**, không sửa theme → tắt là về nguyên trạng ngay.
- Không áp vào checkout.

### 6.6 Cart & thank-you moments

Ba thời điểm bắn confetti, mỗi thời điểm là **một checkbox riêng** — merchant tick tổ hợp nào cũng được
mà không phải đọc một dropdown liệt kê sẵn vài tổ hợp:

| Thời điểm | Ghi chú |
|---|---|
| Add to cart | Burst ngắn từ vị trí nút |
| Free shipping reached | **Chỉ bắn 1 lần** khi giỏ vượt ngưỡng, không bắn lại khi thêm sản phẩm tiếp |
| Order confirmed | Trang cảm ơn |

- Confetti không được che nút Checkout.
- Trên trang cảm ơn, hiệu ứng chạy tối đa 3 giây rồi dừng hẳn.
- **Preview mô phỏng được 2 trong 3 moment**: `Add to cart` (bấm nút trong khung preview) và
  `Free shipping reached` (bấm nút vượt ngưỡng ở trang Cart). `Order confirmed` **không có trong
  preview** — trang cảm ơn thuộc checkout, dựng một trang cảm ơn giả chỉ để bắn confetti là dạy
  merchant một thứ họ không kiểm chứng được. Thay vào đó helpText của checkbox nói thẳng điều đó.

### 6.7 Background music

- **Mặc định TẮT.** Đây là quyết định có chủ đích: dữ liệu A/B cho thấy nhạc nền làm giảm conversion.
- Bắt buộc có tuỳ chọn "Wait for a click before playing", **bật sẵn**.
- **Volume là slider 0–100%** (bước 5), không phải 3 nút `Quiet / Medium / Loud` (mục 6.0.1). Dưới
  track ghi mức đang ở đâu — `Muted` / `Quiet` / `Medium` / `Loud` — kèm nhắc rằng shopper luôn tắt
  tiếng được từ storefront. `0%` đọc là `Muted`.
- Luôn có nút tắt tiếng hiển thị trên storefront.
- Trạng thái tắt tiếng được nhớ trong suốt phiên.

---

## 7. Schedule & trigger

### 7.1 Visibility time

| Trường | Rule |
|---|---|
| **Enabled** | on/off. **Off** = campaign chạy từ lúc bật đến lúc merchant tự tắt, không có ngày hết hạn. Off thì 2 field ngày **bị ẩn**, không phải chỉ disable |
| Start time / End time | Khi enabled: một khoảng **ngày + giờ** duy nhất cho toàn bộ element trong campaign |

- **Không có tuỳ chọn timezone riêng cho từng campaign.** Toàn bộ mốc thời gian trong app dùng
  **một chế độ timezone áp cho cả store**, chọn ở Settings (mục 9.3) — để countdown, effect và báo
  cáo doanh thu không bao giờ lệch nhau giữa các campaign.
- Visibility time là **cửa ngoài cùng**: mọi thứ khác (fixed time range, trigger, countdown) chỉ có
  hiệu lực bên trong nó.
- Tắt visibility time thì **countdown không thể chọn "Follow the campaign schedule"** (mục 6.4) —
  option đó bị disable vì không còn window nào để theo.
- Tắt visibility time cũng đổi tập trạng thái campaign, xem mục 4.1.

### 7.2 Display in fixed time range

Cho phép giới hạn campaign theo **giờ trong tuần**, không chỉ theo khoảng ngày.

| Trường | Rule |
|---|---|
| Enabled | on/off. Off = hiện ở mọi giờ trong visibility window. **Nút `Configure days & hours` chỉ xuất hiện sau khi bật** — không hiện một nút không dùng được |
| 7 dòng thứ (Mon → Sun) | Mỗi dòng: checkbox thứ · checkbox `All day` · `from` → `to` |

- Thứ **không tick** thì không bao giờ hiện, kể cả đang trong visibility window.
- Tick thứ mà không tick `All day` → **bắt buộc** nhập `from` và `to`, và `from < to`.
  Không hợp lệ thì chặn Apply và báo lỗi trong modal.
- `All day` → khoá 2 field giờ, hiểu là 00:00 → 23:59.
- Giờ tính theo **store timezone** như mọi mốc khác (mục 7.1).
- Modal có `Discard` (bỏ thay đổi) / `Apply`. Sau khi Apply, tóm tắt hiện ngay dưới nhãn,
  ví dụ `Mon 09:00–18:00 · Sat all day`.
- Bật enabled nhưng **chưa chọn thứ nào** → tóm tắt phải cảnh báo rõ (`No day picked yet — configure
  days & hours, or the campaign never shows`), vì trạng thái đó khiến campaign không bao giờ hiện.
- Không dùng khoảng qua nửa đêm (22:00 → 02:00) trong v1: tách thành 2 dòng thứ.

### 7.3 Trigger

Trigger quyết định **cái gì làm element bắt đầu chạy**, sau khi shopper đã ở trên page được phép hiện.

| Trigger | Rule |
|---|---|
| **Default — as soon as the page loads** (mặc định) | Chạy khi page interactive. Áp dụng cho falling effect, decorations, announcement bar |
| **After a specific time on the page** | Nhập số + đơn vị (`seconds` / `minutes`). Đợi hết thời gian mới vẽ frame đầu tiên |
| **When an item is added to the cart** | Bắt event add-to-cart ở mọi nơi: product page, quick add, cart drawer |
| **When a button or element is clicked** | Merchant nhập **class của element** cần theo dõi (không kèm dấu chấm, nhiều class thì tách bằng dấu phẩy) |

- Trigger `elementClick` gắn listener **delegated ở document**, không query từng element — theme
  render lại (ajax cart, section rendering) vẫn hoạt động.
- Class không tồn tại trên page → **không lỗi, không log ra console của khách**, chỉ đơn giản không chạy.
- Trigger không ghi đè quy tắc riêng của từng effect: cursor effect vẫn chỉ chạy trên desktop,
  cart & thank-you moments vẫn bắn theo đúng thời điểm của nó.
- Trigger **không** làm campaign hiện ngoài visibility window hoặc ngoài fixed time range.

---

## 8. Targeting

Tab **Targeting** gom 4 nhóm: display pages · market · shopper · device.

### 8.1 Display pages

| Lựa chọn | Rule |
|---|---|
| **All pages** (mặc định) | Mọi page trừ checkout. Tick All pages thì tự bỏ tick 3 loại page bên dưới |
| Home page | |
| Product pages | Kèm 2 option: **All products** (mặc định) hoặc **Specific products** |
| Collection pages | Kèm 2 option: **All collections** (mặc định) hoặc **Specific collections** |

- Chọn `Specific products` / `Specific collections` → mở **resource picker của Shopify** (product /
  collection picker) có search, chọn nhiều, hiển thị số lượng đã chọn. Chỉ những product/collection
  được chọn mới hiện effect.
- Chọn resource khi đang ở `All` → tự chuyển sang `Specific`.
- Luôn phải có ít nhất một lựa chọn: bỏ tick hết thì tự quay về `All pages`.
- Xoá hết resource đã chọn trong khi đang ở `Specific` → campaign không hiện ở loại page đó, và
  UI phải nói rõ điều này thay vì âm thầm hiện toàn bộ.

### 8.2 Exclude pages

- Nhập **URL hoặc path**, thêm được **nhiều dòng** (`+ Add page URL`), mỗi dòng xoá riêng.
- Chấp nhận cả full URL và path; so khớp theo path, bỏ qua query string và dấu `/` ở cuối.
- **Exclude luôn thắng** mọi lựa chọn ở 8.1.

### 8.3 Market · Shopper · Frequency

| Trường | Giá trị | Rule |
|---|---|---|
| Markets | All / từng market | Danh sách sync từ Shopify Markets. Khách được gán market theo Shopify → một shop có thể chạy Diwali cho khách Ấn và Noel cho khách Đức cùng ngày |
| Shoppers | Everyone / First-time / Returning | Xác định bằng cookie + trạng thái đăng nhập |
| Frequency | Once per shopper per day (mặc định) / Every page load / First visit only | "Every page load" là mặc định của đối thủ và là lý do khách quen thấy phiền |

### 8.4 Device

| Lựa chọn | Rule |
|---|---|
| **Show on all devices** (mặc định) | |
| Desktop only | |
| Mobile only | |

- Phân loại bằng pointer/touch capability + viewport, quyết định **một lần lúc khởi tạo**, không đổi khi resize.
- Device targeting **không ghi đè** các rule cứng: cursor effect vẫn desktop-only, speed guard vẫn
  giảm mật độ trên máy yếu (mục 15.4).
- Chọn `Mobile only` mà campaign chỉ bật cursor effect → cảnh báo lúc lưu, vì sẽ không có gì hiện.

---

## 9. Always-on modules

Cái gì **luôn có** thì không nằm trong campaign, và cũng không bị nhét vào Settings. v1 có 2 thứ như
vậy, mỗi thứ là **một mục riêng ở sidebar**: `Tab animation` và `Scroll to top`.

**Vì sao là module riêng chứ không phải một dòng trong Settings.** Cả hai đều có đủ cấu hình để cần
preview riêng — một cái cần khung tab trình duyệt, một cái cần trang cuộn thật. Nhét chúng vào Settings
thì Settings thành trang dài nhất trong app mà không có chỗ đặt preview, và merchant phải tưởng tượng
kết quả.

**Sidebar phẳng, không nhóm.** 5 mục: `Home · Campaigns · Tab animation · Scroll to top · Settings`.
Không có nhãn nhóm — 5 mục thì nhóm lại chỉ thêm chữ để đọc mà không giúp tìm nhanh hơn.

**Home có card `Always-on modules`** liệt kê 2 module kèm toggle bật/tắt và nút `Configure`, để merchant
thấy tình trạng cả hai mà không phải mở từng màn. Toggle ở Home và toggle ở màn module là **cùng một
cờ** — bật ở đâu cũng như nhau, không có hai đường trạng thái phải đồng bộ.

---

### 9.1 Tab animation — module riêng

Đổi **title và favicon của tab trình duyệt** khi shopper chuyển sang tab khác. Đây là thứ merchant bật
cả năm, không chỉ dịp lễ, nên nó không nằm trong campaign.

**Bốn nhóm cấu hình**

| Nhóm | Trường | Rule |
|---|---|---|
| **Favicon** | `Use emoji` / `Use site Favicon` | 2 nút lớn. Chọn `Use emoji` mới hiện hàng đổi emoji: ô preview emoji hiện tại + nút `Change emoji` mở emoji picker có search |
| **Animation** | `Blinking` / `Scrolling` / `Typing` | 3 nút lớn, dưới nhóm có 1 dòng giải thích đúng kiểu đang chọn |
| **Speed** | Slider 5 mức: Slowest / Slow / **Normal** / Fast / Fastest | `RangeSlider`, không phải segmented (mục 6.0.1). Mức đang chọn hiện thành chữ ở cuối track. Nhân vào **mọi** khoảng chờ của animation đang chọn — mức 3 là nhịp gốc, mỗi bước ra hai phía scale hệ số chờ |
| **Message** | 1–5 message, **mỗi cái tối đa 30 ký tự** | Mỗi dòng: số thứ tự `#n` · input có bộ đếm `18/30` · nút emoji · nút xoá. Nút `+ Add message` disable khi đã 5 dòng. Không xoá được dòng cuối cùng |

**Ba kiểu animation**

| Kiểu | Hành vi |
|---|---|
| **Blinking** | Message hiện, rồi title thật hiện, rồi message tiếp theo. Favicon đổi theo đúng nhịp đó — nhịp "nghỉ" trả về favicon gốc |
| **Scrolling** | Message chạy ngang qua tab như bảng điện tử, nối đuôi bằng `•`, hết một vòng thì sang message sau |
| **Typing** | Message tự gõ từng ký tự (có con trỏ `▌`), giữ ~1s, xoá dần, rồi sang message sau |

**Vì sao 30 ký tự.** Tab trình duyệt hẹp và cắt phần còn lại — cho nhập dài hơn chỉ tạo ra message mà
shopper không bao giờ đọc hết. Bộ đếm hiện ngay trong input để merchant thấy giới hạn trước khi chạm.

**Rule không cho tắt**

1. **Chỉ chạy khi tab ở background.** Bắt đầu ở `blur`, dừng ở `focus`. Shopper đang xem store thì
   không bao giờ thấy title đổi.
2. **Khôi phục nguyên văn title và favicon gốc.** Cả hai được chụp lại trước lần đổi đầu tiên, nên
   quay lại là không còn dấu vết.
3. **Respect reduce-motion.** Shopper bật giảm chuyển động: hiện message đầu tiên **một lần, tĩnh**,
   không cycle.

**Preview**: khung trình duyệt giả (thanh URL + tab + vùng nội dung), chạy đúng animation đang chọn.
Preview **chỉ chạy khi đang ở màn này** — rời màn là huỷ timer, không để một tab admin ẩn tiêu frame.

---

### 9.2 Scroll to top — module riêng

Nút đưa shopper về đầu trang. Ở v1.4 nó là 2 field trong Settings; giờ là module riêng vì nút này
**hiện trên mọi trang của store**, nên merchant muốn nó khớp theme đến từng màu.

**Nhóm cấu hình**

| Nhóm | Trường | Rule |
|---|---|---|
| **Behaviour** | `Scroll Animation Style` (Linear / Ease out / Ease in-out / Instant) · `Button Animation Style` (None / Fade in / Slide up / Bounce / Pulse) | 2 dropdown cạnh nhau — đây là 2 thứ không có hình để xem trước, nên dropdown là đúng |
| **Button Customization** | `Content` (Icon / Text / Icon + text) → `Choose Icon` (**30 icon**, grid 7 cột) hoặc `Text` (tối đa 10 ký tự) | Icon **vẽ bằng SVG**, không dùng ký tự unicode: mũi tên unicode render khác nhau trên mỗi hệ, và một số biến thành emoji màu |
| **Colours** | `Icon Color` + `Hover Icon Color` · `Transparent background` · `Background Color` + `Hover Background Color` | Mỗi màu là **input hex + ô màu tròn** mở colour picker hệ thống. Tick `Transparent background` thì 2 field nền bị disable, không phải ẩn |
| **Border** | `Button Border Width` (px) · `Button Border Style` (Solid / Dashed / Dotted / None) · `Border Color` + `Hover Border Color` | Width là **slider 0–10px**, không phải ô số: không ai biết 4px viền trông thế nào cho đến khi thấy nó (mục 6.0.1) |
| **Shape & size** | Shape (Round / Rounded / Square) · Size (Small / Medium / Large) · `Match the seasonal skin while a campaign is running` | |
| **Placement** | Position (Bottom right / Bottom left) · Side offset · Bottom offset · Show after (half / one / two screens) · Devices (All / Desktop / Mobile) | Hai offset là **slider 0–80px** (bước 2) — vị trí nút là thứ chỉnh bằng mắt trên preview, không phải bằng cách gõ số |

**Vì sao mỗi màu có một màu hover đi kèm.** Nút này nằm đè lên nội dung store cả ngày. Một cặp
màu/hover sai (chữ trắng trên nền trắng khi hover) chỉ lộ ra khi đưa chuột vào — nên preview phải
**đổi màu thật khi hover**, đó là cách duy nhất kiểm được cặp màu.

**`Match the seasonal skin` — mặc định BẬT.** Khi có campaign đang Live và seasonal skin đang bật, nút
lấy màu của skin thay vì màu cấu hình ở đây, để nó không đá nhau với campaign. Preview phải **nói rõ
đang bị skin ghi đè** thay vì để merchant tưởng màu mình chọn không có tác dụng (mục 11, mục 16).

**Preview**: một trang store giả **cuộn được thật**. Nút chỉ hiện sau khi cuộn qua ngưỡng đã chọn, bấm
vào thì cuộn về đầu bằng đúng easing đã chọn. Ngưỡng và easing là hai thứ không thể đánh giá bằng
cách đọc tên — phải cuộn thử.

**Rule**
- Xuất hiện sau khi shopper cuộn qua ngưỡng `Show after`, mặc định 1 màn hình.
- Không nằm trong campaign → không hết hạn theo lễ.
- Không render trên checkout.

---

### 9.3 Timezone — một chế độ cho cả store

**Vấn đề cụ thể**: merchant ở UTC+7 đặt campaign bắt đầu lúc 7:00 sáng, kỳ vọng "7 giờ sáng" là 7 giờ
sáng chỗ merchant. Nếu app tính theo giờ của từng shopper, một shopper ở UTC-5 sẽ thấy campaign bắt
đầu lúc 7:00 sáng **giờ của họ** — tức lệch 12 tiếng so với ý định của merchant. Ngược lại, nếu
merchant muốn campaign "cảm giác đúng nửa đêm" ở từng thị trường thì lại cần giờ theo shopper.
Vì hai nhu cầu này thật sự khác nhau, v1 cho merchant **chọn một trong hai**, áp dụng cho toàn store.

| Chế độ | Rule |
|---|---|
| **Local time zone** (mặc định) | Mỗi shopper tính theo **timezone trình duyệt của chính họ**. Campaign kết thúc "lúc nửa đêm" thì kết thúc ở một thời điểm tuyệt đối khác nhau tại mỗi thị trường |
| **Store admin timezone** | Toàn bộ mốc giờ dùng **một timezone cố định — của merchant**, lấy từ Shopify Admin (Settings → General). 7:00 sáng nghĩa là 7:00 sáng giờ merchant, ở mọi nơi, cùng một thời điểm tuyệt đối cho mọi shopper |

**Rule**

- Cấu hình nằm ở **Settings** (áp toàn store), không phải theo từng campaign — tránh tình trạng
  2 campaign trong cùng cửa hàng tính giờ theo 2 kiểu khác nhau, khiến báo cáo và hỗ trợ rối.
  Toàn bộ mốc giờ dùng cùng một mục: visibility time (7.1), fixed time range (7.2), countdown (6.4).
  Đổi chế độ ở đây, mọi campaign (kể cả đang Live) tính lại theo chế độ mới ngay.
- Chọn `Store admin timezone` → hiện khối **"Synced from Shopify Admin"**: tên timezone + offset
  (ví dụ `(GMT+07:00) Asia/Ho_Chi_Minh`), và nút **Re-sync** thủ công — cùng pattern với Markets (mục 12).
- **Re-sync khi merchant đổi timezone trong Shopify Admin.** App không tự động nghe thay đổi đó —
  đọc lại khi merchant bấm Re-sync, giống rule "market bị xoá thì không tự sửa cấu hình" (mục 16).
- Tab **Schedule & trigger** của mỗi campaign hiển thị một dòng ghi rõ chế độ đang áp dụng
  (ví dụ *"All times use your store timezone, Asia/Ho_Chi_Minh (from Shopify Admin)"*), để merchant
  không phải nhớ đã chọn gì ở Settings.

---

## 10. Speed guard & Accessibility

### 10.1 Speed guard

| Chế độ | Hành vi |
|---|---|
| **Balanced** (mặc định) | Desktop full · mobile tầm trung giảm ~55% · máy yếu/mạng chậm chỉ còn ~13% và tắt hiệu ứng ambient |
| Full quality | Không giảm — không khuyến nghị trong tuần BFCM |
| Desktop only | Tắt toàn bộ trên mobile |

Phân loại thiết bị dựa trên số nhân CPU, bộ nhớ, và loại kết nối mạng.

### 10.2 Accessibility (bắt buộc, không cho tắt)

1. **Respect reduce-motion** — shopper bật chế độ giảm chuyển động thấy bản tĩnh: trang trí giữ nguyên, chuyển động dừng.
2. **Không chặn click** — mọi lớp effect là `pointer-events: none`.
3. **Ẩn khỏi screen reader** — lớp trang trí `aria-hidden`.
4. **Contrast check** trên seasonal skin (mục 6.5).
5. **Không tự phát âm thanh** khi chưa có tương tác.

### 10.3 Kill switch

Một nút trong Settings tắt toàn bộ effect trên store ngay lập tức, không cần đợi campaign kết thúc, không đụng theme. Yêu cầu: thao tác được từ điện thoại, dưới 3 giây.

---

## 11. Brand colours

- App đọc 3 màu từ theme đang dùng: **Primary**, **Sale**, **Surface**.
- Merchant **ghi đè được** bằng cách click vào swatch; có nút "Reset to theme".
- Đổi màu ở đây **không sửa theme** — chỉ khai báo cho app biết màu thương hiệu.
- Có kiểm tra tương phản, cảnh báo nếu chữ trên màu đó < 4.5:1.
- Cần **re-scan khi merchant đổi theme** — bằng thao tác thủ công, không tự đổi màu sau lưng họ.

### Thứ tự ưu tiên màu

```
Theme colours  →  Brand settings (ghi đè)  →  Seasonal skin (ghi đè tạm thời khi campaign đang chạy)
```

Campaign kết thúc → tự quay về brand.

**Ba chỗ chịu ảnh hưởng của brand colour:**
1. Màu hạt rơi (khi campaign để `Colour = Brand palette`)
2. Nền announcement bar
3. Nút scroll-to-top (khi module đó để `Match the seasonal skin` và **không** có campaign nào đang Live)

> ⚠️ Nếu merchant đổi màu brand mà không thấy gì thay đổi trên storefront, nguyên nhân gần như luôn là có campaign đang chạy với skin bật. Cần dòng nhắc trong UI khi cả hai cùng active.

---

## 12. Markets sync

- Danh sách market **read-only**, sync từ Shopify Markets.
- Hiển thị market nào là primary.
- Có nút **Re-sync** thủ công, và hiển thị thời điểm sync gần nhất.
- Muốn thêm/bớt market → link sang `Shopify → Settings → Markets`.
- Sau khi sync, hệ thống chuẩn bị sẵn 12 campaign dịp lễ trong năm dưới dạng **Draft** cho các market đó.

---

## 13. Không đo lường hiệu suất trong v1 — quyết định có chủ đích

v1 **không có** feature đo hiệu suất và **không có** màn Results. Cụ thể là không làm:

- A/B split 50/50 và mọi số liệu conversion / time on site.
- Chạy Lighthouse mỗi đêm và công bố speed score trong app.
- Báo cáo hiệu quả theo từng effect.

**Lý do**

1. Số liệu chỉ có nghĩa khi mỗi nhóm đạt hàng nghìn phiên. Phần lớn store lắp app loại này không đạt
   ngưỡng đó trong một dịp lễ → app sẽ hiển thị số nhiễu, và số nhiễu tệ hơn không có số.
2. Đo đạc kéo theo tracking, cookie chia nhóm, endpoint ghi nhận sự kiện — đúng những thứ mục 15
   cấm vì lý do tốc độ.
3. Giá trị merchant mua ở v1 là **tự chạy đúng lịch và không làm chậm store**, không phải dashboard.

**Hệ quả lên UI**: Home không có hàng KPI; sidebar không có mục Results; Settings không hiện speed score.
Sidebar chỉ có 5 mục (mục 9), không có mục nào là dashboard.

**Vẫn giữ lại**: `Speed guard` (mục 10.1, 15.4) — đây là **cơ chế điều tiết**, không phải đo lường,
và không gửi số liệu đi đâu.

---

## 14. Support / Feedback

Hai nơi, hai mục đích khác nhau:

**Trong campaign editor** — banner ngay dưới live preview (cả 3 tab đều thấy, vì preview không đổi khi
chuyển tab), đúng lúc merchant nhận ra thiếu thứ mình cần:

- **Request an effect** — thu thập yêu cầu về dịp lễ / artwork / setting còn thiếu
- **Ask for help**
- Cam kết phản hồi: trong vòng 1 ngày (dưới 1 giờ trong tuần BFCM)

Yêu cầu được xếp hạng theo số lượt để quyết định thứ tự build.

**Trên Home** — 2 card ở cuối trang, cho merchant chưa gặp vấn đề cụ thể nhưng muốn biết có ai đó ở đây không:

| Card | Nội dung |
|---|---|
| Hộp trợ giúp | *"Something not working as expected?"* + mô tả 1 câu + nút **Chat with us**. Có nút ✕ để ẩn, ẩn xong không tự hiện lại trong phiên đó |
| **Resources** | 3 ô: **Live chat** (hỗ trợ ngay) · **Feature request** (trỏ vào cùng luồng "Request an effect" ở trên) · **Help doc** (hướng dẫn setup từng bước) |

Card trợ giúp không thay thế banner trong editor — banner đó gắn với ngữ cảnh (đang sửa mà thiếu gì),
card ở Home là lối vào chung, không phụ thuộc merchant đang làm gì.

---

## 15. Performance — SELLING POINT, KHÔNG PHẢI NON-FUNCTIONAL

> **Tuyên bố sản phẩm:** *"Trang trí cả store mà không làm chậm nó."*
>
> Đây là **lý do mua hàng chính**, không phải một yêu cầu kỹ thuật phụ. Nỗi sợ số một khiến merchant không cài app hiệu ứng là "nó sẽ làm chậm store của tôi".
>
> Cách chứng minh ở v1 là **ngân sách hiệu năng được ép trong CI** (mục 15.1) và cách vẽ ở 15.2–15.5,
> **không phải** một feature đo đạc bên trong app — v1 không đo và không công bố số trong app (mục 13).
>
> Hệ quả: mọi quyết định thiết kế xung đột giữa "đẹp hơn" và "nhanh hơn" đều **chọn nhanh hơn**.

### 15.1 Ngân sách hiệu năng (bắt buộc, không thương lượng)

| Chỉ số | Ngưỡng | Ý nghĩa |
|---|---|---|
| Kích thước JS | **≤ 15 KB** (gzip) | Toàn bộ, gồm cả runtime lẫn config |
| Kích thước CSS | ≤ 3 KB, inline | Không thêm request |
| Số request thêm | **0** trong critical path | Config nhúng sẵn, không fetch lúc load |
| Chênh lệch Lighthouse Performance (mobile) | **≤ 2 điểm** so với không có app | Kiểm tra trong CI trên store mẫu, không đo trên store merchant |
| CLS thêm vào | **≤ 0.02** | |
| LCP thêm vào | **≤ 50 ms** | |
| Thời gian CPU mỗi frame cho toàn bộ effect | **≤ 4 ms** | Giữ 60fps còn dư ~12ms cho theme |
| Bộ nhớ | ≤ 5 MB | Object pool, không cấp phát trong vòng lặp |
| Request tới bên thứ ba | **0** | Không CDN ngoài, không analytics bên thứ ba, không font ngoài |

Ngân sách này phải được **kiểm tra tự động trong CI**. Build vượt ngưỡng thì fail, không merge.

### 15.2 Rule về cách tải

1. Script tải **sau khi trang đã interactive**, không bao giờ nằm trong critical rendering path.
2. Không dùng `document.write`, không script đồng bộ, không chặn parser.
3. Config (campaign đang chạy, effect nào bật) được **nhúng sẵn vào HTML** qua app embed — **không fetch** lúc load. Zero network request trước khi vẽ.
4. Assets (ảnh hạt, artwork) phục vụ từ **Shopify CDN**, kích thước đúng theo DPR, định dạng hiện đại.
5. Nếu không có campaign nào đang chạy cho khách này → **script thoát ngay lập tức**, không khởi tạo canvas, không đăng ký listener.

### 15.3 Rule về cách vẽ

1. **Một canvas duy nhất** cho toàn bộ hiệu ứng rơi + confetti + cursor trail. Không tạo DOM element cho từng hạt.
2. Canvas là overlay `position: fixed`, `pointer-events: none` → **không gây reflow, không chặn click**.
3. Vòng lặp dùng `requestAnimationFrame`, một vòng duy nhất cho mọi effect.
4. **Object pool**: hạt rơi ra khỏi màn hình được tái sử dụng, không tạo mới → không gây GC pause.
5. **Tự dừng khi không cần vẽ**:
   - Tab bị ẩn (`visibilitychange`) → dừng hoàn toàn
   - Cửa sổ mất focus → giảm về nửa tốc độ
   - Không có hiệu ứng nào bật → huỷ vòng lặp, không chạy rAF rỗng
6. Announcement bar phải **dành sẵn chỗ (reserve space)** trước khi hiện, nếu không sẽ đẩy nội dung và tạo CLS.

### 15.4 Speed guard — tự thích ứng theo thiết bị

Phân loại thiết bị lúc khởi tạo, dựa trên: số nhân CPU, bộ nhớ thiết bị, loại kết nối mạng, và cài đặt giảm chuyển động.

| Lớp thiết bị | Mật độ hạt | Hiệu ứng ambient |
|---|---|---|
| Máy khoẻ (desktop, mobile cao cấp) | 100% | Đủ |
| Mobile tầm trung | ~45% | Đủ |
| Mobile yếu / mạng chậm (2G, 3G, save-data) | ~13% | **Tắt cursor trail và decorations** |

**FPS watchdog** (chạy liên tục, không chỉ lúc khởi tạo):
- FPS < 30 kéo dài 2 giây → tự giảm mật độ một bậc
- FPS < 20 → tắt toàn bộ hiệu ứng ambient, giữ lại announcement bar và skin (những thứ không tốn frame)
- Không bao giờ tự tăng lại trong cùng một phiên — tránh dao động lên xuống gây giật

Merchant chọn được 3 chế độ: `Balanced` (mặc định) · `Full quality` · `Desktop only`.

### 15.5 Fail-safe

1. Script lỗi ở bất cứ đâu → **catch, dừng im lặng**, storefront hiển thị y như không có app. Effect không bao giờ được phép làm vỡ trang bán hàng.
2. Toàn bộ code khởi tạo bọc trong try/catch; lỗi được báo về monitoring, **không** hiện cho khách.
3. **Kill switch** trong Settings tắt sạch mọi effect trong ≤ 3 giây, thao tác được từ điện thoại, không cần đụng theme.
4. Gỡ app → app embed biến mất → **không còn một dòng code nào** trong theme.

### 15.6 Kiểm chứng ngân sách — trong CI, không phải trong app

1. Ngân sách 15.1 được kiểm **tự động trong CI** trên store mẫu, mỗi lần build: kích thước bundle,
   số request, CLS/LCP thêm vào, thời gian CPU mỗi frame. Vượt ngưỡng → fail build.
2. **Không** chạy Lighthouse trên storefront của merchant, **không** hiển thị speed score trong app.
   Đây là hệ quả trực tiếp của mục 13.
3. FPS watchdog ở 15.4 chạy **cục bộ trên máy khách** để tự giảm mật độ. Nó **không gửi số liệu về server**.
4. Con số hiệu năng dùng cho listing App Store là kết quả đo trong CI, có ghi rõ điều kiện đo —
   không phải số lấy từ store của merchant.

### 15.7 Những gì bị cấm vì lý do tốc độ

- Không thư viện animation bên ngoài (không GSAP, không confetti.js, không jQuery)
- Không web font riêng
- Không GIF/video làm hiệu ứng nền
- Không hiệu ứng chạy trên trang checkout
- Không polling, không WebSocket
- Không đo đạc analytics đồng bộ chặn render

---

## 15b. Non-functional khác

| Hạng mục | Yêu cầu |
|---|---|
| Cài đặt | Qua theme app embed. Gỡ app là sạch, không để lại code trong theme |
| Trình duyệt | 2 phiên bản gần nhất của Chrome, Safari, Firefox, Edge; Safari iOS 15+ |
| Đa ngôn ngữ admin | Chuẩn bị i18n từ đầu, v1 ra tiếng Anh |

---

## 16. Edge cases cần xử lý

1. **2 campaign chồng ngày** → cảnh báo lúc lưu, campaign bắt đầu muộn hơn thắng (mục 4.4).
2. **Ngày kết thúc trong quá khứ khi lưu** → chặn lưu, báo lỗi rõ.
3. **Merchant đổi theme** → app embed gần như chắc chắn mất. Phát hiện ngay và cảnh báo ở Home + chặn publish (mục 4.2.2).
3b. **Merchant tắt app embed trong khi có campaign đang Live** → Home chuyển sang cảnh báo, campaign vẫn giữ trạng thái Live (vì cấu hình không sai), nhưng nhãn phải nói rõ nó không hiển thị được.
4. **Campaign đang Live mà merchant sửa** → thay đổi áp dụng ngay, cần nhãn *"changes publish instantly"* ở header editor.
5. **Ngưỡng free shipping thay đổi giữa chừng** → confetti đọc ngưỡng tại thời điểm sự kiện, không cache.
6. **Shopify Markets bị xoá một market đang được campaign nhắm tới** → campaign chuyển sang cảnh báo, không tự xoá cấu hình.
7. **Bật draft nhầm** → confirm dialog lần đầu (mục 4.2).
8. **Bulk activate lẫn campaign Ended** → bỏ qua campaign Ended, báo rõ đã bỏ qua bao nhiêu cái và vì sao.
9. **Bulk delete có campaign đang Live** → confirm phải nói rõ campaign nào đang Live và sẽ tắt ngay.
10. **Duplicate campaign đang Live** → bản sao luôn là Draft, không bao giờ tự lên storefront (mục 4.0).
11. **Countdown window nằm ngoài visibility window** → cảnh báo tại field, không tự sửa số của merchant (mục 6.4).
12. **Fixed time range có thứ được tick nhưng thiếu giờ** → chặn Apply, báo lỗi trong modal (mục 7.2).
13. **Class ở trigger `elementClick` không tồn tại trên page** → không chạy, không log ra console của khách (mục 7.3).
14. **Product/collection đã chọn bị xoá hoặc unpublish trong Shopify** → bỏ qua id không còn tồn tại,
    cảnh báo ở campaign, không tự chuyển về `All products` (mục 8.1).
15. **Device targeting mâu thuẫn với effect** → ví dụ `Mobile only` mà chỉ bật cursor effect: cảnh báo lúc lưu (mục 8.4).
16. **Campaign đang Live có seasonal skin + scroll-to-top để `Match the seasonal skin`** → nút lấy màu skin;
    màn Scroll to top phải **nói rõ đang bị ghi đè** thay vì để merchant tưởng màu mình chọn bị lỗi (mục 9.2).
17. **Visibility time tắt** → campaign không có Scheduled/Ended; nhắc merchant là nó chạy tới khi tự tắt (mục 4.1, 7.1).
18. **Fixed time range bật nhưng chưa chọn thứ nào** → campaign không hiện; cảnh báo ngay ở tóm tắt (mục 7.2).
19. **Đổi tên campaign rồi Cancel** → tên trả về nguyên trạng, không lưu (mục 4.3).
20. **Tab animation bật nhưng mọi message đều rỗng** → không đổi title, và tóm tắt ở Home phải ghi
    `No message written yet` thay vì báo đang chạy (mục 9.1).
21. **Xoá message cuối cùng của tab animation** → chặn: luôn còn ít nhất 1 dòng để module có gì mà chạy (mục 9.1).
22. **Scroll-to-top đặt `Transparent background` nhưng icon cùng màu nền trang** → nút vô hình. Preview là
    nơi phát hiện, vì nó vẽ nút trên nội dung thật (mục 9.2).
23. **Đổi preset sau khi đã tự sửa artwork / density** → preset **ghi đè** những thứ đó (mục 5.2). Chỉ tên,
    ngày và message tự gõ mới được giữ. Card Template nói rõ điều này ngay dưới tiêu đề.

---

## 17. Câu hỏi mở

1. Background music nên nằm trong Campaign (theo mùa) hay Settings (always-on)? Hiện đặt trong Campaign.
2. Có cần trạng thái "Archived" tách khỏi "Ended" không, khi merchant tích luỹ nhiều campaign qua các năm?
3. Product image decoration và Games đã cắt khỏi v1 — đưa vào v1.1 hay v2?
4. `Display in fixed time range` có cần hỗ trợ khoảng qua nửa đêm (22:00 → 02:00) không, hay để merchant tách 2 dòng như hiện tại?
5. Trigger `elementClick` có nên cho nhập CSS selector đầy đủ (`#id`, `[data-x]`) thay vì chỉ class không?
6. Với `Specific products`, có cần đồng bộ khi product bị xoá/unpublish trong Shopify, hay chỉ bỏ qua id không còn tồn tại?
7. Tab animation và scroll-to-top có cần lịch chạy riêng không (ví dụ chỉ bật tab animation trong tuần BFCM),
   hay always-on là đủ?
8. `Store admin timezone` có cần cảnh báo riêng cho merchant bán ở nhiều market lệch múi giờ xa
   (ví dụ US + VN), vì một mốc giờ cố định sẽ luôn "lệch cảm giác" ở một trong hai nơi?
9. Đổi chế độ Timezone khi đang có campaign Live — có cần confirm dialog giống publish lần đầu
   không, vì nó dịch chuyển thời điểm hiển thị thực tế của mọi campaign đang chạy?
10. Cursor effect đã bỏ bản always-on (mục 6.3). Có merchant nào thật sự muốn con trỏ có thương hiệu
    chạy cả năm, đủ để dựng lại module đó, hay cách "campaign không có visibility time" là đủ?
11. Tab animation có nên cho **preview trực tiếp trên tab admin thật** (đổi `document.title` khi merchant
    rời tab admin) không? Rất thuyết phục, nhưng dễ bị hiểu là app đang làm gì đó với store.
12. 5 message cho tab animation có đủ không, và thứ tự cycle có cần cho kéo thả sắp lại?

---

## 18. Phụ lục — đối chiếu với Dakaas

| Dakaas | Ở đây | Ghi chú |
|---|---|---|
| Store effect | Falling effect | Trong campaign |
| Store Decoration | Decorations | Trong campaign |
| Cursor effect | Cursor effect trong campaign | Theo mùa. Không có bản always-on, mục 6.3 |
| Add to cart effect | Trong Cart & thank-you | Gom chung 3 thời điểm |
| Tab animation | Tab animation module (always-on) | Module riêng ở sidebar: favicon emoji, 3 kiểu animation, 5 message × 30 ký tự, mục 9.1 |
| Background music | Background music | Mặc định tắt |
| Scroll to Top | Scroll to top module (always-on) | Module riêng ở sidebar: 30 icon, mọi màu có cặp hover, preview cuộn thật, mục 9.2 |
| — | Announcement bar + countdown | Mới |
| — | Seasonal skin | Mới |
| — | Campaign / lịch / targeting | Mới — khác biệt cốt lõi |
| — | Speed guard (điều tiết, không đo lường) | Mới |
| — | Bulk action + search + sort ở danh sách campaign | Mới |
| — | Trigger (delay · add to cart · element click) | Mới |
| Dropdown liệt kê tên effect | Gallery ảnh có phân trang cho mọi lựa chọn nhìn thấy được | Mới — mục 6.0.1 |
| — | Display in fixed time range theo thứ/giờ | Mới |
| — | Targeting theo product/collection cụ thể + exclude URL + device | Mới |
