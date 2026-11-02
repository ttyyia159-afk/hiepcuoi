import json
from http.server import HTTPServer, SimpleHTTPRequestHandler
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Cấu hình tài khoản Gmail và Mật khẩu ứng dụng (App Password) 16 ký tự của bạn
GMAIL_USER = "ttyyia159@gmail.com"
GMAIL_APP_PASSWORD = "broi iwfz jjfx niuu"
PORT = 8080


class WeddingHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        if self.path == "/send-rsvp":
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(raw_body)
                guest_name = data.get("guestName", "Quý khách")
                guest_phone = data.get("guestPhone", "Không cung cấp")
                status_text = data.get("statusText", "XÁC NHẬN THAM DỰ")
                guest_msg = data.get("guestMsg", "")
                time_now = data.get("timeNow", "")

                subject = f"[Thiệp Cưới Nguyễn Hoàng Hải & Trần Minh Anh] Thông báo từ {guest_name}: {status_text}"
                html_body = f"""
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 2px solid #c69a2c; border-radius: 12px; padding: 20px; background: #fffdf9;">
                    <h2 style="color: #7d1828; margin-top: 0;">💒 Thông Báo Phản Hồi Thiệp Cưới</h2>
                    <p>Xin chào <strong>Nguyễn Hoàng Hải &amp; Trần Minh Anh</strong>,</p>
                    <p>Bạn vừa nhận được một thông báo xác nhận tham dự tiệc cưới mới:</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 170px;">Họ và tên khách mời:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">{guest_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Số điện thoại liên hệ:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">{guest_phone}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Trạng thái phản hồi:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #7d1828; font-weight: bold;">{status_text}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Lời chúc gửi Cô Dâu &amp; Chú Rể:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">{guest_msg}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Thời gian gửi:</td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">{time_now}</td>
                        </tr>
                    </table>
                    <p style="font-size: 12px; color: #777;">Tiệc cưới: 11:30 - Chủ Nhật, Ngày 22/11/2026 tại Trung tâm Sảnh tiệc Cưới Mường Thanh, TP. Thanh Hóa.</p>
                </div>
                """

                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"Thiệp Cưới Nguyễn Hoàng Hải & Trần Minh Anh <{GMAIL_USER}>"
                msg["To"] = GMAIL_USER
                msg.attach(MIMEText(html_body, "html", "utf-8"))

                with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
                    server.login(GMAIL_USER, GMAIL_APP_PASSWORD.replace(" ", ""))
                    server.sendmail(GMAIL_USER, [GMAIL_USER], msg.as_string())

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Đã gửi về Gmail thành công!"}).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()


if __name__ == "__main__":
    print("============================================================")
    print(f"Server Thiep Cuoi dang chay tai: http://localhost:{PORT}")
    print(f"Moi luot bam Xac nhan / Tu choi se gui thang toi: {GMAIL_USER}")
    print("============================================================")
    server = HTTPServer(("0.0.0.0", PORT), WeddingHandler)
    server.serve_forever()
