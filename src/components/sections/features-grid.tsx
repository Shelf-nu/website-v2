import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface Feature {
    slug: string;
    frontmatter: {
        title: string;
        description: string;
        // Add other fields if needed
    };
}

interface FeaturesGridProps {
    features: Feature[];
}

export function FeaturesGrid({ features }: FeaturesGridProps) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
                <Link key={feature.slug} href={`/features/${feature.slug}`} className="group block h-full">
                    <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
                        <CardHeader>
                            <div className="mb-2">
                                {/* Placeholder for icon or tiny badge if needed later */}
                                <div className="h-2 w-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                            </div>
                            <CardTitle className="group-hover:text-primary transition-colors">
                                {feature.frontmatter.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                {feature.frontmatter.description}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <div className="flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                Datails <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
