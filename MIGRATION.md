# Webflow to MDX Migration Guide

This guide outlines the process for migrating content from Webflow to our Next.js + MDX platform.

## Prerequisites

- Node.js installed
- Access to Webflow project exports

## Automated Migration

We have provided a utility script to help with basic migration.

1. **Export HTML**: Export your content from Webflow as HTML.
2. **Run Script**:
   ```bash
   node scripts/migrate-webflow.js <path-to-html-file> <content-type>
   ```
   Example:
   ```bash
   node scripts/migrate-webflow.js ./exports/my-post.html blog
   ```
3. **Review**: The script will generate a `.mdx` file in the specified content directory. Open it and review the formatting.

## Manual Cleanup

The automated script handles basic structure, but you may need to manually clean up:

- **Images**: Download images from Webflow and place them in `public/images`. Update image paths in the MDX file.
- **Components**: Replace standard HTML elements with our custom React components where appropriate (e.g., `<Callout>`, `<Button>`).
- **Metadata**: Update the frontmatter `summary`, `ogImage`, and `related` fields.

## Content Types

- **Blog**: `/content/blog`
- **Case Studies**: `/content/case-studies`
- **Features**: `/content/features`
- **Concepts**: `/content/concepts`
