import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Directory to scan
const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

function migrateFrontmatter() {
    if (!fs.existsSync(CONTENT_DIR)) {
        console.error(`Directory not found: ${CONTENT_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith('.mdx'));
    let updatedCount = 0;

    console.log(`Scanning ${files.length} files in ${CONTENT_DIR}...`);

    files.forEach(file => {
        const filePath = path.join(CONTENT_DIR, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        let hasChanges = false;

        // Check if 'seo' object is missing
        if (!data.seo) {
            console.log(`Migrating: ${file}`);
            data.seo = {
                title: data.title,
                description: data.description || '',
                keywords: data.keywords || [],
                noindex: false
            };
            hasChanges = true;
        }

        // Clean up root level description if moved to SEO (Optional, keeping for now for backward compat)
        // clean up other legacy fields if needed

        if (hasChanges) {
            const newContent = matter.stringify(content, data);
            fs.writeFileSync(filePath, newContent);
            updatedCount++;
        }
    });

    console.log(`Migration complete. Updated ${updatedCount} files.`);
}

migrateFrontmatter();
