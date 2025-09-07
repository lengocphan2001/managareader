// Example usage of Footer component with different variants

import Footer from "./Footer";

// Example 1: Default footer (for nettrom layout)
export function DefaultFooterExample() {
  return <Footer variant="default" />;
}

// Example 2: Minimal footer (for main layout)
export function MinimalFooterExample() {
  return <Footer variant="minimal" />;
}

// Example 3: Admin footer (for admin layout)
export function AdminFooterExample() {
  return <Footer variant="admin" />;
}

// Example 4: Custom footer with additional props
export function CustomFooterExample() {
  return (
    <Footer
      variant="default"
      className="mt-8"
      showSocialLinks={true}
      showNewsletter={false}
    />
  );
}

// Example 5: Footer without social links
export function FooterWithoutSocialExample() {
  return <Footer variant="default" showSocialLinks={false} />;
}
