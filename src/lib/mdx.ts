import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Frontmatter } from './content/schema';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const WORDS_PER_MINUTE = 200;

function calculateReadingTime(content: string): string {
    // Strip MDX/markdown syntax for a more accurate word count
    const plainText = content
        .replace(/```[\s\S]*?```/g, '') // code blocks
        .replace(/`[^`]*`/g, '')        // inline code
        .replace(/!\[.*?\]\(.*?\)/g, '') // images
        .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // links → text
        .replace(/#{1,6}\s/g, '')       // headings
        .replace(/[*_~]+/g, '')         // bold/italic/strikethrough
        .replace(/---/g, '')            // horizontal rules
        .replace(/\n+/g, ' ')
        .trim();
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
    return `${minutes} min`;
}

export type ContentType = 'pages' | 'features' | 'case-studies' | 'blog' | 'concepts' | 'use-cases' | 'solutions' | 'industries' | 'alternatives' | 'glossary' | 'updates' | 'knowledge-base';

export interface MDXContent {
    slug: string;
    frontmatter: Frontmatter;
    content: string;
}

export function getContentSlugs(type: ContentType) {
    const dir = path.join(CONTENT_DIR, type);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((file) => file.endsWith('.mdx'));
}

export function getContentBySlug(type: ContentType, slug: string): MDXContent {
    const realSlug = slug.replace(/\.mdx$/, '');
    const fullPath = path.join(CONTENT_DIR, type, `${realSlug}.mdx`);

    if (!fs.existsSync(fullPath)) {
        throw new Error(`Content not found: ${type}/${slug}`);
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Defaulting and Validation Logic
    const frontmatter: Frontmatter = {
        title: data.title || 'Untitled',
        slug: realSlug,
        description: data.description || data.summary || '',

        layout: data.layout || type.replace(/s$/, ''), // Simple heuristic: features -> feature

        canonicalUrl: data.canonicalUrl || `https://www.shelf.nu/${type}/${realSlug}`,

        seo: data.seo || {
            title: data.title || 'Shelf',
            description: data.description || data.summary || '',
        },

        stage: data.stage || "TOFU",
        intent: data.intent || "informational",

        cluster: data.cluster || {
            name: type,
            role: "supporting"
        },

        date: data.date || data.updated,

        ...data,
    } as Frontmatter;

    // Auto-calculate reading time for blog posts if not explicitly set
    if (type === 'blog' && !data.readingTime) {
        frontmatter.readingTime = calculateReadingTime(content);
    }

    return {
        slug: realSlug,
        frontmatter,
        content,
    };
}

export function getAllContent(type: ContentType): MDXContent[] {
    const slugs = getContentSlugs(type);
    const content = slugs
        .map((slug) => getContentBySlug(type, slug))
        // Sort posts by date in descending order if date is present
        .sort((post1, post2) => (post1.frontmatter.date && post2.frontmatter.date && post1.frontmatter.date > post2.frontmatter.date ? -1 : 1));
    return content;
}
