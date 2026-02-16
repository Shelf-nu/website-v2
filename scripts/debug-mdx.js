
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(process.cwd(), 'content');

function getContentBySlug(type, slug) {
    const realSlug = slug.replace(/\.mdx$/, '');
    const fullPath = path.join(CONTENT_DIR, type, `${realSlug}.mdx`);

    console.log(`Checking path: ${fullPath}`);

    if (!fs.existsSync(fullPath)) {
        console.error(`Content not found: ${type}/${slug}`);
        return null; // Return null instead of throwing for this test
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return { data, content };
}

console.log("Debugging Solution Page 404...");
try {
    const result = getContentBySlug("solutions", "asset-tracking");
    if (result) {
        console.log("SUCCESS: Content found and parsed.");
        console.log("Title:", result.data.title);
    } else {
        console.log("FAILURE: Content not found.");
    }
} catch (error) {
    console.error("ERROR:", error);
}
