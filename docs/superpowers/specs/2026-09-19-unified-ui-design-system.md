# Unified UI Design System — Cuội Leo Cung Trăng

## 1. Mục tiêu

Chuẩn hóa toàn bộ trải nghiệm của trang chủ, trình tạo game và màn chơi thành một sản phẩm thống nhất. Giao diện phải giữ được không khí Trung Thu Việt Nam nhưng gọn, dễ đọc, dễ thao tác trên điện thoại và có thể mở rộng mà không phát sinh thêm các biến thể tùy ý.

Thay đổi này không sửa gameplay, cấu trúc dữ liệu, cách mã hóa URL hay nội dung do người dùng tạo.

## 2. Vấn đề hiện tại

- Màu nền, màu bề mặt, border, radius và shadow được khai báo trực tiếp trong từng JSX, tạo nhiều biến thể gần giống nhưng không đồng nhất.
- Trang chủ dùng nền kính tối, form tạo game dùng các card sáng, còn HUD và modal game lại có ngôn ngữ thị giác riêng.
- Quá nhiều gradient, viền, pill, emoji và hiệu ứng cùng cạnh tranh sự chú ý.
- Button, field, alert và modal chưa có trạng thái dùng chung; focus, hover, active và disabled thiếu nhất quán.
- Form tạo game dài, dày đặc card lồng nhau và chưa tạo được nhịp đọc rõ giữa các bước.
- Chuyển động chưa có quy tắc chung và chưa xử lý đầy đủ `prefers-reduced-motion`.

## 3. Định hướng sáng tạo

### Visual thesis

Một đêm Trung Thu Việt Nam hiện đại: nền chàm sâu như bầu trời, ánh trăng vàng ấm làm điểm nhấn và các bề mặt màu ngà gợi giấy lồng đèn. Cảm giác tổng thể thân thiện, lễ hội và có chiều sâu nhưng không trẻ con hóa hay trang trí quá mức.

### Content plan

- Trang chủ: thương hiệu và lời hứa chính → cách chơi ngắn gọn → hành động tạo/chơi → cam kết không đăng nhập.
- Trang tạo game: định hướng nhanh → thông tin chặng leo → các mốc quà/câu hỏi → lời chúc cuối → tạo và chia sẻ link.
- Màn chơi: game canvas là vùng chính → HUD cung cấp trạng thái cần thiết → modal xử lý câu hỏi/quà → chiến thắng và hành động tiếp theo.

### Interaction thesis

- Một chuỗi xuất hiện nhẹ cho nội dung chính, không animate từng phần tử nhỏ độc lập.
- Trăng trôi rất nhẹ và đèn lồng đung đưa chậm để tạo không khí; không dùng pulse/bounce liên tục cho nội dung cần đọc.
- Hover, press, focus và modal transition rõ ràng để tăng cảm giác phản hồi; mọi chuyển động trang trí tắt khi người dùng bật giảm chuyển động.

## 4. Design tokens

Các token semantic đặt trong `src/app/globals.css` và là nguồn màu, kích thước, radius, shadow, duration duy nhất cho React UI.

### Màu sắc

| Vai trò | Token | Giá trị định hướng | Cách dùng |
| --- | --- | --- | --- |
| Nền sâu | `--color-night-950` | `#080615` | Nền toàn trang và game frame |
| Nền chàm | `--color-night-900` | `#13102B` | Layer nền, navigation, HUD |
| Bề mặt tối | `--color-night-800` | `#211A40` | Panel tối và control overlay |
| Bề mặt sáng | `--color-moon-50` | `#FFF9EA` | Form, dialog, vùng nội dung sáng |
| Bề mặt sáng phụ | `--color-moon-100` | `#F8EDCF` | Vùng phân nhóm và hover nhẹ |
| Primary | `--color-gold-500` | `#E9A62F` | CTA và trạng thái lựa chọn |
| Primary hover | `--color-gold-600` | `#CC8420` | Hover/pressed của CTA |
| Text trên nền tối | `--color-ink-inverse` | `#FFF8E7` | Heading và nội dung chính tối |
| Text chính | `--color-ink-900` | `#2D1D12` | Nội dung trên bề mặt sáng |
| Text phụ | `--color-ink-600` | `#755C48` | Mô tả và helper text |
| Success | `--color-success-600` | `#16836F` | Thành công và KAMA khỏe |
| Danger | `--color-danger-600` | `#C94750` | Lỗi, trả lời sai, cảnh báo |

Gold là accent duy nhất cho hành động chính. Rose và emerald chỉ thể hiện meaning, không dùng như màu trang trí cạnh tranh.

### Typography

- Dùng Geist hiện có để tránh thêm dependency và giữ khả năng hiển thị tiếng Việt ổn định.
- Heading dùng trọng lượng 700–800; body dùng 400–600; không dùng `font-black` đại trà.
- Scale giới hạn: 12, 14, 16, 20, 24, 32, 48 px.
- Body mặc định 16 px, line-height tối thiểu 1.5. Label/form text không nhỏ hơn 13 px trên mobile.
- Uppercase và letter-spacing chỉ dành cho eyebrow ngắn, không dùng cho câu dài.

### Spacing và kích thước

- Spacing theo lưới 4 px, các mốc chính: 4, 8, 12, 16, 24, 32, 48, 64.
- Content width: 1120 px cho landing, 720 px cho creator, 420 px cho game frame.
- Touch target tối thiểu 44×44 px.
- Khoảng cách section lớn hơn rõ rệt khoảng cách bên trong component.

### Radius, border và shadow

- `--radius-sm: 10px`, `--radius-md: 16px`, `--radius-lg: 24px`, pill chỉ dùng cho badge/status.
- Border tiêu chuẩn 1 px; 2 px chỉ cho focus/selection có chủ đích. Không dùng border 4 px cho container hay modal.
- Chỉ có ba cấp shadow: control, elevated panel và modal. Glow dành riêng cho mặt trăng/chi tiết lễ hội, không gắn vào mọi CTA.

## 5. Component primitives

Các primitive là component React nhỏ, hỗ trợ `className` khi cần bố cục nhưng giữ style và trạng thái cốt lõi.

### Button

Variants: `primary`, `secondary`, `ghost`, `danger`; sizes: `sm`, `md`, `lg`. Tất cả dùng cùng radius, icon gap, focus ring, pressed transform và disabled state. Link có hình thức button dùng chung cùng class contract.

### IconButton

Dùng cho back, sound và replay. Luôn có accessible label/title, touch target 44 px và cùng trạng thái với Button.

### Field

Bao gồm label, input/textarea/select, helper và error. Màu chữ không bị ép toàn cục bằng `!important`; mỗi field kiểm soát foreground/background theo context. Focus ring dùng gold, error dùng danger.

### Panel

Variants: `light`, `dark`, `subtle`. Panel chỉ dùng khi cần gom nhóm nội dung hoặc tạo lớp nổi; không biến mọi vùng thành card. Không lồng nhiều panel có cùng độ nổi.

### Badge và Status

Badge dành cho eyebrow/metadata ngắn. Status dành cho KAMA, số bậc, pass chance và trạng thái game. Cả hai dùng type scale và padding cố định.

### SectionHeader

Cấu trúc thống nhất gồm số bước tùy chọn, title, description và action. Dùng trong ba phần chính của creator.

### ModalShell

Chịu trách nhiệm cho overlay, focus-visible, max width, padding, entrance/exit visual và surface. GiftModal và VictoryModal chỉ cung cấp nội dung, icon và action.

## 6. Thiết kế theo màn hình

### Trang chủ

- Nền full-bleed chàm sâu với một mặt trăng lớn làm visual anchor; giảm ba khối blur gradient và các animation cạnh tranh.
- Brand là dòng chữ nổi bật nhất, mô tả giới hạn một câu ngắn và CTA chính hiển thị ngay trong viewport đầu.
- Ba bước hoạt động trở thành một flow ngang hoặc danh sách có divider, không dùng ba card riêng biệt.
- CTA chính dùng gold; CTA phụ là ghost/outline cùng hệ thống.
- Hai đèn lồng là chi tiết trang trí có kiểm soát, ẩn bớt trên màn hình rất nhỏ nếu gây chật.
- Cam kết không đăng nhập và lưu trong URL nằm dưới CTA như metadata, không cạnh tranh với hành động chính.

### Trang tạo game

- Dùng nền đêm chung và một bề mặt sáng chính, thay vì nhiều card trắng/amber lồng nhau.
- Header ngắn, có back navigation rõ ràng và mô tả mục tiêu.
- Preset là lựa chọn nhanh ở đầu flow, hiển thị theo danh sách/chip lớn dễ bấm với selected feedback rõ.
- Form chia thành ba section: `1. Chặng leo`, `2. Mốc bất ngờ`, `3. Lời chúc & chia sẻ`.
- Checkpoint là item có header và divider; trạng thái message/quiz dùng segmented control thống nhất.
- Error xuất hiện gần vùng liên quan khi có thể, đồng thời có summary ở đầu form cho lỗi submit.
- CTA tạo link nằm cuối flow, full width trên mobile. Kết quả link dùng một result panel với Copy và Share rõ thứ bậc.
- Không thay đổi logic validation, giới hạn URL, preset hay generation.

### Màn chơi và HUD

- Canvas vẫn là nội dung ưu tiên, frame giảm border dày và đồng bộ shadow/radius với hệ thống.
- Header overlay dùng một thanh HUD nhẹ: back bên trái, progress ở giữa, sound/replay bên phải.
- KAMA dùng cùng status styling; danger chỉ xuất hiện khi thấp, tránh nhiều gradient theo mức.
- Hướng dẫn tap xuất hiện một lần với chuyển động nhẹ rồi nhường không gian cho game.
- Trên mobile game tận dụng `100svh` có trừ khoảng an toàn; không tạo chiều cao 92vh gây khoảng trống thất thường.

### Modal quà và chiến thắng

- Cùng ModalShell, surface moon-50, border mảnh, radius-lg và spacing chung.
- Gift/quiz ưu tiên câu hỏi và đáp án; decorative glow nằm sau icon, không phủ toàn modal.
- Option có default, hover/focus, selected, correct và incorrect rõ bằng cả màu lẫn icon.
- Victory dùng cùng button hierarchy: chơi lại primary, chia sẻ secondary, tạo game mới ghost.
- Giảm bounce/pulse liên tục; confetti vẫn giữ vì có ý nghĩa phần thưởng.

## 7. Responsive và accessibility

- Mobile-first tại 320–430 px, sau đó mở rộng ở 640 px và 1024 px.
- Không có horizontal scroll ở 320 px; form control và action xếp dọc khi thiếu chỗ.
- Dùng `100svh` cho màn chơi và safe-area inset cho thiết bị có notch.
- Focus-visible luôn rõ; contrast mục tiêu WCAG AA cho text và control.
- Icon-only control có accessible name; heading theo thứ tự logic; error được liên kết với field khi phù hợp.
- Không khóa selection cho toàn trang; chỉ game canvas/HUD có `user-select: none` và touch behavior đặc thù.
- `prefers-reduced-motion` tắt animation trang trí, smooth scroll và transform không cần thiết.

## 8. Kiến trúc triển khai

- `src/app/globals.css`: semantic tokens, base styles, motion và utility component classes có phạm vi rõ.
- `src/components/ui/`: các primitive Button, IconButton, Field, Panel, Badge/Status, SectionHeader và ModalShell.
- Các page/component hiện tại được chuyển dần sang primitive, xóa các chuỗi utility màu/radius/shadow trùng lặp.
- Giữ server/client boundary hiện có: page tĩnh tiếp tục là Server Component; form, game và modal tương tác tiếp tục là Client Component.
- Không thêm state management, animation library hay UI framework mới.

## 9. Kiểm thử và tiêu chí hoàn thành

### Kiểm thử tự động

- Chạy test hiện có cho encode/decode URL.
- Chạy ESLint và production build.
- Nếu tách logic mới có hành vi, bổ sung test trước khi triển khai; thay đổi thuần presentation được xác minh bằng render/build và kiểm tra trực quan.

### Kiểm tra trực quan

- Kiểm tra `/`, `/create`, `/play` ở 375×812 và desktop 1440×900.
- Kiểm tra hover, focus-visible, active, disabled, error, quiz correct/incorrect, low KAMA và victory.
- Kiểm tra overflow với tên/lời chúc dài trong giới hạn dữ liệu.
- Kiểm tra reduced motion và màn hình có chiều cao thấp.

### Definition of done

- Ba route có cùng màu, typography, spacing, radius, shadow và interaction language.
- Không còn màu/border/radius tùy ý cho các control phổ biến trong JSX.
- CTA chính/phụ và field có trạng thái nhất quán, touch target đạt tối thiểu 44 px.
- Form creator dễ quét theo ba bước; HUD không che nội dung game quan trọng.
- Không có thay đổi ngoài ý muốn đối với gameplay, URL hoặc dữ liệu.

## 10. Ngoài phạm vi

- Vẽ lại art trong Phaser hoặc thay mascot.
- Thay đổi gameplay, độ khó, câu hỏi mẫu hay preset content.
- Thêm backend, tài khoản, lưu trữ hoặc analytics.
- Dark/light theme tùy chọn cho người dùng.
- Thêm thư viện component hoặc animation mới.
