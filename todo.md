# 🌕 Kế hoạch thực hiện: Trung Thu Moon Climb (Web Game)

Tài liệu tham chiếu: [trung-thu-moon-climb-game-spec.md](./trung-thu-moon-climb-game-spec.md)  
Mục tiêu: Web mini-game Trung Thu không backend, chia sẻ toàn bộ cấu hình trò chơi qua URL.

---

## 📋 Danh sách các bước chính (Task Breakdown)

### Giai đoạn 1: Khởi tạo dự án & Thiết lập kiến trúc (Project Setup)
- [x] Khởi tạo dự án Next.js (App Router) với TypeScript và Tailwind CSS
- [x] Cài đặt các thư viện cần thiết:
  - `phaser` (Game Engine)
  - `lz-string` (Nén & giải nén cấu hình URL)
  - `lucide-react` / `canvas-confetti` (Icon & hiệu ứng mừng chiến thắng)
- [x] Thiết lập cấu trúc thư mục theo spec:
  - `src/types/game.ts`
  - `src/lib/gameUrl.ts`
  - `src/game/` (Phaser scenes, Cuoi mascot, config)
  - `src/components/` (KamaBar, GiftModal, VictoryModal, GameCreator)
  - `src/app/` (`/`, `/create`, `/play`)

---

### Giai đoạn 2: Định nghĩa dữ liệu & URL Engine (Encode / Decode URL)
- [x] Tạo định nghĩa types (`src/types/game.ts`):
  - `Gift { step: number; message: string; }`
  - `GameConfig { steps: number; gifts: Gift[]; finalMessage: string; ... }`
- [x] Xây dựng module `src/lib/gameUrl.ts`:
  - Hàm `encodeGameConfig(config: GameConfig): string` (dùng `lz-string` `compressToEncodedURIComponent`)
  - Hàm `decodeGameConfig(data: string): GameConfig | null` (giải nén an toàn)
  - Hàm `validateGameConfig(config: unknown): config is GameConfig`:
    - `steps` nằm trong khoảng 20 - 200
    - Số lượng quà tối đa 10
    - Vị trí `gift.step > 0` và `< steps`
    - Chiều dài `message` <= 150 ký tự, `finalMessage` <= 300 ký tự
  - Fallback config mặc định khi dữ liệu URL bị hỏng hoặc không hợp lệ

---

### Giai đoạn 3: Trang tạo game (`/create`)
- [ ] Thiết kế giao diện form tạo màn chơi:
  - Input số bậc thang (mặc định: 80, min: 20, max: 200)
  - Danh sách quà tặng: thêm/xóa quà, chọn bậc xuất hiện, nhập lời nhắn
  - Input lời chúc cuối cùng khi đến Cung Trăng
- [ ] Kiểm tra tính hợp lệ dữ liệu trực tiếp trên form (Validation feedback)
- [ ] Nút **"Tạo link"**:
  - Chuyển đổi dữ liệu form sang `GameConfig`
  - Tạo link `/play?data=...`
- [ ] Màn hình kết quả sau khi tạo link:
  - Hiển thị URL chia sẻ
  - Nút **"Copy Link"** (kèm thông báo toast đã copy)
  - Nút **"Chơi thử"** (chuyển hướng sang trang `/play`)

---

### Giai đoạn 4: Lõi Gameplay cơ bản (Core Gameplay Mechanics)
- [ ] Tích hợp Phaser 3 vào React component (`/play`):
  - Khởi tạo Canvas tương thích màn hình dọc mobile và desktop
  - Xử lý cleanup vòng đời game khi unmount
- [ ] Xây dựng nhân vật Chú Cuội (`src/game/Cuoi.ts`):
  - Tạo hình Chú Cuội tròn mềm, dễ thương (dạng kẹo bông gòn)
  - Animation trạng thái: leo, nghỉ/lơ lửng, tụt dốc, ăn mừng
- [ ] Cơ chế vật lý & Năng lượng KAMA:
  - Chỉ số KAMA (0 - 100%): liên tục giảm theo thời gian (`kamaDrain`)
  - Thao tác Tap/Click: tăng vận tốc leo (`velocity += tapPower`) và hồi phục KAMA
  - Khi ngừng tap: trọng lực kéo xuống, giảm tốc độ
  - Khi KAMA = 0: Chú Cuội trượt xuống bậc thang; sau khi trượt một khoảng cách, tự hồi 30% KAMA để tiếp tục
- [ ] Bậc thang & Điểm mốc Quà (Gift Checkpoints):
  - Render bậc thang dựa trên `config.steps`
  - Đặt các hộp quà tại các bậc tương ứng
  - Khi chạm quà: tạm dừng game (`pause`), kích hoạt sự kiện mở quà
- [ ] Checkpoint Cung Trăng (Victory):
  - Khi chạm bậc cuối cùng: kích hoạt chiến thắng, dừng rơi, kích hoạt sự kiện kết thúc

---

### Giai đoạn 5: Giao diện màn chơi & Tương tác React - Phaser (`/play`)
- [ ] Đọc và giải mã tham số `?data=` từ URL:
  - Xử lý trạng thái tải (loading)
  - Xử lý trạng thái lỗi (nếu config sai/hỏng, hiển thị thông báo thân thiện kèm nút về `/create`)
- [ ] UI Overlay trong khi chơi:
  - Thanh năng lượng KAMA (`KamaBar.tsx`)
  - Tiến độ leo thang (Bậc hiện tại / Tổng số bậc)
  - Nút Pause / Âm thanh
- [ ] Modal mở quà (`GiftModal.tsx`):
  - Hiệu ứng mở hộp quà 🎁
  - Hiển thị lời nhắn của người tặng
  - Nút "Tiếp tục leo" (hồi thêm một lượng KAMA)
- [ ] Modal chiến thắng (`VictoryModal.tsx`):
  - Lời chúc mừng đến Cung Trăng 🌕
  - Hiển thị `finalMessage`
  - Hiệu ứng pháo hoa / hoa giấy (confetti)
  - Nút "Tạo game gửi bạn bè" (về lại `/create`)

---

### Giai đoạn 6: Màn hình Landing Page (`/`)
- [ ] Giao diện mở đầu ấm cúng mang phong cách Trung Thu
- [ ] Lời giới thiệu game và cách thức hoạt động
- [ ] Nút CTA: **"Tạo game ngay"** (dẫn tới `/create`)
- [ ] Nút **"Chơi mẫu"** (dẫn tới `/play` với một cấu hình Trung Thu mẫu tạo sẵn)

---

### Giai đoạn 7: Đồ họa nghệ thuật, Âm thanh & Trải nghiệm (Art & Polish)
- [ ] Thiết kế background Parallax đa tầng thay đổi theo độ cao:
  - **Tầng 1 (Dưới cùng):** Làng quê Trung Thu Việt Nam, rước đèn
  - **Tầng 2:** Mái ngói rêu phong phố cổ, đèn lồng đỏ/vàng treo cao
  - **Tầng 3:** Biển mây bồng bềnh
  - **Tầng 4:** Bầu trời đêm đầy sao lấp lánh
  - **Tầng 5 (Đỉnh):** Cung Trăng vàng rực rỡ
- [ ] Âm thanh & Âm nhạc (SFX & BGM):
  - Tiếng tap bước nhảy vui tai
  - Âm thanh mở quà leng keng
  - Âm thanh chiến thắng lên tới Cung Trăng
  - Nút bật/tắt âm thanh (Mute/Unmute)
- [ ] Tối ưu hóa Mobile & Touch:
  - Ngăn double-tap phóng to màn hình (`touch-action: manipulation`)
  - Vùng bấm tap nhạy, mượt mà trên điện thoại

---

### Giai đoạn 8: Kiểm thử & Triển khai (Testing & Deployment)
- [ ] Kiểm thử giới hạn độ dài URL trên các trình duyệt và app nhắn tin (Zalo, Facebook Messenger, iMessage)
- [ ] Kiểm thử Responsive trên nhiều độ phân giải màn hình
- [ ] Build kiểm tra lỗi TypeScript và tối ưu bundle size
- [ ] Deploy lên môi trường tĩnh (Vercel, Cloudflare Pages hoặc GitHub Pages)
