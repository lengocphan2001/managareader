# Footer Component

A reusable Footer component for the MangaApp with multiple variants and customization options.

## Features

- **Multiple Variants**: Default, minimal, and admin layouts
- **Responsive Design**: Works on all screen sizes
- **Customizable**: Optional social links and newsletter sections
- **TypeScript Support**: Fully typed with proper interfaces
- **Accessibility**: Proper semantic HTML and ARIA attributes

## Usage

### Basic Usage

```tsx
import Footer from '@/components/core/Footer';

// Default footer (for nettrom layout)
<Footer variant="default" />

// Minimal footer (for main layout)
<Footer variant="minimal" />

// Admin footer (for admin layout)
<Footer variant="admin" />
```

### Advanced Usage

```tsx
import Footer from "@/components/core/Footer";

// Custom footer with additional props
<Footer
  variant="default"
  className="mt-8"
  showSocialLinks={true}
  showNewsletter={false}
/>;
```

## Props

| Prop              | Type                                | Default     | Description                        |
| ----------------- | ----------------------------------- | ----------- | ---------------------------------- |
| `variant`         | `"default" \| "minimal" \| "admin"` | `"default"` | Footer variant to display          |
| `className`       | `string`                            | `""`        | Additional CSS classes             |
| `showSocialLinks` | `boolean`                           | `true`      | Whether to show social media links |
| `showNewsletter`  | `boolean`                           | `false`     | Whether to show newsletter signup  |

## Variants

### Default Variant

- Full footer with logo, links, and social media
- Used in nettrom layout
- Includes quick links, account links, support links, and about section

### Minimal Variant

- Simple footer with just copyright
- Used in main layout
- Clean and minimal design

### Admin Variant

- Admin-specific footer with admin panel branding
- Used in admin layout
- Includes back to site link and admin-specific styling

## Styling

The component uses Tailwind CSS classes and can be customized with additional classes via the `className` prop.

### CSS Classes Used

- `footer`: Main footer container
- `container`: Content container
- `row`/`col-*`: Bootstrap grid system
- `text-*`: Text color utilities
- `hover:*`: Hover state utilities
- `transition-*`: Animation utilities

## Integration

The Footer component is already integrated into all main layouts:

- **Nettrom Layout**: Uses `variant="default"`
- **Main Layout**: Uses `variant="minimal"`
- **Admin Layout**: Uses `variant="admin"`

## Constants Used

The component uses the following constants from `@/constants`:

- `Constants.APP_NAME`: Application name
- `Constants.APP_VERSION`: Application version
- `Constants.Routes.*`: Various route URLs
- `Constants.Routes.github`: GitHub repository URL
- `Constants.Routes.report`: Report issue URL
- `Constants.Routes.hako`: Hako URL

## Accessibility

- Uses semantic HTML elements (`<footer>`, `<nav>`, `<ul>`, `<li>`)
- Proper link attributes (`rel="noopener noreferrer"` for external links)
- Alt text for images
- Proper heading hierarchy
- Screen reader friendly structure

## Future Enhancements

- Newsletter signup functionality
- More social media links
- Language switcher
- Theme toggle
- Cookie consent banner
- Legal links (Privacy Policy, Terms of Service)
