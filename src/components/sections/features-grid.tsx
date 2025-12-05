import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
                    <Card className="h-full transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md">
                        <CardHeader>
                            <div className="mb-4 flex items-center justify-between">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    {/* Icon placeholder - could be mapped from frontmatter if we add an icon field */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                                    </svg>
                                </div>
                                {frontmatter.stage && (
                                    <Badge variant="neutral" className="uppercase text-[10px]">
                                        {frontmatter.stage}
                                    </Badge>
                                )}
                            </div>
                            <CardTitle className="mb-2 group-hover:text-primary transition-colors">
                                {frontmatter.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-3">
                                {frontmatter.description}
                            </CardDescription>

                            <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                                Learn more <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
