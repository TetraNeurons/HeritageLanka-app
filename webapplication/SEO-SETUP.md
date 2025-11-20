# SEO Setup for Heritage Lanka

## Completed SEO Improvements

### 1. Meta Tags & Metadata
- ✅ Updated title and description in `app/layout.tsx`
- ✅ Added Open Graph tags for social media sharing
- ✅ Added Twitter Card metadata
- ✅ Added keywords relevant to Sri Lanka travel
- ✅ Added canonical URLs
- ✅ Configured robots meta tags

### 2. Technical SEO
- ✅ Created `robots.txt` in public folder
- ✅ Created dynamic `sitemap.ts` for search engines
- ✅ Created `manifest.ts` for PWA support
- ✅ Added structured data (JSON-LD) for Organization, Website, and Service
- ✅ Enabled compression in Next.js config
- ✅ Optimized image settings
- ✅ Removed X-Powered-By header

### 3. Structured Data (Schema.org)
- ✅ Organization schema
- ✅ Website schema with search action
- ✅ Service schema for tour guide services

## Required Actions

### 1. Environment Variables
Add to your `.env` file:
```
NEXT_PUBLIC_BASE_URL=https://heritagelanka.com
```

### 2. Google Search Console
1. Go to https://search.google.com/search-console
2. Add your property
3. Get verification code
4. Update `app/layout.tsx` line with verification code:
   ```typescript
   verification: {
     google: 'your-actual-verification-code-here',
   },
   ```

### 3. Create Image Assets
Create these images in the `public` folder:
- `favicon.ico` (32x32)
- `apple-touch-icon.png` (180x180)
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `og-image.jpg` (1200x630) - For social media sharing
- `logo.png` - Your logo

### 4. Update Domain
Replace `heritagelanka.com` with your actual domain in:
- `app/layout.tsx`
- `app/sitemap.ts`
- `public/robots.txt`
- `components/StructuredData.tsx`

### 5. Submit Sitemap
After deployment:
1. Go to Google Search Console
2. Submit sitemap: `https://yourdomain.com/sitemap.xml`

## SEO Best Practices Implemented

- **Mobile-friendly**: Responsive design
- **Fast loading**: Image optimization, compression enabled
- **Semantic HTML**: Proper heading hierarchy
- **Accessible**: Alt texts for images (add to your images)
- **HTTPS**: Ensure SSL certificate is installed
- **Clean URLs**: Next.js provides clean routing

## Monitoring & Analytics

Consider adding:
1. Google Analytics 4
2. Google Search Console monitoring
3. Bing Webmaster Tools

## Keywords Targeted

- Sri Lanka travel
- Local guides Sri Lanka
- Tour guides Sri Lanka
- Sri Lanka tourism
- Authentic travel experiences
- Verified guides
- Local tours Sri Lanka

## Next Steps for Better SEO

1. Create location-specific pages (Colombo, Kandy, Galle, etc.)
2. Add guide profiles with rich snippets
3. Create travel guides/resources section
4. Implement user reviews with schema markup
5. Add FAQ section with FAQ schema
6. Build backlinks from travel websites
7. Regular content updates
8. Monitor Core Web Vitals
