import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { Github, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background text-muted-foreground">
            <Container className="py-20 md:py-24 relative">
                <div className="grid grid-cols-2 gap-12 md:grid-cols-3 lg:grid-cols-8 mb-20">
                    <div className="col-span-2 md:col-span-3 lg:col-span-2 pr-8">
                        <div className="flex items-center space-x-2 mb-6">
                            <Logo />
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-2">We&apos;re here to help</p>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            There are no stupid questions. For pre-sales questions, existing customers who need a hand, or other inquiries, <Link href="/contact" className="text-orange-600 hover:text-orange-700 transition-colors">contact us</Link> and we&apos;ll get back to you within the same business day.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-6 text-foreground tracking-tight">Product</h3>
                        <ul className="space-y-3.5 text-sm">
                            <li><Link href="/features" className="hover:text-orange-600 transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-orange-600 transition-colors">Pricing</Link></li>
                            <li><Link href="/demo" className="hover:text-orange-600 transition-colors">Book a Demo</Link></li>
                            <li><Link href="/case-studies" className="hover:text-orange-600 transition-colors">Case Studies</Link></li>
                            <li><Link href="/customers" className="hover:text-orange-600 transition-colors">Customers</Link></li>
                            <li><Link href="/migrate" className="hover:text-orange-600 transition-colors">Migrate to Shelf</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-6 text-foreground tracking-tight">Solutions</h3>
                        <ul className="space-y-3.5 text-sm">
                            <li><Link href="/solutions" className="hover:text-orange-600 transition-colors font-medium text-foreground">All Solutions</Link></li>
                            <li><Link href="/solutions/asset-tracking" className="hover:text-orange-600 transition-colors">Asset Tracking</Link></li>
                            <li><Link href="/solutions/tool-tracking" className="hover:text-orange-600 transition-colors">Tool Tracking</Link></li>
                            <li><Link href="/solutions/it-asset-management" className="hover:text-orange-600 transition-colors">IT Asset Management</Link></li>
                            <li><Link href="/solutions/equipment-reservations" className="hover:text-orange-600 transition-colors">Equipment Reservations</Link></li>
                            <li><Link href="/solutions/fixed-asset-tracking" className="hover:text-orange-600 transition-colors">Fixed Asset Tracking</Link></li>
                            <li><Link href="/solutions/educational-resource-management" className="hover:text-orange-600 transition-colors">Education</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-6 text-foreground tracking-tight">Compare</h3>
                        <ul className="space-y-3.5 text-sm">
                            <li><Link href="/alternatives" className="hover:text-orange-600 transition-colors font-medium text-foreground">All Alternatives</Link></li>
                            <li><Link href="/alternatives/cheqroom" className="hover:text-orange-600 transition-colors">Shelf vs Cheqroom</Link></li>
                            <li><Link href="/alternatives/sortly" className="hover:text-orange-600 transition-colors">Shelf vs Sortly</Link></li>
                            <li><Link href="/alternatives/asset-panda" className="hover:text-orange-600 transition-colors">Shelf vs Asset Panda</Link></li>
                            <li><Link href="/alternatives/asset-tiger" className="hover:text-orange-600 transition-colors">Shelf vs Asset Tiger</Link></li>
                            <li><Link href="/alternatives/snipe-it" className="hover:text-orange-600 transition-colors">Shelf vs Snipe-IT</Link></li>
                            <li><Link href="/alternatives/ezofficeinventory" className="hover:text-orange-600 transition-colors">Shelf vs EZOffice</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-6 text-foreground tracking-tight">Resources</h3>
                        <ul className="space-y-3.5 text-sm">
                            <li><Link href="/blog" className="hover:text-orange-600 transition-colors">Blog</Link></li>
                            <li><Link href="/knowledge-base" className="hover:text-orange-600 transition-colors">Knowledge Base</Link></li>
                            <li><Link href="/glossary" className="hover:text-orange-600 transition-colors">Glossary</Link></li>
                            <li><Link href="/updates" className="hover:text-orange-600 transition-colors">Updates</Link></li>
                            <li><Link href="/tools" className="hover:text-orange-600 transition-colors font-medium text-foreground">Free Tools</Link></li>
                            <li><Link href="https://github.com/Shelf-nu/shelf.nu" className="hover:text-orange-600 transition-colors">GitHub</Link></li>
                            <li><Link href="https://docs.shelf.nu" className="hover:text-orange-600 transition-colors">Documentation</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-6 text-foreground tracking-tight">Company</h3>
                        <ul className="space-y-3.5 text-sm">
                            <li><Link href="/about" className="hover:text-orange-600 transition-colors">About</Link></li>
                            <li><Link href="/contact" className="hover:text-orange-600 transition-colors">Contact</Link></li>
                            <li><Link href="/security" className="hover:text-orange-600 transition-colors">Security</Link></li>
                            <li><Link href="/terms" className="hover:text-orange-600 transition-colors">Terms</Link></li>
                            <li><Link href="/privacy" className="hover:text-orange-600 transition-colors">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs text-muted-foreground/60">
                        &copy; {new Date().getFullYear()} Shelf Asset Management, Inc.
                    </p>
                    <div className="flex items-center space-x-5">
                        <ThemeToggle />
                        <Link href="https://github.com/Shelf-nu/shelf.nu" className="text-muted-foreground/40 hover:text-orange-600 transition-colors">
                            <span className="sr-only">GitHub</span>
                            <Github className="h-4.5 w-4.5" />
                        </Link>
                        <Link href="https://www.linkedin.com/company/shelf-inc/" className="text-muted-foreground/40 hover:text-orange-600 transition-colors">
                            <span className="sr-only">LinkedIn</span>
                            <Linkedin className="h-4.5 w-4.5" />
                        </Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
