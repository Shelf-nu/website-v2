import Link from "next/link";
import { Container } from "@/components/ui/container";

export function Footer() {
    return (
        <footer className="border-t bg-stone-50 dark:bg-stone-900">
            <Container className="py-12 md:py-16">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="text-xl font-bold tracking-tight">
                            shelf.nu
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                            Open source asset management for modern teams.
                            Track your equipment with ease.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Product</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/features" className="hover:text-primary">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                            <li><Link href="/solutions" className="hover:text-primary">Solutions</Link></li>
                            <li><Link href="/case-studies" className="hover:text-primary">Case Studies</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Resources</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                            <li><Link href="/glossary" className="hover:text-primary">Glossary</Link></li>
                            <li><Link href="https://github.com/Shelf-nu/shelf.nu" className="hover:text-primary">GitHub</Link></li>
                            <li><Link href="https://docs.shelf.nu" className="hover:text-primary">Documentation</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary">About</Link></li>
                            <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Shelf.nu. All rights reserved.</p>
                </div>
            </Container>
        </footer>
    );
}
