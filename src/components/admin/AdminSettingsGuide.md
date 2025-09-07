# Admin Settings - Hướng Dẫn Đầy Đủ

## Tổng Quan

Admin Settings cho phép quản trị viên cấu hình toàn bộ thông tin cơ bản của website một cách dễ dàng và trực quan.

## Các Tính Năng Chính

### 🏠 **Tab Overview**

- **Xem tổng quan** tất cả cài đặt website
- **Trạng thái cấu hình** với các badge màu sắc
- **Thống kê** số lượng cài đặt đã hoàn thành
- **Preview** logo, favicon, màu sắc

### ⚙️ **Tab Settings**

- **6 tab cài đặt** chi tiết
- **Upload drag & drop** cho logo và favicon
- **Real-time updates** không cần refresh trang

## Chi Tiết Các Tab Cài Đặt

### 1. **General Settings**

- **Site Name** - Tên website (bắt buộc)
- **Site Description** - Mô tả website (bắt buộc)
- **Site URL** - URL chính của website
- **Admin Email** - Email quản trị viên
- **Timezone** - Múi giờ
- **Language** - Ngôn ngữ

### 2. **Appearance Settings**

- **Main Logo** - Logo chính (header)
- **Footer Logo** - Logo footer (riêng biệt)
- **Favicon** - Icon tab trình duyệt
- **Primary Color** - Màu chủ đạo
- **Dark Mode** - Bật/tắt chế độ tối

### 3. **SEO Settings**

- **Meta Keywords** - Từ khóa SEO
- **Meta Author** - Tác giả website
- **Meta Description** - Mô tả SEO

### 4. **Analytics Settings**

- **Google Analytics ID** - Mã tracking GA
- **Facebook Pixel ID** - Mã tracking Facebook

### 5. **Scripts Settings**

- **Header Scripts** - Scripts trong `<head>`
- **Footer Scripts** - Scripts trước `</body>`

### 6. **Security Settings**

- **Các cài đặt bảo mật** (sẽ được bổ sung)

## Tính Năng Upload

### 🎨 **Drag & Drop Upload**

- **Kéo thả** file trực tiếp vào vùng upload
- **Click để browse** file từ máy tính
- **Preview** hình ảnh ngay lập tức
- **Progress bar** hiển thị tiến trình upload

### 📁 **Hỗ Trợ File**

- **Logo**: PNG, JPG, SVG, WebP (max 5MB)
- **Favicon**: ICO, PNG, SVG (max 1MB)
- **Footer Logo**: PNG, JPG, SVG, WebP (max 5MB)

### 🔗 **URL Input**

- **Nhập URL trực tiếp** cho logo/favicon
- **Hỗ trợ** cả relative path và absolute URL
- **Validation** tự động

## Cập Nhật Real-time

### ⚡ **Tự Động Cập Nhật**

- **Storage listeners** phát hiện thay đổi
- **Logo cập nhật** ngay lập tức trên client
- **Không cần refresh** trang
- **Đồng bộ** giữa các tab trình duyệt

### 🎯 **Áp Dụng Ngay**

- **Meta tags** cập nhật tự động
- **CSS variables** thay đổi màu sắc
- **Favicon** thay đổi icon tab
- **Logo** hiển thị trên header/footer

## Cấu Trúc Dữ Liệu

### 📊 **AdminSettings Interface**

```typescript
interface AdminSettings {
  // Basic Info
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;

  // System
  timezone: string;
  language: string;

  // Branding
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  footerLogoUrl: string;
  enableDarkMode: boolean;

  // SEO
  metaKeywords: string;
  metaAuthor: string;

  // Analytics
  googleAnalyticsId: string;
  facebookPixelId: string;

  // Scripts
  headerScripts: string;
  footerScripts: string;
}
```

### 💾 **Storage**

- **localStorage**: `admin-settings`
- **Format**: JSON string
- **Auto-save**: Mỗi khi thay đổi
- **Fallback**: Default settings nếu không có

## API Endpoints

### 📤 **Upload Asset**

```
POST /api/admin/upload-asset
- FormData: file, type
- Types: logo, favicon, footerLogo
- Response: { success, url, filename, size, type }
```

### 💾 **Apply Settings**

```
POST /api/admin/apply-settings
- Body: AdminSettings JSON
- Updates: .env.local, CSS variables, meta tags
- Response: { success, message, timestamp }
```

### 📥 **Get Settings**

```
GET /api/admin/get-settings
- Response: { success, settings: AdminSettings }
- Fallback: Default settings nếu không có config
```

## Cách Sử Dụng

### 👨‍💼 **Cho Admin**

1. **Truy cập**: Admin Panel → Settings
2. **Xem Overview**: Tab "Overview" để xem tổng quan
3. **Cấu hình**: Tab "Settings" để chỉnh sửa
4. **Upload logo**: Drag & drop hoặc click browse
5. **Nhập URL**: Hoặc nhập URL trực tiếp
6. **Apply**: Click "Apply Settings" để lưu

### 👥 **Cho Users**

- **Tự động thấy** logo mới ngay lập tức
- **Không cần** refresh trang
- **Trải nghiệm** mượt mà và chuyên nghiệp

## Lợi Ích

### 🎯 **Cho Admin**

- **Dễ dàng** thay đổi branding
- **Không cần** code
- **Real-time** preview
- **Centralized** management

### 🚀 **Cho Website**

- **Professional** appearance
- **Consistent** branding
- **SEO optimized** meta tags
- **Analytics** ready

### 💻 **Cho Developer**

- **Clean code** structure
- **Type-safe** interfaces
- **Modular** components
- **Easy** to extend

## Mở Rộng Tương Lai

### 🔮 **Tính Năng Sắp Tới**

- **Theme editor** với color picker
- **Font settings** cho typography
- **Social media** links
- **Contact information**
- **Multi-language** support
- **Backup/restore** settings

### 🛠️ **Technical Improvements**

- **Image optimization** tự động
- **CDN integration** cho assets
- **Version control** cho settings
- **Audit log** cho changes
