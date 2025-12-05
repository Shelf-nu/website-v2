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
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                            {item.name}
                        </Link>
                    </li>
                            ))}
                </ul>
            </div>
                </div >
    <div className="border-t py-8">
        <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Shelf Inc. All rights reserved.
        </p>
    </div>
            </Container >
        </footer >
    );
}
