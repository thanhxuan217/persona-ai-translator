# Persona AI Translator (Ollama Edition)

Một tiện ích mở rộng cho trình duyệt (Chrome Extension) giúp dịch thuật thông minh dựa trên các **Persona** tùy chỉnh, sử dụng sức mạnh của các mô hình LLM chạy cục bộ thông qua **Ollama**.

## 🚀 Tính năng chính
- **Cấu hình Persona**: Tạo các hồ sơ dịch thuật riêng biệt (ngôn ngữ đích, phong cách, chuyên ngành).
- **Phỏng vấn Persona**: AI sẽ phỏng vấn bạn để tự động tạo cấu hình dịch thuật phù hợp nhất.
- **Dịch thuật nhanh**: Quét văn bản trên trang web để dịch ngay lập tức trong Side Panel.
- **Hỗ trợ Ollama**: Kết nối trực tiếp với Ollama chạy trên máy cá nhân, đảm bảo tính riêng tư.

## 🛠️ Hướng dẫn cài đặt

### 1. Cài đặt các thư viện (Dependencies)
Mở terminal tại thư mục gốc và chạy:
```bash
npm install
```

### 2. Chế độ phát triển
Dự án được xây dựng bằng Vite. Để bản build tự động cập nhật khi bạn sửa code:
```bash
npm run dev
```
(Lệnh này sẽ chạy `vite build --watch`)

### 3. Nạp Extension vào trình duyệt
1. Mở Chrome/Edge và truy cập `chrome://extensions/`.
2. Bật **Developer mode** (Chế độ nhà phát triển).
3. Chọn **Load unpacked** (Tải tiện ích đã giải nén).
4. Chọn thư mục **`dist`** trong dự án này.

---

## ⚠️ Xử lý lỗi kết nối (Ollama API 403 Forbidden)

Nếu bạn thấy lỗi `Ollama API error (403)` khi nhấn **Retry** hoặc chat, đó là do vấn đề **CORS** (Ollama chặn yêu cầu từ Extension). 

### Giải pháp trên Windows (PowerShell):
1. **Thoát hoàn toàn ứng dụng Ollama** (Quit từ khay hệ thống).
2. Mở **PowerShell (Admin)** và chạy lệnh sau:
   ```powershell
   [Environment]::SetEnvironmentVariable("OLLAMA_ORIGINS", "chrome-extension://*", "User")
   ```
3. **Mở lại ứng dụng Ollama**.
4. Quay lại Extension và nhấn **Retry**.

---

## 🖥️ Yêu cầu hệ thống
- **Ollama**: Đã cài đặt và đang chạy tại `http://localhost:11434`.
- **Model**: Mặc định sử dụng `translategemma:latest`. Bạn có thể thay đổi trong phần cấu hình Persona.
