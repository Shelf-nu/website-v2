import { Frontmatter } from "@/lib/content/schema";
import { Container } from "@/components/ui/container";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LayoutProps {
    frontmatter: Frontmatter;
    children: React.ReactNode;
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function isExternalUrl(url: string) {
    return url.startsWith("http://") || url.startsWith("https://");
}

export function UpdateLayout({ frontmatter, children }: LayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <div className="border-b border-border/40 bg-muted/20">
                <Container className="pt-28 pb-10 md:pt-36 md:pb-14">
                    <nav className="mb-6">
                        <Link
                            href="/updates"
                            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            All Updates
                        </Link>
                    </nav>

                    <Badge
                        variant="secondary"
                        className="mb-4 bg-orange-50 text-orange-700 border-orange-100/50 px-3 py-0.5 text-xs"
                    >
                        Product Update
                    </Badge>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
                        {frontmatter.title}
                    </h1>

                    {frontmatter.date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <time dateTime={frontmatter.date}>
                                {formatDate(frontmatter.date)}
                            </time>
                        </div>
                    )}
                </Container>
            </div>

            {/* Content */}
            <main className="flex-1">
                <Container className="py-12 md:py-16">
                    <div className="max-w-3xl">
                        {/* Feature image */}
                        {frontmatter.image && (
                            <div className="relative aspect-video w-full mb-10 rounded-xl overflow-hidden border border-border/40 bg-muted">
                                <Image
                                    src={frontmatter.image}
                                    alt={frontmatter.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        )}

                        {/* Description */}
                        {frontmatter.description && (
                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                                {frontmatter.description}
                            </p>
                        )}

                        {/* MDX body content (if any) */}
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            {children}
                        </div>

                        {/* Read more link */}
                        {frontmatter.readMoreUrl && (
                            <div className="mt-10 pt-8 border-t border-border/40">
                                {isExternalUrl(frontmatter.readMoreUrl) ? (
                                    <Button variant="outline" asChild>
                                        <a
                                            href={frontmatter.readMoreUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Learn more
                                            <ExternalLink className="ml-2 h-4 w-4" />
                                        </a>
                                    </Button>
                                ) : (
                                    <Button variant="outline" asChild>
                                        <Link href={frontmatter.readMoreUrl}>
                                            Learn more
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Back link */}
                        <div className="mt-12 pt-8 border-t border-border/40">
                            <Link
                                href="/updates"
                                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <ArrowLeft className="h-3.5 w-3.5" />
                                Back to all updates
                            </Link>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    );
}
