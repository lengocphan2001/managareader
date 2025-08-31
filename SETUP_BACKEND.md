# Hướng Dẫn Setup Backend TruyenDex

## Tổng Quan

Tôi đã tạo một backend hoàn chỉnh cho TruyenDex với các tính năng:

- ✅ **Authentication System** (JWT)
- ✅ **User Management**
- ✅ **Comment System** (với replies)
- ✅ **Follow System**
- ✅ **Read List Management**
- ✅ **Database Schema** (PostgreSQL + Prisma)
- ✅ **Security** (Rate limiting, CORS, Helmet)

## Cấu Trúc Backend

```
backend/
├── src/
│   ├── server.js              # Main server file
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── errorHandler.js   # Error handling
│   └── routes/
│       ├── auth.js           # Authentication routes
│       ├── user.js           # User management
│       ├── comment.js        # Comment system
│       └── series.js         # Series management
├── prisma/
│   └── schema.prisma         # Database schema
├── scripts/
│   └── seed.js              # Database seeding
├── package.json
├── Dockerfile
└── README.md
```

## Bước 1: Cài Đặt Backend

### 1.1 Cài đặt dependencies

```bash
cd backend
npm install
```

### 1.2 Cấu hình Database

Tạo file `.env`:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/truyendex?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=8000
NODE_ENV="development"

# CORS
FRONTEND_URL="http://localhost:3000"
```

### 1.3 Setup Database

```bash
# Tạo database migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed database với admin user
node scripts/seed.js
```

### 1.4 Chạy Backend

```bash
# Development
npm run dev

# Backend sẽ chạy tại http://localhost:8000
```

## Bước 2: Cập Nhật Frontend

### 2.1 Tạo file .env.local

```bash
# Trong thư mục gốc của project
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_IMAGE_URL=http://localhost:8000
NEXT_PUBLIC_CORS_URL=https://cors.truyendex.xyz
NEXT_PUBLIC_CORS_V2_URL=https://cors-v2.truyendex.xyz
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAABkMYinukE_N3Id
```

### 2.2 Cập nhật URL utility

File `src/utils/url.ts` đã được cập nhật để sử dụng backend local.

### 2.3 Xóa mock API routes

Xóa các file mock API routes đã tạo trước đó:

```bash
rm src/app/api/user/route.ts
rm src/app/api/series/homepage/route.ts
rm src/app/api/comment/recent/route.ts
```

## Bước 3: Test Backend

### 3.1 Health Check

```bash
curl http://localhost:8000/api/health
```

### 3.2 Test Authentication

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "password_confirmation": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Bước 4: Chạy Full Stack

### 4.1 Terminal 1 - Backend

```bash
cd backend
npm run dev
```

### 4.2 Terminal 2 - Frontend

```bash
npm run dev
```

### 4.3 Truy cập

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin user: admin@truyendex.com / admin123

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Thông tin user

### User Management

- `GET /api/user` - Thông tin user
- `GET /api/user/read-list` - Danh sách đã đọc
- `POST /api/user/read-list/sync` - Đồng bộ danh sách
- `POST /api/user/change-password` - Đổi mật khẩu
- `POST /api/user/change-name` - Đổi tên

### Comments

- `GET /api/comment/recent` - Bình luận gần đây
- `GET /api/comment/list` - Danh sách bình luận
- `POST /api/comment/store` - Tạo bình luận
- `POST /api/comment/update` - Cập nhật bình luận
- `POST /api/comment/delete` - Xóa bình luận

### Series

- `GET /api/series/homepage` - Truyện trang chủ
- `POST /api/series/follow` - Theo dõi truyện
- `POST /api/series/check-info` - Thông tin truyện

## Database Schema

### Users Table

- id, email, name, password, avatar_path
- email_verified_at, created_at, updated_at

### Comments Table

- id, content, user_id, commentable_type, commentable_id
- parent_id (for replies), created_at, updated_at

### Follows Table

- id, user_id, series_id, created_at

### ReadList Table

- id, user_id, series_id, chapter_id, created_at, updated_at

## Troubleshooting

### Database Connection Error

```bash
# Kiểm tra PostgreSQL đang chạy
sudo service postgresql status

# Tạo database
createdb truyendex
```

### Port Already in Use

```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### CORS Error

- Kiểm tra `FRONTEND_URL` trong `.env`
- Đảm bảo frontend chạy trên port 3000

## Production Deployment

### Docker

```bash
cd backend
docker build -t truyendex-backend .
docker run -p 8000:8000 truyendex-backend
```

### Environment Variables

- `DATABASE_URL`: PostgreSQL production URL
- `JWT_SECRET`: Strong secret key
- `NODE_ENV`: production
- `FRONTEND_URL`: Production frontend URL

## Kết Luận

Backend đã được tạo hoàn chỉnh với tất cả tính năng cần thiết cho TruyenDex:

1. ✅ **Authentication** - JWT-based auth
2. ✅ **User Management** - Profile, settings, password change
3. ✅ **Comment System** - Comments với replies
4. ✅ **Follow System** - Theo dõi truyện
5. ✅ **Read List** - Danh sách đã đọc
6. ✅ **Security** - Rate limiting, CORS, validation
7. ✅ **Database** - PostgreSQL với Prisma ORM

Bây giờ bạn có thể chạy cả frontend và backend để có một hệ thống TruyenDex hoàn chỉnh!
