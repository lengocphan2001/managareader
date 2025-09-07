# Admin Logo Control Feature

## Overview

The admin panel now allows administrators to control the logo that appears throughout the client interface, including the header and footer.

## Features

### 🎯 **Centralized Logo Control**

- **Single source of truth** - Admin sets logo once, appears everywhere
- **Real-time updates** - Logo changes immediately across all pages
- **Fallback support** - Uses default logo if no admin logo is set

### 📍 **Logo Locations**

- **Header Logo** - Main navigation logo in the client interface
- **Footer Logo** - Footer logo in all page variants (default, minimal, admin)

### 🔄 **Real-time Updates**

- **Storage listener** - Automatically updates when admin changes logo
- **No page refresh needed** - Changes appear instantly
- **Cross-tab sync** - Updates in all open browser tabs

## How It Works

### Admin Side:

1. Go to **Admin Panel** → **Settings** → **Appearance**
2. Upload or enter URL for logo in the **Logo** section
3. Click **"Apply Settings"** to save
4. Logo immediately appears in client interface

### Client Side:

- **Header**: `src/components/nettrom/layout/header.tsx`
- **Footer**: `src/components/core/Footer.tsx`
- Both components read from `localStorage.getItem("admin-settings")`
- Listen for storage changes to update in real-time

## Technical Implementation

### Storage Structure:

```json
{
  "logoUrl": "/uploads/logo-1234567890.png",
  "faviconUrl": "/uploads/favicon-1234567890.ico"
  // ... other settings
}
```

### Component Logic:

```tsx
// Get admin logo from localStorage
const [adminLogoUrl, setAdminLogoUrl] = useState("");

useEffect(() => {
  const loadAdminLogo = () => {
    const savedSettings = localStorage.getItem("admin-settings");
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setAdminLogoUrl(parsed.logoUrl || "");
    }
  };

  loadAdminLogo();

  // Listen for real-time updates
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "admin-settings") {
      loadAdminLogo();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);

// Use admin logo with fallback
<img src={adminLogoUrl || "/images/logo.png"} alt="Logo" />;
```

## Benefits

### For Administrators:

- **Easy branding** - Upload logo once, appears everywhere
- **Consistent branding** - Same logo across all pages
- **Quick updates** - Change logo without code changes

### For Users:

- **Consistent experience** - Same logo in header and footer
- **Real-time updates** - See changes immediately
- **Professional appearance** - Custom branding throughout

### For Developers:

- **Centralized control** - Single place to manage logos
- **Automatic updates** - No manual code changes needed
- **Fallback support** - Graceful degradation if no admin logo

## File Structure

```
src/
├── components/
│   ├── admin/
│   │   ├── SiteSettings.tsx          # Admin logo upload interface
│   │   └── DragDropUpload.tsx        # Upload component
│   ├── core/
│   │   └── Footer.tsx                # Footer with admin logo
│   └── nettrom/
│       └── layout/
│           └── header.tsx            # Header with admin logo
└── app/
    └── api/
        └── admin/
            └── upload-asset/
                └── route.ts          # Logo upload API
```

## Usage Examples

### Default Logo (Fallback):

```tsx
<img src="/images/logo.png" alt="Logo" />
```

### Admin Logo:

```tsx
<img src="/uploads/logo-1234567890.png" alt="Logo" />
```

### Dynamic Logo (Admin + Fallback):

```tsx
<img src={adminLogoUrl || "/images/logo.png"} alt="Logo" />
```

## Security & Performance

- **File validation** - Only allowed image types
- **Size limits** - Prevents oversized uploads
- **Unique filenames** - Prevents conflicts
- **Public access** - Files stored in `public/uploads/`
- **Caching** - Browser caches uploaded images
- **Error handling** - Graceful fallback to default logo
