import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: "/private/", // standard safeguard
            },
            {
                userAgent: ["Google-Extended", "GPTBot", "CCBot", "Anthropic-AI"],
                allow: "/",
            }
        ],
        sitemap: "https://shelf.nu/sitemap.xml",
    };
}
