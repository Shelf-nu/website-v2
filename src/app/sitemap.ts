import { MetadataRoute } from "next";
import { getContentSlugs } from "@/lib/mdx";

export const dynamic = "force-static";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shelf.nu";

export default function sitemap(): MetadataRoute.Sitemap {
    // 1. Static Routes
    const staticRoutes: MetadataRoute.Sitemap = [
        "",
        "/pricing",
        "/contact",
        "/migrate",
        "/features",
        "/solutions",
        "/case-studies",
        "/blog",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: route === "" ? 1.0 : 0.8,
    }));

    // 2. Dynamic Routes (Features)
    const features = getContentSlugs("features").map((file) => ({
        url: `${baseUrl}/features/${file.replace(".mdx", "")}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
    }));

    // 3. Dynamic Routes (Solutions)
    const solutions = getContentSlugs("solutions").map((file) => ({
        url: `${baseUrl}/solutions/${file.replace(".mdx", "")}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.9,
    }));

    // 4. Dynamic Routes (Blog)
    const blogPosts = getContentSlugs("blog").map((file) => ({
        url: `${baseUrl}/blog/${file.replace(".mdx", "")}`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
    }));

    // 5. Dynamic Routes (Case Studies)
    const caseStudies = getContentSlugs("case-studies").map((file) => ({
        url: `${baseUrl}/case-studies/${file.replace(".mdx", "")}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    return [...staticRoutes, ...features, ...solutions, ...blogPosts, ...caseStudies];
}
