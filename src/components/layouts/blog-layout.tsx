import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Frontmatter } from "@/lib/content/schema";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { ShareButton } from "@/components/blog/share-button";
import { formatCategoryLabel, formatDate } from "@/lib/utils";

function formatAuthorName(author: string): string {
    // Convert slug-style "carlos-virreira" to "Carlos Virreira"
    return author
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

interface RelatedPost {
    slug: string;
    frontmatter: Frontmatter;
}

interface BlogLayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
    relatedPosts?: RelatedPost[];
}

export function BlogLayout({ frontmatter, children, relatedPosts }: BlogLayoutProps) {
    return (
        <article className="min-h-screen relative flex flex-col">
            {/* Ambient Background - Subtle for readability */}
            <div className="absolute top-0 inset-x-0 h-[400px] -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/30 via-background to-background pointer-events-none" />

            <Container className="pt-32 pb-16 md:pt-48 md:pb-24 relative">
                {/* Back Link */}
                <Link
                    href="/blog"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-orange-600 mb-8 md:mb-12 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Blog
                </Link>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Main Content Column */}
                    <div className="lg:col-span-8 lg:col-start-1">
                        {/* Header */}
                        <header className="mb-10 text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                                {frontmatter.category && (
                                    <Link href={`/blog?category=${frontmatter.category}`}>
                                        <Badge variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 cursor-pointer">
                                            {formatCategoryLabel(frontmatter.category)}
                                        </Badge>
                                    </Link>
                                )}
                                {frontmatter.date && (
                                    <time dateTime={frontmatter.date} className="text-sm text-muted-foreground">
                                        {formatDate(frontmatter.date)}
                                    </time>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                                {frontmatter.title}
                            </h1>

                            {/* Author Block */}
                            <div className="flex items-center justify-center lg:justify-start gap-4 border-y border-border py-6">
                                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-700 overflow-hidden relative">
                                    {frontmatter.author ? formatAuthorName(frontmatter.author).charAt(0) : 'S'}
                                </div>
                                <div className="text-left">
                                    <div className="font-semibold text-foreground">{frontmatter.author ? formatAuthorName(frontmatter.author) : "Shelf Team"}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {frontmatter.authorRole || "Shelf Team"}
                                    </div>
                                </div>
                                <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span>{frontmatter.readingTime || "5 min"} read</span>
                                    </div>
                                    <div className="hidden md:block h-4 w-px bg-border" />
                                    <ShareButton />
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border/50 shadow-sm mb-12">
                            <Image
                                src={frontmatter.image || "https://qliecghuzfchfjwaisyx.supabase.co/storage/v1/object/public/website-images/blog/Printmaking_Studio.original.jpg"}
                                alt={frontmatter.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Content Body */}
                        <div className="prose prose-lg dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:tracking-tight prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md max-w-none">
                            {children}
                        </div>

                    </div>
                    {/* Desktop Sidebar (TOC) */}
                    <aside className="hidden lg:block lg:col-span-3 lg:col-start-10 h-full">
                        <BlogSidebar />
                    </aside>
                </div>

                {/* Read Next Section */}
                {relatedPosts && relatedPosts.length > 0 && (
                    <div className="border-t border-border pt-16 mt-24 mb-16">
                        <h3 className="text-2xl font-bold mb-8">More from the blog</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {relatedPosts.map((post) => (
                                <Link key={post.slug} href={`/blog/${post.slug}`} className="group block h-full">
                                    <article className="flex flex-col h-full bg-card/40 border border-border/40 rounded-2xl overflow-hidden hover:bg-card/80 hover:scale-[1.01] transition-all duration-300">
                                        <div className="relative aspect-video w-full bg-muted border-b border-border/50">
                                            <Image
                                                src={post.frontmatter.image || "https://qliecghuzfchfjwaisyx.supabase.co/storage/v1/object/public/website-images/blog/Printmaking_Studio.original.jpg"}
                                                alt={post.frontmatter.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        </div>
                                        <div className="p-6 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                                {post.frontmatter.category && (
                                                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-100">
                                                        {formatCategoryLabel(post.frontmatter.category)}
                                                    </Badge>
                                                )}
                                                {post.frontmatter.date && (
                                                    <time dateTime={post.frontmatter.date}>
                                                        {formatDate(post.frontmatter.date)}
                                                    </time>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-lg mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                                                {post.frontmatter.title}
                                            </h4>
                                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                                                {post.frontmatter.description}
                                            </p>
                                            <div className="flex items-center text-sm font-medium text-orange-600">
                                                Read article <ArrowRight className="ml-1 h-3 w-3" />
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

            </Container>
        </article>
    );
}
