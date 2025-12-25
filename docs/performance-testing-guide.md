# 🚀 Performance Testing Guide - Story 101.1

## Objective
Achieve Google PageSpeed score ≥85 on all marketing pages to complete Story 101.1 at 100%.

---

## 📋 **Pages to Test:**

1. **Homepage** - http://localhost:3000/
2. **About Us** - http://localhost:3000/about
3. **For Drivers** - http://localhost:3000/drivers
4. **FAQ** - http://localhost:3000/faq
5. **Registration** - http://localhost:3000/drivers/register

---

## 🔍 **How to Test:**

### **Method 1: Google PageSpeed Insights** (Recommended)

**Steps:**
1. Go to: https://pagespeed.web.dev/
2. Enter URL: `http://localhost:3000/` (or use deployed URL)
3. Click "Analyze"
4. Wait for results
5. Check scores for:
   - Performance
   - Accessibility
   - Best Practices
   - SEO

**Note:** PageSpeed Insights requires a **publicly accessible URL**. For localhost testing, you'll need to:
- Deploy to Vercel/Netlify (temporary), OR
- Use Lighthouse in Chrome DevTools (Method 2)

---

### **Method 2: Lighthouse in Chrome DevTools** ✅ **USE THIS FOR LOCALHOST**

**Steps:**
1. Open Chrome browser
2. Navigate to: http://localhost:3000/
3. Press **F12** to open DevTools
4. Click **"Lighthouse"** tab
5. Select:
   - ✅ Performance
   - ✅ Accessibility
   - ✅ Best Practices
   - ✅ SEO
6. Device: **Mobile** (test mobile first)
7. Click **"Analyze page load"**
8. Wait for report
9. Review scores

**Repeat for Desktop:**
- Change device to "Desktop"
- Run analysis again

---

## 🎯 **Target Scores:**

### **Minimum (Story Requirement):**
- Performance: ≥85
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥90

### **Ideal (Professional Standard):**
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥95

---

## 📊 **Expected Results:**

### **Current Optimizations Already in Place:**

✅ **Next.js Optimizations:**
- Server-side rendering (SSR)
- Static site generation (SSG)
- Automatic code splitting
- Image optimization
- Font optimization (Inter font)

✅ **Performance Features:**
- Lazy loading images
- Optimized bundle size
- Tree shaking
- Minification
- Compression

✅ **Best Practices:**
- HTTPS ready
- No console errors
- Proper meta tags
- Semantic HTML
- Accessible markup

✅ **SEO:**
- Title tags
- Meta descriptions
- Heading hierarchy
- Alt text on images
- Sitemap ready

---

## 🔧 **If Scores Are Low:**

### **Performance < 85:**

**Quick Fixes:**
1. **Optimize Images:**
   ```bash
   # Check image sizes
   # Compress large images
   # Use WebP format
   ```

2. **Remove Unused CSS:**
   ```bash
   # Purge unused Tailwind classes
   npm run build
   ```

3. **Enable Compression:**
   ```javascript
   // In next.config.js
   compress: true
   ```

4. **Lazy Load Components:**
   ```typescript
   import dynamic from 'next/dynamic';
   const HeavyComponent = dynamic(() => import('./Heavy'));
   ```

---

### **Accessibility < 90:**

**Quick Fixes:**
1. **Add ARIA labels:**
   ```html
   <button aria-label="Close menu">×</button>
   ```

2. **Improve contrast:**
   ```css
   /* Ensure text has sufficient contrast */
   color: #1a1a1a; /* Dark enough on white */
   ```

3. **Add alt text:**
   ```html
   <img src="..." alt="Descriptive text" />
   ```

---

### **Best Practices < 90:**

**Quick Fixes:**
1. **Fix console errors**
2. **Use HTTPS** (in production)
3. **Add CSP headers**
4. **Remove deprecated APIs**

---

### **SEO < 90:**

**Quick Fixes:**
1. **Add meta descriptions:**
   ```html
   <meta name="description" content="..." />
   ```

2. **Improve heading structure:**
   ```html
   <h1>Main title</h1>
   <h2>Section</h2>
   <h3>Subsection</h3>
   ```

3. **Add structured data:**
   ```json
   {
     "@context": "https://schema.org",
     "@type": "Organization",
     "name": "CABI"
   }
   ```

---

## 📝 **Testing Checklist:**

### **Homepage (/):**
- [ ] Run Lighthouse (Mobile)
- [ ] Run Lighthouse (Desktop)
- [ ] Performance ≥85
- [ ] Accessibility ≥90
- [ ] Best Practices ≥90
- [ ] SEO ≥90
- [ ] Screenshot results
- [ ] Note any issues

### **About Us (/about):**
- [ ] Run Lighthouse (Mobile)
- [ ] Run Lighthouse (Desktop)
- [ ] Performance ≥85
- [ ] Accessibility ≥90
- [ ] Best Practices ≥90
- [ ] SEO ≥90
- [ ] Screenshot results
- [ ] Note any issues

### **For Drivers (/drivers):**
- [ ] Run Lighthouse (Mobile)
- [ ] Run Lighthouse (Desktop)
- [ ] Performance ≥85
- [ ] Accessibility ≥90
- [ ] Best Practices ≥90
- [ ] SEO ≥90
- [ ] Screenshot results
- [ ] Note any issues

### **FAQ (/faq):**
- [ ] Run Lighthouse (Mobile)
- [ ] Run Lighthouse (Desktop)
- [ ] Performance ≥85
- [ ] Accessibility ≥90
- [ ] Best Practices ≥90
- [ ] SEO ≥90
- [ ] Screenshot results
- [ ] Note any issues

### **Registration (/drivers/register):**
- [ ] Run Lighthouse (Mobile)
- [ ] Run Lighthouse (Desktop)
- [ ] Performance ≥85
- [ ] Accessibility ≥90
- [ ] Best Practices ≥90
- [ ] SEO ≥90
- [ ] Screenshot results
- [ ] Note any issues

---

## 📊 **Results Template:**

```markdown
## Performance Test Results

**Date:** 2025-12-12
**Tool:** Lighthouse (Chrome DevTools)

### Homepage (/)
**Mobile:**
- Performance: __/100
- Accessibility: __/100
- Best Practices: __/100
- SEO: __/100

**Desktop:**
- Performance: __/100
- Accessibility: __/100
- Best Practices: __/100
- SEO: __/100

### About Us (/about)
**Mobile:**
- Performance: __/100
- Accessibility: __/100
- Best Practices: __/100
- SEO: __/100

**Desktop:**
- Performance: __/100
- Accessibility: __/100
- Best Practices: __/100
- SEO: __/100

[Continue for all pages...]

### Summary:
- ✅ All pages meet ≥85 performance target
- ✅ Story 101.1 acceptance criteria met
- ✅ Ready for production
```

---

## 🎯 **Success Criteria:**

**Story 101.1 is 100% COMPLETE when:**
- ✅ All pages score ≥85 on Performance
- ✅ All pages score ≥90 on Accessibility
- ✅ All pages score ≥90 on Best Practices
- ✅ All pages score ≥90 on SEO
- ✅ Results documented
- ✅ Any issues fixed

---

## 🚀 **Quick Start:**

**Right now, do this:**

1. **Open Chrome**
2. **Navigate to:** http://localhost:3000/
3. **Press F12**
4. **Click "Lighthouse" tab**
5. **Select all categories**
6. **Choose "Mobile"**
7. **Click "Analyze page load"**
8. **Wait for results**
9. **Check if Performance ≥85**

**If ≥85:** ✅ Move to next page  
**If <85:** 🔧 Apply optimizations above

---

## 📸 **Screenshot Locations:**

Save Lighthouse reports to:
```
docs/performance-reports/
├── homepage-mobile.png
├── homepage-desktop.png
├── about-mobile.png
├── about-desktop.png
├── drivers-mobile.png
├── drivers-desktop.png
├── faq-mobile.png
├── faq-desktop.png
└── register-mobile.png
```

---

## ⏱️ **Estimated Time:**

- **Per page:** 5-10 minutes
- **Total (5 pages):** 30-50 minutes
- **Optimizations (if needed):** 30-60 minutes
- **Total:** 1-2 hours max

---

## 🎉 **When Complete:**

1. ✅ Document all scores
2. ✅ Save screenshots
3. ✅ Update Story 101.1 status to 100% COMPLETE
4. ✅ Celebrate! 🎊
5. ✅ Move to next story or demo

---

## 💡 **Pro Tips:**

1. **Test in Incognito** - No extensions interfering
2. **Clear cache** - Fresh load every time
3. **Test mobile first** - Usually lower scores
4. **Document everything** - Screenshots + notes
5. **Fix critical issues first** - Focus on Performance

---

## 🔗 **Useful Links:**

- **PageSpeed Insights:** https://pagespeed.web.dev/
- **Lighthouse Docs:** https://developer.chrome.com/docs/lighthouse/
- **Next.js Performance:** https://nextjs.org/docs/advanced-features/measuring-performance
- **Web Vitals:** https://web.dev/vitals/

---

**Ready to test? Let's achieve that ≥85 score!** 🚀

---

*Performance Testing Guide by Sarah (Product Owner)*  
*BMAD™ Core - Quality Assurance*  
*Date: 2025-12-12*
