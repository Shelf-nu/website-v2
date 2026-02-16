import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CaseStudyCardProps {
    slug: string;
    title: string;
    summary: string;
    coverImage?: string;
    logo?: string;
    industry?: string[];
}

export function CaseStudyCard({ slug, title, summary, coverImage, logo, industry }: CaseStudyCardProps) {
    return (
        <Link href={`/case-studies/${slug}`} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-background transition-all hover:shadow-lg hover:border-orange-500/20">
            {/* Image Section */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                        <span className="text-4xl">📄</span>
                    </div>
                )}

                {/* Logo Overlay */}
                {logo && (
                    <div className="absolute bottom-4 left-4 h-12 w-12 rounded-lg bg-white p-2 shadow-sm ring-1 ring-black/5">
                        <Image src={logo} alt="Logo" width={48} height={48} className="h-full w-full object-contain" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex flex-wrap gap-2">
                    {industry?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <h3 className="mb-2 text-xl font-bold leading-tight text-foreground group-hover:text-orange-600 transition-colors">
                    {title}
                </h3>

                <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {summary}
                </p>

                <div className="mt-6 flex items-center text-sm font-semibold text-orange-600">
                    Read story <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}
