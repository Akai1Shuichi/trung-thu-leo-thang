# 🚀 Hướng Dẫn Triển Khai: Cuội Leo Cung Trăng 🌕

Dự án là một **Static Web Mini-Game** (Next.js App Router + Phaser 3 + Tailwind CSS), hoạt động 100% phía Client, không cần backend, không cần cơ sở dữ liệu. Toàn bộ dữ liệu game được nén và chia sẻ an toàn qua URL.

---

## 💻 1. Chạy Thử Trên Máy Cá Nhân (Local Development)

### Chế độ phát triển (Dev Mode):
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

### Build và Xuất bản tĩnh (Static Export):
```bash
npm run build
```
Thư mục `out/` chứa toàn bộ mã nguồn tĩnh (HTML, CSS, JS) sẵn sàng triển khai.

### Chạy thử bản xuất bản tĩnh:
```bash
npx serve out
```

---

## 🌐 2. Hướng Dẫn Triển Khai Lên Các Nền Tảng Miễn Phí

### Cách 1: Triển khai lên Vercel (Khuyên dùng - Nhanh nhất)
1. Đẩy mã nguồn lên GitHub/GitLab.
2. Truy cập [vercel.com](https://vercel.com) và chọn **"Add New Project"**.
3. Chọn kho lưu trữ dự án `trung-thu-moon-climb`.
4. Vercel sẽ tự động nhận diện cấu hình Next.js và hoàn tất triển khai trong 1 phút!

---

### Cách 2: Triển khai lên Cloudflare Pages
1. Đăng nhập [dash.cloudflare.com](https://dash.cloudflare.com) ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages**.
2. Kết nối với kho lưu trữ GitHub của bạn.
3. Thiết lập thông số Build:
   - **Framework preset**: `Next.js (Static Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
4. Bấm **Save and Deploy**. Cloudflare Pages sẽ cung cấp tên miền miễn phí `.pages.dev`.

---

### Cách 3: Triển khai lên GitHub Pages
1. Trong file `package.json`, thêm script deploy:
   ```json
   "scripts": {
     "deploy": "next build && touch out/.nojekyll && gh-pages -d out"
   }
   ```
2. Cài đặt `npm install -D gh-pages`
3. Chạy lệnh:
   ```bash
   npm run deploy
   ```
4. Vào **Settings ➔ Pages** trong kho lưu trữ GitHub, chọn nguồn từ nhánh `gh-pages`.

---

## 🔍 3. Kiểm Tra Tính Tương Thích

| Nền tảng / Ứng dụng | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| **Zalo** | ✅ Tương thích 100% | Mở trực tiếp trong In-App Browser của Zalo, URL nén < 1100 ký tự |
| **Facebook Messenger** | ✅ Tương thích 100% | Web Audio & Touch events hoạt động mượt mà |
| **Safari iOS** | ✅ Tương thích 100% | Đã cấu hình chống phóng to double-tap, canvas hiển thị trọn vẹn |
| **Chrome / Firefox Android** | ✅ Tương thích 100% | Hỗ trợ phản hồi rung Haptic Feedback và Web Share API |
