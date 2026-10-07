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

/**
 * 58 bodies open with "# <title>", which every layout already shows as the
 * page's h1, so those pages said their title twice in a row. Drop that line
 * when it repeats the title exactly; an opening heading worded differently
 * (often carrying an extra search term) stays.
 */
function stripRepeatedTitle(content: string, title: string): string {
    const match = content.match(/^\s*#[ \t]+(.+?)[ \t]*\r?\n/);
    if (!match || match[1].trim().toLowerCase() !== title.trim().toLowerCase()) return content;
    return content.slice(match[0].length);
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
    const { data, content: raw } = matter(fileContents);
    const content = stripRepeatedTitle(raw, data.title || '');

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

/** An MDX entry without its body — everything an index/listing page needs. */
export type ContentMeta = Omit<MDXContent, "content">;

/**
 * Like getAllContent, but drops the MDX body.
 *
 * Use this for any listing that hands entries to a *client* component. Next
 * serializes every prop crossing the client boundary into the RSC flight
 * payload, so passing full MDXContent embeds every article body into the HTML
 * — /blog was 864 KB (80% of it inline flight data) before this existed, and
 * that payload is prefetched from the footer link on every page.
 *
 * Server components are unaffected (their props are never serialized), so
 * getAllContent is still correct there.
 */
export function getAllContentMeta(type: ContentType): ContentMeta[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return getAllContent(type).map(({ content, ...meta }) => meta);
}
