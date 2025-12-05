import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Frontmatter } from './content/schema';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export type ContentType = 'pages' | 'features' | 'case-studies' | 'blog' | 'concepts' | 'use-cases' | 'solutions' | 'industries' | 'alternatives' | 'glossary';

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

        canonicalUrl: data.canonicalUrl || `https://shelf.com/${type}/${realSlug}`,

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
