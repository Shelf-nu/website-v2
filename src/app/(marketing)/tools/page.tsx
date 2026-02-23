import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, QrCode, PenTool, Tag } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { Pill } from "@/components/ui/pill";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata: Metadata = {
    title: 'Free Tools for Asset Management | Shelf',
    description: 'Free utilities for asset tracking teams. Decode QR codes, generate labels, and manage equipment more efficiently.',
};

const tools = [
    {
        title: "QR Code Decoder",
        description: "Decode QR codes from images instantly in your browser. No upload required.",
        icon: QrCode,
        href: "/tools/qr-code-decoder",
    },
    {
        title: "Asset Label Designer",
        description: "Design scan-safe QR labels for equipment and inventory. Export to PDF/PNG.",
        icon: Tag,
        href: "/tools/asset-label-designer",
    },
    {
        title: "QR Code Generator",
        description: "Generate high-density QR codes (PNG & SVG) optimized for industrial asset labels.",
        icon: PenTool,
        href: "/tools/qr-code-generator",
    }
];

export default function ToolsIndexPage() {
    return (
        <PagefindWrapper type="Page" title="Free Tools for Asset Management" keywords="tools free tools asset tools tools page">
        <div className="min-h-screen font-sans">
            {/* Custom Header with Grid Pattern */}
            <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
                {/* Background Gradient - Exact Match from Features Page */}
                <div className="absolute top-0 inset-x-0 h-[600px] -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
                <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />

                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="mb-6">
                            <Pill>Free Utilities</Pill>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground">
                            Tools for the <span className="text-orange-600">Modern Asset Manager</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Simple, privacy-focused utilities to help you manage equipment and operations. No signup required.
                        </p>
                    </div>
                </Container>
            </section>

            <section className="pb-20 md:pb-32 bg-background">
                <Container>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto -mt-12 relative z-10">
                        {tools.map((tool) => (
                            <div key={tool.title} className="group relative bg-card border border-border rounded-2xl p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-orange-200/50 hover:-translate-y-1 flex flex-col">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <tool.icon className="h-7 w-7 text-orange-600" />
                                    </div>
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50">
                                        Live
                                    </Badge>
                                </div>

                                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-orange-600 transition-colors">
                                    {tool.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                                    {tool.description}
                                </p>

                                <Link
                                    href={tool.href}
                                    className="inline-flex items-center text-sm font-semibold text-orange-600 hover:text-orange-700 gap-2 mt-auto before:absolute before:inset-0"
                                >
                                    Open Tool <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>
        </div>
        </PagefindWrapper>
    );
}
