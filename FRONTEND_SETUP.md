# Hướng Dẫn Setup Frontend

## Tạo file .env.local

Tạo file `.env.local` trong thư mục gốc của project với nội dung sau:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_IMAGE_URL=http://localhost:8000

# CORS URLs for MangaDex API
NEXT_PUBLIC_CORS_URL=https://cors.truyendex.xyz
NEXT_PUBLIC_CORS_V2_URL=https://cors-v2.truyendex.xyz

# Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Turnstile (Cloudflare)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAABkMYinukE_N3Id
```

## Chạy Frontend

```bash
npm run dev
```

## Test Authentication

1. Truy cập http://localhost:3000
2. Thử đăng nhập với:
   - Email: admin@truyendex.com
   - Password: admin123

## Troubleshooting

### Lỗi "Access denied. No token provided"
- Đảm bảo backend đang chạy trên port 8000
- Kiểm tra file .env.local có đúng không
- Restart cả frontend và backend

### Lỗi CORS
- Kiểm tra FRONTEND_URL trong backend .env
- Đảm bảo frontend chạy trên port 3000
