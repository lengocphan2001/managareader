# TruyenDex Backend

Backend API cho TruyenDex - Website đọc truyện tranh Việt Nam.

## Tính năng

- **Authentication**: Đăng nhập/đăng ký với JWT
- **User Management**: Quản lý thông tin người dùng
- **Comment System**: Hệ thống bình luận cho truyện/chương
- **Follow System**: Theo dõi truyện yêu thích
- **Read List**: Danh sách truyện đã đọc
- **Rate Limiting**: Giới hạn số lượng request
- **CORS**: Hỗ trợ CORS cho frontend

## Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình Database

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cập nhật các biến môi trường trong `.env`:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/truyendex?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=8000
FRONTEND_URL="http://localhost:3000"
```

### 3. Setup Database

```bash
# Tạo database migration
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Chạy server

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### User
- `GET /api/user` - Lấy thông tin user
- `GET /api/user/read-list` - Lấy danh sách đã đọc
- `POST /api/user/read-list/sync` - Đồng bộ danh sách đã đọc
- `POST /api/user/change-password` - Đổi mật khẩu
- `POST /api/user/change-name` - Đổi tên
- `POST /api/user/change-avatar` - Đổi avatar

### Comments
- `GET /api/comment/recent` - Lấy bình luận gần đây
- `GET /api/comment/list` - Lấy danh sách bình luận
- `POST /api/comment/store` - Tạo bình luận mới
- `POST /api/comment/update` - Cập nhật bình luận
- `POST /api/comment/delete` - Xóa bình luận
- `POST /api/comment/fetch-reply` - Lấy replies

### Series
- `GET /api/series/homepage` - Lấy truyện trang chủ
- `POST /api/series/follow` - Theo dõi/bỏ theo dõi truyện
- `POST /api/series/check-info` - Kiểm tra thông tin truyện

## Database Schema

### Users
- Thông tin người dùng cơ bản
- Hệ thống role (admin, mod, user)

### Comments
- Bình luận cho truyện/chương
- Hỗ trợ reply (nested comments)

### Follows
- Theo dõi truyện yêu thích

### ReadList
- Danh sách truyện đã đọc
- Hỗ trợ đồng bộ từ các nguồn khác

## Security

- **JWT Authentication**: Xác thực bằng JWT token
- **Rate Limiting**: Giới hạn 100 requests/15 phút
- **CORS**: Cấu hình CORS cho frontend
- **Helmet**: Security headers
- **Input Validation**: Validate tất cả input

## Development

### Prisma Commands

```bash
# Xem database
npx prisma studio

# Reset database
npx prisma migrate reset

# Deploy migration
npx prisma migrate deploy
```

### Testing

```bash
# Test API endpoints
curl http://localhost:8000/api/health
```

## Deployment

### Docker

```bash
# Build image
docker build -t truyendex-backend .

# Run container
docker run -p 8000:8000 truyendex-backend
```

### Environment Variables

Cần cấu hình các biến môi trường sau:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key cho JWT
- `PORT`: Port server (default: 8000)
- `FRONTEND_URL`: URL frontend cho CORS
- `NODE_ENV`: Environment (development/production)

## License

MIT
