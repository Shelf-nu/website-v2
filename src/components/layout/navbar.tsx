import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export function Navbar() {
    return (
        <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
            <Container className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        shelf.nu
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/features" className="hover:text-primary transition-colors">
                            Features
                        </Link>
                        <Link href="/solutions" className="hover:text-primary transition-colors">
                            Solutions
                        </Link>
                        <Link href="/pricing" className="hover:text-primary transition-colors">
                            Pricing
                        </Link>
                        <Link href="/blog" className="hover:text-primary transition-colors">
                            Blog
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-primary hidden sm:block">
                        Contact
                    </Link>
                    <Link href="https://app.shelf.nu/login">
                        <Button variant="ghost" size="sm">
                            Log in
                        </Button>
                    </Link>
                    <Link href="https://app.shelf.nu/register">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </div>
            </Container>
        </header>
    );
}
