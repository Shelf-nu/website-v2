import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, MessageSquare, ArrowRight, Github, Linkedin } from "lucide-react";
import { PagefindWrapper } from "@/components/search/pagefind-wrapper";

export const metadata = {
    title: "Contact Us | Shelf Asset Management",
    description: "Get in touch with the Shelf team for support, sales, or general inquiries.",
};

export default function ContactPage() {
    return (
        <PagefindWrapper type="Page" title="Contact Us - Get in touch" keywords="contact contact us get in touch contact page">
        <div className="flex min-h-screen flex-col">
            {/* Hero */}
            <section className="relative pt-32 pb-16 md:pt-48 md:pb-24 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-grid-pattern bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/20 via-background to-background pointer-events-none" />
                <Container className="text-center relative z-10">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 text-foreground">Get in touch</h1>
                    <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
                        Questions about pricing, features, or need help migrating? We&apos;re here for you.
                    </p>
                </Container>
            </section>

            {/* Cards */}
            <section className="pb-24 md:pb-32">
                <Container>
                    <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
                        {/* Sales */}
                        <div className="rounded-2xl border border-border/60 bg-card p-8 hover:shadow-lg hover:border-orange-200 transition-all text-left">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/50 dark:bg-orange-950/30 mb-6">
                                <MessageSquare className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-foreground">Sales</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                Interested in Shelf for your team? Talk directly to our CEO.
                            </p>
                            <div className="space-y-3">
                                <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                                    <Link href="/demo?utm_source=shelf_website&utm_medium=cta&utm_content=contact_demo">
                                        Book a demo <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="text-center">
                                    <Link href="mailto:carlos@shelf.nu" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                                        carlos@shelf.nu
                                    </Link>
                                    <p className="text-xs text-muted-foreground mt-1">Carlos Virreira, CEO</p>
                                </div>
                            </div>
                        </div>

                        {/* Support */}
                        <div className="rounded-2xl border border-border/60 bg-card p-8 hover:shadow-lg hover:border-blue-200 transition-all text-left">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100/50 dark:bg-blue-950/30 mb-6">
                                <Mail className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-foreground">Support</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                Need help with your account, run into a bug, or have a question?
                            </p>
                            <div className="space-y-3">
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="mailto:support@shelf.nu">
                                        Email support
                                    </Link>
                                </Button>
                                <div className="text-center">
                                    <Link href="/knowledge-base" className="text-sm text-muted-foreground hover:text-foreground font-medium">
                                        Browse Knowledge Base →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Community */}
                        <div className="rounded-2xl border border-border/60 bg-card p-8 hover:shadow-lg hover:border-purple-200 transition-all text-left">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100/50 dark:bg-purple-950/30 mb-6">
                                <Github className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-xl mb-2 text-foreground">Community</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                Shelf is open source. Contribute, report issues, or follow our progress.
                            </p>
                            <div className="space-y-3">
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="https://github.com/Shelf-nu/shelf.nu">
                                        <Github className="mr-2 h-4 w-4" /> GitHub
                                    </Link>
                                </Button>
                                <div className="text-center">
                                    <Link href="https://www.linkedin.com/company/shelf-inc/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground font-medium">
                                        <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
        </PagefindWrapper>
    );
}
