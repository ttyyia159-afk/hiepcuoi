# 🔥 HƯỚNG DẪN CẤU HÌNH FIREBASE (MÁY CHỦ GOOGLE CLOUD MIỄN PHÍ)

**Firebase** (của Google) chính là giải pháp **tốt nhất, mạnh mẽ nhất và ổn định 100%** để làm trang web chia sẻ phai giống như **Fsend.vn**.

---

### 🌟 VÌ SAO FIREBASE LÀ LỰA CHỌN SỐ 1?
- ✅ **Miễn phí 100% vĩnh viễn** (Gói Spark của Google miễn phí sẵn 5GB lưu trữ và hàng chục ngàn lượt tải mỗi ngày).
- ✅ **Người gửi tải phai lên xong có thể tắt máy, đi ngủ thoải mái**.
- ✅ **Người nhận bấm vào link là tải được ngay tức thì trong 1 giây**, kể cả bấm trong ứng dụng **Zalo, Messenger, trên iPhone, Android hay 4G/Wifi** mà không bao giờ bị lỗi *"đang chờ người gửi"*!
- ✅ **Bạn vẫn có thể tải các file này lên GitHub Pages** để có link trang web mang tên bạn (`https://<ten-user>.github.io/...`).

---

## ⚡ 5 BƯỚC CÀI ĐẶT FIREBASE (CHỈ MẤT 3 PHÚT)

### 🔹 Bước 1: Tạo dự án Firebase
1. Truy cập vào trang quản lý: [console.firebase.google.com](https://console.firebase.google.com) và đăng nhập bằng tài khoản Gmail của bạn.
2. Bấm vào nút **Add project** (hoặc **Thêm dự án**).
3. Đặt tên dự án bất kỳ, ví dụ: `my-fsend` -> Bấm **Continue**.
4. Mục Google Analytics: Bạn có thể tắt gạt công tắc hoặc để mặc định -> Bấm **Create project**. Chờ vài giây để Google tạo máy chủ cho bạn.

---

### 🔹 Bước 2: Bật Cloud Storage (Nơi lưu trữ phai)
1. Ở thanh menu bên trái, bấm vào mục **Build** -> chọn **Storage**.
2. Bấm nút **Get started**.
3. Tại ô chọn chế độ bảo mật: Chọn **Start in test mode** (để ai có link cũng tải được phai) -> Bấm **Next**.
4. Vị trí máy chủ (Location): Chọn mặc định hoặc `asia-southeast1` (Singapore) -> Bấm **Done**.

---

### 🔹 Bước 3: Bật Firestore Database (Nơi lưu tên phai & thông tin)
1. Ở thanh menu bên trái, bấm vào mục **Build** -> chọn **Firestore Database**.
2. Bấm nút **Create database**.
3. Chọn **Start in test mode** -> Bấm **Next** -> Bấm **Enable**.

---

### 🔹 Bước 4: Lấy mã cấu hình dán vào web
1. Bấm vào biểu tượng hình bánh răng ⚙️ (**Project settings**) ở góc trên bên trái màn hình.
2. Cuộn chuột xuống phần **Your apps**, bấm vào biểu tượng Web `</>` (hình tròn có cặp dấu ngoặc nhọn).
3. Đặt tên App: ví dụ `fsend-web` -> Bấm **Register app**.
4. Bạn sẽ thấy Google hiện ra một đoạn mã có dạng:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyB...",
     authDomain: "my-fsend-xxx.firebaseapp.com",
     projectId: "my-fsend-xxx",
     storageBucket: "my-fsend-xxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```
5. Bạn hãy sao chép toàn bộ đoạn `firebaseConfig` này.

---

### 🔹 Bước 5: Dán mã cấu hình vào file `app.js`
1. Mở file **`WebChiaSe_Firebase\app.js`** bằng Notepad hoặc trình soạn thảo.
2. Tìm đến khoảng dòng 23 (nơi có chữ `const firebaseConfig = { ... }`).
3. Dán đè đoạn mã cấu hình mà Google vừa cấp cho bạn vào đó rồi lưu file lại (Ctrl + S).

---

## 🚀 ĐƯA LÊN GITHUB PAGES HOẶC DÙNG NGAY:

Sau khi dán mã cấu hình xong, bạn có thể:
1. **Tải toàn bộ 3 file trong thư mục `WebChiaSe_Firebase` lên GitHub Pages** của bạn (`index.html`, `style.css`, `app.js`).
2. Mở link GitHub của bạn (ví dụ: `https://<ten-user>.github.io/my-fsend/`).
3. Chọn phai và bấm **TẢI PHAI LÊN MÁY CHỦ GOOGLE**.
4. Khi tải xong, bấm **SAO CHÉP LIÊN KẾT ĐỂ GỬI CHO BẠN BÈ**.
5. Gửi link đó cho bất kỳ ai qua Zalo hay Facebook:
   - Họ bấm vào sẽ thấy ngay: **Tên phai** và **Dung lượng phai**.
   - Bấm nút **TẢI PHAI XUỐNG NGAY** là phai tải thẳng từ máy chủ Google Cloud về máy họ trong 1 giây, cực kỳ mượt mà!
