import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background text-muted-foreground">
            <Container className="py-20 md:py-24 relative">
                <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5 mb-20">
                    <div className="col-span-2 lg:col-span-2 pr-8">
                        <div className="flex items-center space-x-2 mb-6">
                            <Logo />
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            Asset tracking for modern teams.
                            Open source, transparent, and built for speed.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-6 text-foreground tracking-tight">Product</h3>
                        <ul className="space-y-3.5 text-sm">
                            <li><Link href="/features" className="hover:text-orange-600 transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-orange-600 transition-colors">Pricing</Link></li>
                            <li><Link href="/solutions" className="hover:text-orange-600 transition-colors">Solutions</Link></li>
                            <li><Link href="/case-studies" className="hover:text-orange-600 transition-colors">Case Studies</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-6 text-foreground tracking-tight">Resources</h3>
                        <ul className="space-y-3.5 text-sm">
                            <li><Link href="/blog" className="hover:text-orange-600 transition-colors">Blog</Link></li>
                            <li><Link href="/updates" className="hover:text-orange-600 transition-colors">Updates</Link></li>
                            <li><Link href="/glossary" className="hover:text-orange-600 transition-colors">Glossary</Link></li>
                            <li><Link href="/tools" className="hover:text-orange-600 transition-colors font-medium text-foreground">Free Tools</Link></li>
                            <li><Link href="/tools/qr-code-decoder" className="hover:text-orange-600 transition-colors">QR Code Decoder</Link></li>
                            <li><Link href="https://github.com/Shelf-nu/shelf.nu" className="hover:text-orange-600 transition-colors">GitHub</Link></li>
                            <li><Link href="https://docs.shelf.nu" className="hover:text-orange-600 transition-colors">Documentation</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-6 text-foreground tracking-tight">Company</h3>
                        <ul className="space-y-3.5 text-sm">
                            <li><Link href="/about" className="hover:text-orange-600 transition-colors">About</Link></li>
                            <li><Link href="/contact" className="hover:text-orange-600 transition-colors">Contact</Link></li>
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
                        <Link href="https://github.com/Shelf-nu/shelf.nu" className="text-muted-foreground/40 hover:text-orange-600 transition-colors">
                            <span className="sr-only">GitHub</span>
                            <Github className="h-4.5 w-4.5" />
                        </Link>
                        <Link href="https://twitter.com/shelf_nu" className="text-muted-foreground/40 hover:text-orange-600 transition-colors">
                            <span className="sr-only">X (Twitter)</span>
                            <Twitter className="h-4.5 w-4.5" />
                        </Link>
                        <Link href="https://linkedin.com/company/shelf-nu" className="text-muted-foreground/40 hover:text-orange-600 transition-colors">
                            <span className="sr-only">LinkedIn</span>
                            <Linkedin className="h-4.5 w-4.5" />
                        </Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
