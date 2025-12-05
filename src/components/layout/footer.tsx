import Link from "next/link";
import { Container } from "@/components/ui/container";

const footerLinks = {
    product: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Case Studies", href: "/case-studies" },
        { name: "Concepts", href: "/concepts" },
    ],
    company: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Careers", href: "/careers" },
        { name: "Contact", href: "/contact" },
    ],
    legal: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
    ],
};

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <Container>
                <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:py-16">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="text-xl font-bold tracking-tight">
                            Shelf
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Modern asset tracking for modern teams.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Product</h3>
                        <ul className="mt-4 space-y-3">
                            {footerLinks.product.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Company</h3>
                        <ul className="mt-4 space-y-3">
                            {footerLinks.company.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                        <ul className="mt-4 space-y-3">
                            {footerLinks.legal.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="border-t py-8">
                    <p className="text-center text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} Shelf Inc. All rights reserved.
                    </p>
                </div>
            </Container>
        </footer>
    );
}
