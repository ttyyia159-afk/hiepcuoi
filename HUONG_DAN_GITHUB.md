# 🌐 HƯỚNG DẪN ĐƯA TRANG WEB LÊN GITHUB PAGES (MIỄN PHÍ 100%)

Phiên bản này được thiết kế đặc biệt để **chạy 100% trên nền tảng lưu trữ web miễn phí của GitHub (GitHub Pages)** mà không cần máy chủ backend, sử dụng công nghệ truyền tệp tin trực tiếp qua trình duyệt **WebRTC P2P (Peer-to-Peer)** giống như Snapdrop, Wormhole và Fsend.

---

## ⚡ CÁC BƯỚC ĐƯA LÊN GITHUB CHỈ TRONG 2 PHÚT

### 🔹 Bước 1: Tạo Repository (Kho chứa) trên GitHub
1. Đăng nhập vào tài khoản GitHub của bạn tại [github.com](https://github.com).
2. Bấm vào nút dấu cộng `+` ở góc trên bên phải -> chọn **New repository** (hoặc truy cập trực tiếp link: [github.com/new](https://github.com/new)).
3. Điền các thông tin:
   - **Repository name**: Đặt tên bất kỳ bạn thích, ví dụ: `my-fsend` (hoặc `chiasefile`).
   - Chọn chế độ: **Public** (Công khai).
4. Bấm nút xanh **Create repository**.

---

### 🔹 Bước 2: Tải các file lên GitHub
1. Trong trang kho chứa vừa tạo, bấm vào dòng chữ **"uploading an existing file"** (hoặc bấm `Add file` -> `Upload files`).
2. Mở thư mục `WebChiaSe_GitHubPages` trên máy tính của bạn, chọn tất cả các file sau và **kéo thả vào trình duyệt**:
   - ✅ `index.html`
   - ✅ `style.css`
   - ✅ `app.js`
   - ✅ `peerjs.min.js`
   - ✅ `qrcode.min.js`
3. Cuộn xuống dưới cùng và bấm nút xanh: **Commit changes**.

---

### 🔹 Bước 3: Bật tính năng GitHub Pages (Kích hoạt trang web)
1. Trên thanh menu ngang của Repository, bấm vào tab **Settings** (biểu tượng bánh răng).
2. Ở cột danh mục bên trái, cuộn xuống và bấm vào mục **Pages** (trong phần Code and automation).
3. Tại phần **Build and deployment**:
   - Mục **Branch**: Chọn nhánh **`main`** (hoặc `master`).
   - Thư mục bên cạnh: Giữ nguyên là **`/(root)`**.
   - Bấm nút **Save**.
4. Chờ khoảng 30 giây đến 1 phút rồi F5 (tải lại trang). Bạn sẽ thấy thông báo:
   🎉 *"Your site is live at `https://<ten-tai-khoan>.github.io/my-fsend/`"*

---

## 🚀 CÁCH SỬ DỤNG ĐỂ CHIA SẺ FILE

1. **Bạn (Người gửi)**:
   - Mở đường link trang web của bạn: `https://<ten-tai-khoan>.github.io/my-fsend/`
   - Kéo & thả file cần chia sẻ vào ô (hỗ trợ mọi định dạng: Video, ZIP, Game, Tài liệu,... không giới hạn dung lượng).
   - Đặt mật khẩu hoặc lời nhắn nếu muốn.
   - Bấm **TẠO LINK CHIA SẺ TRỰC TIẾP 🚀**.
   - Web sẽ tạo ra một link riêng, ví dụ:
     `https://<ten-tai-khoan>.github.io/my-fsend/#room=fsend-8a9d1c`
   - Bấm **Sao Chép** link này gửi cho bạn bè (hoặc đưa mã QR cho họ quét bằng điện thoại).

2. **Người nhận**:
   - Nhấp vào link bạn gửi.
   - Trang web sẽ tự động kết nối trực tiếp với trình duyệt của bạn và hiển thị thông tin file.
   - Bấm nút **TẢI XUỐNG TỆP TIN 📥** -> Tệp tin sẽ truyền thẳng từ máy bạn sang máy họ với tốc độ mạng tối đa!

3. ⚠️ **Lưu ý nhỏ**:
   - Vì file truyền trực tiếp từ máy của bạn sang máy người nhận (không lưu qua máy chủ trung gian nào), nên **bạn chỉ cần giữ tab web mở** trong thời gian người nhận đang tải về. Khi người nhận tải xong, bạn có thể đóng tab web bất kỳ lúc nào.
