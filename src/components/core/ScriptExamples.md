# Custom Script Injection Examples

This document provides examples of how to use the custom script injection feature in the admin settings.

## Header Scripts Examples

### Google Analytics 4

```html
<!-- Google Analytics 4 -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX");
</script>
```

### Google Tag Manager

```html
<!-- Google Tag Manager -->
<script>
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s),
      dl = l != "dataLayer" ? "&l=" + l : "";
    j.async = true;
    j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, "script", "dataLayer", "GTM-XXXXXXX");
</script>
```

### Facebook Pixel

```html
<!-- Facebook Pixel Code -->
<script>
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js",
  );
  fbq("init", "YOUR_PIXEL_ID");
  fbq("track", "PageView");
</script>
```

### Custom Meta Tags

```html
<!-- Custom Meta Tags -->
<meta name="custom-meta" content="your-custom-value" />
<meta property="og:custom" content="custom-og-value" />
```

## Footer Scripts Examples

### Google Tag Manager (noscript)

```html
<!-- Google Tag Manager (noscript) -->
<noscript
  ><iframe
    src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
    height="0"
    width="0"
    style="display:none;visibility:hidden"
  ></iframe
></noscript>
```

### Chat Widget (Tidio)

```html
<!-- Tidio Chat Widget -->
<script src="//code.tidio.co/your-tidio-id.js" async></script>
```

### Custom JavaScript

```html
<!-- Custom JavaScript -->
<script>
  // Your custom JavaScript code here
  document.addEventListener("DOMContentLoaded", function () {
    console.log("Custom script loaded!");

    // Example: Add custom functionality
    const buttons = document.querySelectorAll(".custom-button");
    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        alert("Custom button clicked!");
      });
    });
  });
</script>
```

### Performance Tracking

```html
<!-- Performance Tracking -->
<script>
  // Track page load time
  window.addEventListener("load", function () {
    const loadTime =
      performance.timing.loadEventEnd - performance.timing.navigationStart;
    console.log("Page load time:", loadTime + "ms");

    // Send to analytics
    if (typeof gtag !== "undefined") {
      gtag("event", "page_load_time", {
        value: loadTime,
        event_category: "Performance",
      });
    }
  });
</script>
```

### Custom CSS Injection

```html
<!-- Custom CSS -->
<style>
  .custom-style {
    background-color: #f0f0f0;
    padding: 10px;
    border-radius: 5px;
  }

  .custom-button {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
  }
</style>
```

## Best Practices

### Security

- Only add scripts from trusted sources
- Review all scripts before adding them
- Test scripts in a development environment first
- Be cautious with third-party scripts

### Performance

- Use async/defer attributes for external scripts
- Minimize the number of scripts
- Consider script loading order
- Monitor performance impact

### Organization

- Use comments to document scripts
- Group related scripts together
- Keep scripts organized and readable
- Remove unused scripts

### Testing

- Test scripts in different browsers
- Verify scripts work on mobile devices
- Check for console errors
- Monitor script execution

## Common Use Cases

1. **Analytics**: Google Analytics, Facebook Pixel, custom tracking
2. **Chat Support**: Live chat widgets, customer support tools
3. **Marketing**: Conversion tracking, A/B testing, heatmaps
4. **Performance**: Speed monitoring, error tracking
5. **Customization**: Theme modifications, custom functionality
6. **Integration**: Third-party services, APIs, external tools

## Troubleshooting

### Scripts Not Loading

- Check browser console for errors
- Verify script syntax
- Ensure proper HTML structure
- Check for conflicts with existing scripts

### Performance Issues

- Monitor page load times
- Check for blocking scripts
- Optimize script loading
- Consider lazy loading

### Security Concerns

- Review all external scripts
- Check for malicious code
- Use Content Security Policy (CSP)
- Regular security audits
