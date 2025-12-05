const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Usage: node scripts/migrate-webflow.js <input-file.html> <output-type>
// Example: node scripts/migrate-webflow.js export.html blog

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Usage: node scripts/migrate-webflow.js <input-file> <output-type>');
    process.exit(1);
}

const [inputFile, outputType] = args;
const contentDir = path.join(process.cwd(), 'content', outputType);

if (!fs.existsSync(contentDir)) {
    console.error(`Error: Content directory '${outputType}' does not exist.`);
    process.exit(1);
}

try {
    const htmlContent = fs.readFileSync(inputFile, 'utf8');

    // Basic HTML to Markdown conversion (very simplified)
    // In a real scenario, use a library like 'turndown'
    let markdown = htmlContent
        .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
        .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
        .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
        .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
        .replace(/<ul>/g, '')
        .replace(/<\/ul>/g, '')
        .replace(/<li>(.*?)<\/li>/g, '- $1\n')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');

    // Extract potential title from H1
    const titleMatch = htmlContent.match(/<h1>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1] : 'Untitled';

    // Generate slug
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const frontmatter = {
        title: title,
        summary: "Imported from Webflow",
        slug: slug,
        ogImage: `/images/og/${slug}.png`,
        updated: new Date().toISOString().split('T')[0],
        schema: "Article",
        related: []
    };

    const fileContent = matter.stringify(markdown, frontmatter);
    const outputPath = path.join(contentDir, `${slug}.mdx`);

    fs.writeFileSync(outputPath, fileContent);
    console.log(`Successfully migrated to ${outputPath}`);

} catch (error) {
    console.error('Migration failed:', error);
}
