import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";

import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-zinc-200 bg-zinc-50/50 text-zinc-500">
            <Container className="py-24 md:py-32 relative">
                <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5 mb-24">
                    <div className="col-span-2 lg:col-span-2 pr-12">
                        <div className="flex items-center space-x-2 mb-8">
                            <Logo />
                        </div>
                        <p className="text-base text-zinc-600 max-w-xs leading-relaxed font-normal">
                            Asset tracking for modern teams. <br />
                            Open source, transparent, and built for speed.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-8 text-zinc-900 tracking-tight">Product</h3>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li><Link href="/features" className="hover:text-orange-600 transition-colors">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-orange-600 transition-colors">Pricing</Link></li>
                            <li><Link href="/solutions" className="hover:text-orange-600 transition-colors">Solutions</Link></li>
                            <li><Link href="/case-studies" className="hover:text-orange-600 transition-colors">Case Studies</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-8 text-zinc-900 tracking-tight">Resources</h3>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li><Link href="/blog" className="hover:text-orange-600 transition-colors">Blog</Link></li>
                            <li><Link href="/glossary" className="hover:text-orange-600 transition-colors">Glossary</Link></li>
                            <li><Link href="/tools" className="hover:text-orange-600 transition-colors font-medium text-zinc-900">Free Tools</Link></li>
                            <li><Link href="/tools/qr-code-decoder" className="hover:text-orange-600 transition-colors">QR Code Decoder</Link></li>
                            <li><Link href="https://github.com/Shelf-nu/shelf.nu" className="hover:text-orange-600 transition-colors">GitHub</Link></li>
                            <li><Link href="https://docs.shelf.nu" className="hover:text-orange-600 transition-colors">Documentation</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-8 text-zinc-900 tracking-tight">Company</h3>
                        <ul className="space-y-4 text-sm text-zinc-500">
                            <li><Link href="/about" className="hover:text-orange-600 transition-colors">About</Link></li>
                            <li><Link href="/contact" className="hover:text-orange-600 transition-colors">Contact</Link></li>
                            <li><Link href="/terms" className="hover:text-orange-600 transition-colors">Terms</Link></li>
                            <li><Link href="/privacy" className="hover:text-orange-600 transition-colors">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-zinc-200 pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-sm text-zinc-400 font-medium">
                        &copy; 2026 Shelf Asset Management, Inc.
                    </p>
                    <div className="flex items-center space-x-6">
                        <Link href="https://github.com/Shelf-nu/shelf.nu" className="text-zinc-400 hover:text-zinc-900 transition-colors">
                            <span className="sr-only">GitHub</span>
                            <Github className="h-5 w-5" />
                        </Link>
                        <Link href="https://twitter.com/shelf_nu" className="text-zinc-400 hover:text-zinc-900 transition-colors">
                            <span className="sr-only">X (Twitter)</span>
                            <Twitter className="h-5 w-5" />
                        </Link>
                        <Link href="https://linkedin.com/company/shelf-nu" className="text-zinc-400 hover:text-zinc-900 transition-colors">
                            <span className="sr-only">LinkedIn</span>
                            <Linkedin className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </Container>
        </footer>
    );
}
