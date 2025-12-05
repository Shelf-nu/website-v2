# Shelf Website Maintenance Guide

This guide explains how to maintain and update the Shelf marketing website.

## 1. Creating New Content

All content lives in the `/content` directory as MDX files.

### Creating a new Blog Post
1. Create a new file in `/content/blog/my-new-post.mdx`.
2. Add the required frontmatter:
   ```yaml
   ---
   title: "My New Post"
   summary: "A short summary for the card."
   slug: "my-new-post"
   ogImage: "/images/og/default.png"
   updated: "2024-01-01"
   schema: "BlogPost"
   related: []
   ---
   ```
3. Write your content using Markdown/MDX.

### Creating a new Feature Page
1. Create a new file in `/content/features/my-feature.mdx`.
2. Add frontmatter (same as above, but schema is `Feature`).

## 2. Editing Homepage Components

The homepage is composed of sections located in `/src/components/sections`.

- **Hero**: `/src/components/sections/hero.tsx` - Edit the main headline and CTA buttons.
- **Features**: `/src/components/sections/features.tsx` - Update the feature list array.
- **Logos**: `/src/components/sections/logos.tsx` - Add/remove client logos.
- **Testimonials**: `/src/components/sections/testimonials.tsx` - Update quotes.

## 3. Adding Schema Metadata

We use standard JSON-LD schema.
- For **Pages**, metadata is handled in `layout.tsx` or individual `page.tsx` files using Next.js Metadata API.
- For **MDX Content**, we pass a `schema` field in frontmatter, which can be used to generate specific JSON-LD structures (future enhancement).

## 4. Deployment

The site is designed to be deployed on Vercel.

1. Push your changes to the `main` branch.
2. Vercel will automatically detect the Next.js project and build it.
3. No special configuration is required.

### Build Command
```bash
npm run build
```

### Local Development
```bash
npm run dev
```
