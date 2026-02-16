"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Frontmatter } from "@/lib/content/schema";

interface BlogPost {
    slug: string;
    frontmatter: Frontmatter;
    content: string;
}

interface BlogFeedProps {
    allPosts: BlogPost[];
}

export function BlogFeed({ allPosts }: BlogFeedProps) {
    // Simplified logic - no filtering for now as requested
    const posts = allPosts;
    const featuredPost = posts[0];
    const remainingPosts = posts.slice(1);

    return (
        <div className="flex min-h-screen flex-col relative">
            <Container className="pt-32 pb-16 md:pt-48 md:pb-24">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-12 mb-20 border-b border-border/50 pb-16">
                    <div className="max-w-xl">
                        <Badge variant="outline" className="mb-6 px-3 py-1 text-sm font-medium text-orange-600 bg-orange-50 border-orange-100">
                            The Shelf Blog
                        </Badge>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
                            Insights for <br className="hidden md:block" />
                            <span className="text-orange-600">modern teams.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed text-balance">
                            Updates from the team, deep dives into asset management, and engineering stories.
                        </p>
                    </div>

                    <div className="relative w-full md:w-[550px] aspect-[4/3] md:aspect-square flex-shrink-0">
                        <Image
                            src="https://store.shelf.nu/images/collection-cover-image-optimized.png"
                            alt="Shelf Blog Collection"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Featured Post */}
                {featuredPost && (
                    <ScrollReveal width="100%" delay={0.1}>
                        <Link href={`/blog/${featuredPost.slug}`} className="group block mb-16 md:mb-24">
                            <article className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center bg-card/40 hover:bg-card/60 border border-border/40 rounded-3xl p-4 md:p-8 transition-colors duration-300">
                                {/* Image Placeholder */}
                                <div className="aspect-[16/9] lg:aspect-[4/3] w-full relative rounded-2xl overflow-hidden bg-muted border border-border/50">
                                    <Image
                                        src={featuredPost.frontmatter.image || "https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/67aa1ba2c258695b6bd94483_Printmaking_Studio.original.jpg"}
                                        alt={featuredPost.frontmatter.title}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>

                                <div className="flex flex-col justify-center space-y-4 md:space-y-6 md:p-4">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <span className="font-semibold text-orange-600">Featured</span>
                                        <span>•</span>
                                        {featuredPost.frontmatter.date && (
                                            <time dateTime={featuredPost.frontmatter.date}>
                                                {new Date(featuredPost.frontmatter.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </time>
                                        )}
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-foreground transition-colors group-hover:text-orange-600">
                                        {featuredPost.frontmatter.title}
                                    </h2>
                                    <p className="text-muted-foreground text-lg leading-relaxed line-clamp-3 md:line-clamp-4">
                                        {featuredPost.frontmatter.description || featuredPost.frontmatter.summary}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-orange-600 transition-colors pt-2">
                                        Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    </ScrollReveal>
                )}

                {/* Remaining Posts Grid */}
                {remainingPosts.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {remainingPosts.map((post, index) => (
                            <ScrollReveal key={post.slug} delay={0.1 + (index * 0.05)} width="100%">
                                <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full">
                                    <article className="flex flex-col h-full rounded-2xl bg-card border border-border/50 overflow-hidden hover:shadow-lg hover:border-orange-200/50 transition-all duration-300">
                                        {/* Image */}
                                        <div className="relative aspect-video w-full bg-muted overflow-hidden">
                                            <Image
                                                src={post.frontmatter.image || "https://cdn.prod.website-files.com/641c35b7e5057648c76fa79f/67aa1ba2c258695b6bd94483_Printmaking_Studio.original.jpg"}
                                                alt={post.frontmatter.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col flex-1 p-6">
                                            {/* Category */}
                                            {post.frontmatter.category && (
                                                <div className="mb-4">
                                                    <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10">
                                                        {post.frontmatter.category}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Title */}
                                            <h3 className="text-xl font-bold leading-tight text-foreground group-hover:text-orange-600 transition-colors mb-3 line-clamp-2">
                                                {post.frontmatter.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
                                                {post.frontmatter.description || post.frontmatter.summary}
                                            </p>

                                            {/* Date */}
                                            {post.frontmatter.date && (
                                                <time dateTime={post.frontmatter.date} className="text-xs font-medium text-muted-foreground/80 mt-auto pt-4 border-t border-border/40 w-full block">
                                                    {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </time>
                                            )}
                                        </div>
                                    </article>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <p className="text-xl text-muted-foreground">No articles found matching your criteria.</p>
                        {/* Removed clear filters button as there are no filters */}
                    </div>
                )}
            </Container>
        </div>
    );
}
