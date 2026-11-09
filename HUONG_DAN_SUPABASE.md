# HƯỚNG DẪN CÀI ĐẶT SUPABASE (MIỄN PHÍ 100% - KHÔNG CẦN THẺ VISA)

## BƯỚC 1: ĐĂNG NHẬP SUPABASE
1. Mở trình duyệt Chrome và vào trang web: **https://supabase.com**
2. Bấm vào nút xanh **"Start your project"** (hoặc nút **"Sign in"** góc trên bên phải).
3. Chọn **"Continue with GitHub"** (đăng nhập bằng tài khoản GitHub có sẵn trên máy của bạn).

---

## BƯỚC 2: TẠO DỰ ÁN MỚI (PROJECT)
1. Bấm nút màu xanh: **"New project"**.
2. Điền thông tin:
   - **Name**: Nhập `misend` (hoặc tên tùy ý).
   - **Database Password**: Nhập mật khẩu bạn muốn (hoặc bấm "Generate a password").
   - **Region**: Chọn **Singapore (ap-southeast-1)** để tốc độ mạng tại Việt Nam nhanh nhất.
   - **Pricing Plan**: Đảm bảo là **Free ($0/month)**.
3. Bấm nút **"Create new project"** và đợi khoảng 1 phút để máy chủ khởi tạo.

---

## BƯỚC 3: TẠO KHO LƯU TRỮ (STORAGE BUCKET)
1. Nhìn sang thanh menu bên trái, bấm vào biểu tượng **Storage** (hình cái xô/hộp).
2. Bấm nút **"New bucket"**.
3. Điền:
   - **Name of bucket**: `files`
   - **Public bucket**: Gạt công tắc sang **ON** (màu xanh).
4. Bấm **"Save"**.

---

## BƯỚC 4: MỞ QUYỀN TẢI LÊN (SQL EDITOR)
1. Nhìn menu bên trái, bấm vào biểu tượng **SQL Editor** (hình `>_`).
2. Bấm **"New query"**.
3. Sao chép và dán 2 dòng lệnh sau vào ô nhập:
```sql
create policy "Allow all uploads" on storage.objects for insert with check (bucket_id = 'files');
create policy "Allow all reads" on storage.objects for select using (bucket_id = 'files');
```
4. Bấm nút xanh **"Run"** (hoặc nhấn Ctrl + Enter). Màn hình báo "Success" là xong!

---

## BƯỚC 5: LẤY MÃ KẾT NỐI (URL & ANON KEY)
1. Bấm vào biểu tượng **Project Settings** (hình bánh răng ⚙️ ở góc dưới cùng bên trái).
2. Chọn mục **API**.
3. Sao chép 2 thông tin:
   - **Project URL** (dạng `https://abcdefgh.supabase.co`)
   - **Project API keys** -> dòng **anon / public** (chuỗi ký tự dài bắt đầu bằng `eyJ...`)
4. Dán 2 thông tin này vào file `app.js` tại dòng 4 và 5.
