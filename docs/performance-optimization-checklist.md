# Performance Optimization Checklist
## Story 101.1 - Task 1.2

**Goal:** Achieve PageSpeed score ≥85 on all marketing pages

---

## 📊 **Pages to Optimize:**

1. `/` (Homepage)
2. `/drivers` (For Drivers landing page)
3. `/about` (About Us)
4. `/faq` (FAQ page)

---

## ✅ **Optimization Tasks:**

### **1. Image Optimization**
- [ ] Convert all images to WebP format
- [ ] Add `loading="lazy"` to all images below the fold
- [ ] Use Next.js `Image` component for automatic optimization
- [ ] Compress images (target: <200KB per image)
- [ ] Add proper `width` and `height` attributes to prevent layout shift

### **2. Code Splitting**
- [ ] Verify Next.js automatic code splitting is working
- [ ] Use dynamic imports for heavy components
- [ ] Lazy load accordion content on FAQ page
- [ ] Defer non-critical JavaScript

### **3. Font Optimization**
- [ ] Use `next/font` for Google Fonts optimization
- [ ] Preload critical fonts
- [ ] Use `font-display: swap` to prevent FOIT (Flash of Invisible Text)

### **4. CSS Optimization**
- [ ] Remove unused Tailwind CSS classes (purge)
- [ ] Minimize CSS bundle size
- [ ] Inline critical CSS

### **5. JavaScript Optimization**
- [ ] Remove console.log statements
- [ ] Minimize JavaScript bundle
- [ ] Enable compression (gzip/brotli)

### **6. Caching & CDN**
- [ ] Configure proper cache headers
- [ ] Use CDN for static assets (if deploying)
- [ ] Enable Next.js static optimization

### **7. Performance Monitoring**
- [ ] Run Lighthouse audit on all pages
- [ ] Check Core Web Vitals:
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
- [ ] Verify PageSpeed score ≥85

---

## 🚀 **Quick Wins (Immediate Impact):**

### **1. Add next.config.js optimizations:**

```javascript
// apps/user-portal/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  swcMinify: true,
  reactStrictMode: true,
};

module.exports = nextConfig;
```

### **2. Optimize fonts in layout:**

```tsx
// apps/user-portal/src/app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### **3. Add lazy loading to images:**

```tsx
// Example: Update drivers.tsx
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Cabi Driver"
  width={1200}
  height={600}
  priority={false} // Only set to true for above-the-fold images
  loading="lazy"
  placeholder="blur"
/>
```

---

## 📈 **Expected Results:**

| Metric | Before | Target | Status |
|--------|--------|--------|--------|
| **PageSpeed (Mobile)** | TBD | ≥85 | ⏳ |
| **PageSpeed (Desktop)** | TBD | ≥85 | ⏳ |
| **LCP** | TBD | <2.5s | ⏳ |
| **FID** | TBD | <100ms | ⏳ |
| **CLS** | TBD | <0.1 | ⏳ |

---

## 🔧 **Tools to Use:**

1. **Lighthouse** (Chrome DevTools)
   - Run: `npm run build` then `npm run start`
   - Open Chrome DevTools → Lighthouse → Run audit

2. **PageSpeed Insights**
   - URL: https://pagespeed.web.dev/
   - Test each page after deployment

3. **Next.js Bundle Analyzer**
   ```bash
   npm install @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

---

## ✅ **Completion Criteria:**

- [ ] All 4 pages achieve PageSpeed ≥85 (mobile and desktop)
- [ ] No console errors or warnings
- [ ] Images are optimized and lazy-loaded
- [ ] Fonts are optimized with next/font
- [ ] Core Web Vitals are in "Good" range
- [ ] Build size is reasonable (<500KB initial JS)

---

**Estimated Time:** 2 hours  
**Priority:** HIGH (blocks story-101.1 completion)  
**Assignee:** Frontend Developer
