import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import { Shield, MessageSquare, HelpCircle, Code } from "lucide-react";
import Link from "next/link";
import { CTA } from "@/components/sections/cta";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata: Metadata = {
    title: "Resources - Shelf Asset Management",
    description: "Get help, contact support, or read our documentation.",
};

export default function ResourcesPage() {
    return (
        <PagefindWrapper type="Page" title="Resources - Help, support, and documentation" keywords="resources help support documentation resources page">
        <div className="flex min-h-screen flex-col">
            <Container className="py-24 sm:py-32">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                        How can we help?
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        Get in touch for sales and support, or dive into our product docs.
                    </p>
                    <div className="flex justify-center">
                        <Badge variant="neutral" className="pl-2 pr-3 py-1.5 gap-2 text-sm font-normal">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            All systems operational
                        </Badge>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Sales */}
                    <Card className="p-8 flex flex-col items-start h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border/50 hover:border-orange-500/20">
                        <div className="mb-6 bg-orange-50 p-3 rounded-lg">
                            <Shield className="h-6 w-6 text-orange-600" strokeWidth={2} />
                        </div>
                        <h3 className="font-bold text-xl mb-3">Sales</h3>
                        <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed">
                            Speak with our sales team about features, plan pricing, or request a demo.
                        </p>
                        <div className="mt-auto pt-4 w-full sm:w-auto">
                            <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white" asChild>
                                <a href="mailto:sales@shelf.nu">Talk to sales</a>
                            </Button>
                        </div>
                    </Card>

                    {/* Support */}
                    <Card className="p-8 flex flex-col items-start h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border/50 hover:border-blue-500/20">
                        <div className="mb-6 bg-blue-50 p-3 rounded-lg">
                            <MessageSquare className="h-6 w-6 text-blue-600" strokeWidth={2} />
                        </div>
                        <h3 className="font-bold text-xl mb-3">Support</h3>
                        <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed">
                            Chat with us about product support, resolve billing questions, or provide feedback.
                        </p>
                        <div className="mt-auto pt-4 w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto" asChild>
                                <a href="mailto:support@shelf.nu">Get support</a>
                            </Button>
                        </div>
                    </Card>

                    {/* Questions */}
                    <Card className="p-8 flex flex-col items-start h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border/50 hover:border-emerald-500/20">
                        <div className="mb-6 bg-emerald-50 p-3 rounded-lg">
                            <HelpCircle className="h-6 w-6 text-emerald-600" strokeWidth={2} />
                        </div>
                        <h3 className="font-bold text-xl mb-3">Knowledge Base</h3>
                        <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed">
                            Browse guides, tutorials, and how-to articles to find the answer to your question.
                        </p>
                        <div className="mt-auto pt-4 w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto" asChild>
                                <Link href="/knowledge-base">Browse articles</Link>
                            </Button>
                        </div>
                    </Card>

                    {/* Developer Docs */}
                    <Card className="p-8 flex flex-col items-start h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border/50 hover:border-purple-500/20">
                        <div className="mb-6 bg-purple-50 p-3 rounded-lg">
                            <Code className="h-6 w-6 text-purple-600" strokeWidth={2} />
                        </div>
                        <h3 className="font-bold text-xl mb-3">Developer Docs</h3>
                        <p className="text-muted-foreground mb-8 text-[15px] leading-relaxed">
                            Read about Shelf platform development and API usage documentation.
                        </p>
                        <div className="mt-auto pt-4 w-full sm:w-auto">
                            <Button variant="outline" className="w-full sm:w-auto" asChild>
                                <Link href="https://docs.shelf.nu">Read docs</Link>
                            </Button>
                        </div>
                    </Card>
                </div>
            </Container>

            <CTA />
        </div>
        </PagefindWrapper>
    );
}
