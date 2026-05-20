import { MetadataRoute } from "next";

export const dynamic = "force-static";

// AI crawler allowlist — kept in sync with public/robots.txt. The static
// public/robots.txt takes precedence in Next.js when both files exist, so
// changes here must also be mirrored there.
const AI_CRAWLERS = [
    "Google-Extended",
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-Web",
    "anthropic-ai",
    "Anthropic-AI",
    "PerplexityBot",
    "Perplexity-User",
    "Applebot-Extended",
    "Amazonbot",
    "CCBot",
    "cohere-ai",
    "DuckAssistBot",
    "Meta-ExternalAgent",
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: "/private/",
            },
            {
                userAgent: AI_CRAWLERS,
                allow: "/",
            },
        ],
        sitemap: "https://www.shelf.nu/sitemap.xml",
    };
}
