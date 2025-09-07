# Khắc phục lỗi Production

## Các lỗi đã được khắc phục:

### 1. Lỗi 401 Unauthorized - `/api/user` endpoint

**Vấn đề:** Frontend gọi `/api/user` nhưng nhận được 401 Unauthorized.

**Nguyên nhân:**

- Backend URL không đúng trong production
- `getBackendUrl()` trả về domain không có `/api` path

**Giải pháp:**

- Sửa `src/utils/url.ts` để trả về đúng URL với `/api` path
- Đảm bảo backend server chạy và accessible

**Code đã sửa:**

```typescript
getBackendUrl() {
  if (typeof window !== "undefined") {
    if (window.location.hostname !== "localhost") {
      // In production, use the same domain with /api path
      return `${window.location.protocol}//${window.location.hostname}/api`;
    }
  }
  // For localhost development, use backend server with /api
  return (
    Constants.BACKEND_URL || "http://localhost:8000/api"
  );
}
```

### 2. Lỗi Favicon Manifest

**Vấn đề:** Manifest sử dụng `/favicon.ico` cho tất cả kích thước, gây lỗi "Resource size is not correct".

**Nguyên nhân:**

- Favicon.ico không có kích thước 192x192 và 512x512
- Manifest yêu cầu các kích thước cụ thể

**Giải pháp:**

- Sử dụng `/favicon.ico` cho kích thước nhỏ (16x16, 32x32, 48x48)
- Sử dụng `/logo.png` cho kích thước lớn (192x192, 512x512)

**Code đã sửa:**

```typescript
icons: [
  {
    src: "/favicon.ico",
    sizes: "16x16 32x32 48x48",
    type: "image/x-icon",
  },
  {
    src: "/logo.png",
    sizes: "192x192",
    type: "image/png",
  },
  {
    src: "/logo.png",
    sizes: "512x512",
    type: "image/png",
  },
],
```

### 3. Lỗi DOM removeChild

**Vấn đề:** `TypeError: Cannot read properties of null (reading 'removeChild')` trong FaviconUpdater.

**Nguyên nhân:**

- Code cố gắng remove element đã bị remove
- Race condition trong DOM manipulation

**Giải pháp:**

- Thêm try-catch để handle lỗi
- Kiểm tra element tồn tại trước khi remove

**Code đã sửa:**

```typescript
setTimeout(() => {
  try {
    if (tempLink && tempLink.parentNode) {
      tempLink.parentNode.removeChild(tempLink);
    }
  } catch (error) {
    // Element might already be removed, ignore error
    console.debug("Temporary favicon link already removed");
  }
}, 100);
```

## Các bước kiểm tra sau khi deploy:

1. **Kiểm tra Backend API:**

   ```bash
   curl https://nettruyen-vn.com/api/user
   # Should return 401 (expected for unauthenticated requests)
   ```

2. **Kiểm tra Authentication:**
   - Đăng nhập và kiểm tra token được lưu trong localStorage
   - Kiểm tra Authorization header được gửi đúng

3. **Kiểm tra Favicon:**
   - Kiểm tra `/favicon.ico` và `/logo.png` tồn tại
   - Kiểm tra manifest.json không có lỗi

4. **Kiểm tra Console:**
   - Không còn lỗi 401 Unauthorized
   - Không còn lỗi favicon manifest
   - Không còn lỗi removeChild

## Lưu ý quan trọng:

- Backend server phải chạy và accessible từ frontend
- CORS phải được cấu hình đúng
- JWT_SECRET phải giống nhau giữa frontend và backend
- File favicon và logo phải tồn tại trong public folder
