import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText } from "lucide-react";
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
        <Link href={`/case-studies/${slug}`} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-500/30">
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
                        <FileText className="h-12 w-12 text-orange-300" />
                    </div>
                )}

                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent" />

                {/* Logo Overlay */}
                {logo && (
                    <div className="absolute bottom-4 left-4 h-10 w-10 rounded-xl bg-white/90 backdrop-blur-sm p-1.5 shadow-sm border border-white/20">
                        <Image src={logo} alt="Logo" width={48} height={48} className="h-full w-full object-contain" />
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex flex-wrap gap-1.5">
                    {industry?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-100 text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <h3 className="mb-2 text-lg font-bold leading-tight text-foreground group-hover:text-orange-600 transition-colors">
                    {title}
                </h3>

                <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {summary}
                </p>

                <div className="mt-4 flex items-center text-sm font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0">
                    Read story <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </div>
            </div>
        </Link>
    );
}
