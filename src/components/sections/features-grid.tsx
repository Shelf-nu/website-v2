import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Frontmatter } from "@/lib/content/schema";
import { ArrowRight } from "lucide-react";

interface FeaturesGridProps {
    features: {
        frontmatter: Frontmatter;
        slug: string;
    }[];
}

export function FeaturesGrid({ features }: FeaturesGridProps) {
    return (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ frontmatter, slug }) => (
                <Link key={slug} href={`/features/${slug}`} className="group block h-full">
                    <Card className="h-full border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg">
                        <CardHeader>
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                                    {/* Placeholder icon since we don't have per-feature icons yet */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect width="18" height="18" x="3" y="3" rx="2" />
                                        <path d="M3 9h18" />
                                        <path d="M9 21V9" />
                                    </svg>
                                </div>

                            </div>
                            <CardTitle className="mb-3 text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                                {frontmatter.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                                {frontmatter.description}
                            </CardDescription>

                            <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                                Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
