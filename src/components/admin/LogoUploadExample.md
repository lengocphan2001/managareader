# Logo Upload Feature

## Overview

The admin panel now includes an enhanced logo upload feature that allows administrators to easily upload and manage their site's logo and favicon.

## Features

### 🎨 **Drag & Drop Upload**

- **Drag and drop** files directly onto the upload area
- **Click to browse** files from your computer
- **Visual feedback** with hover states and drag indicators

### 📁 **File Support**

- **Logo**: PNG, JPG, SVG, WebP (max 5MB)
- **Favicon**: ICO, PNG, SVG (max 1MB)
- **Recommended sizes**: Logo 200x60px, Favicon 32x32px

### 🔗 **URL Support**

- Enter **direct URLs** for logos/favicons
- Support for both **relative paths** (`/logo.png`) and **absolute URLs** (`https://example.com/logo.png`)

### 🖼️ **Preview & Management**

- **Live preview** of uploaded images
- **Remove button** to clear current logo/favicon
- **Preview button** to open image in new tab
- **Progress bar** during upload

### ✅ **Validation**

- **File type validation** - only allowed formats
- **File size validation** - prevents oversized uploads
- **Error messages** for invalid files

## Usage

### For Administrators:

1. Go to **Admin Panel** → **Settings** → **Appearance**
2. **Logo Section**:
   - Enter a URL directly, OR
   - Drag and drop a logo file, OR
   - Click the upload area to browse files
3. **Favicon Section**:
   - Same process as logo
4. Click **"Apply Settings"** to save changes

### For Developers:

```tsx
// The DragDropUpload component can be reused
<DragDropUpload
  onFileSelect={(file) => handleFileUpload(file, "logo")}
  accept="image/png,image/jpeg,image/svg+xml,image/webp"
  maxSize={5 * 1024 * 1024} // 5MB
  disabled={uploading === "logo"}
  currentFile={settings.logoUrl}
  onRemove={() => updateSetting("logoUrl", "")}
  type="logo"
/>
```

## Technical Details

### Upload Process:

1. **File validation** (type, size)
2. **Progress tracking** with visual feedback
3. **API upload** to `/api/admin/upload-asset`
4. **File storage** in `public/uploads/` directory
5. **URL generation** for public access
6. **Settings update** in admin context

### File Storage:

- Files are stored in `public/uploads/`
- Filenames include timestamp: `logo-1234567890.png`
- Public URLs: `/uploads/logo-1234567890.png`

### Error Handling:

- **File type errors**: Clear error messages
- **Size limit errors**: Shows max allowed size
- **Upload failures**: Graceful error handling
- **Network issues**: Retry mechanisms

## Security Features

- **File type validation** on both client and server
- **File size limits** to prevent abuse
- **Unique filenames** to prevent conflicts
- **Server-side validation** for all uploads

## Browser Support

- **Modern browsers**: Full drag & drop support
- **Older browsers**: Fallback to click-to-browse
- **Mobile devices**: Touch-friendly interface
- **Accessibility**: Keyboard navigation support
