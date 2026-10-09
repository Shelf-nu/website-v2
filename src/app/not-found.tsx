import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NotFoundTracker } from "@/components/analytics/not-found-tracker";

/** Where most visitors who land here were trying to go. */
const POPULAR_PAGES = [
    { href: "/pricing", label: "Pricing", description: "Plans, add-ons and the free plan" },
    { href: "/features", label: "Features", description: "Bookings, custody, kits and audits" },
    { href: "/alternatives", label: "Compare Shelf", description: "Shelf next to the tools you use now" },
    { href: "/knowledge-base", label: "Knowledge base", description: "How-to guides for every feature" },
    { href: "/tools", label: "Free tools", description: "QR codes, depreciation and more" },
    { href: "/blog", label: "Blog", description: "Guides on tracking equipment" },
];

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-32">
            <NotFoundTracker />
            <Container className="text-center">
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-4">
                    404
                </p>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                    Page not found
                </h1>
                <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or deleted.
                </p>

                {/* People often type their workspace name after shelf.nu. Workspaces live in the app. */}
                <div className="mx-auto mb-10 max-w-xl rounded-2xl border border-orange-200 bg-orange-50/60 p-6 text-left dark:border-orange-900/50 dark:bg-orange-950/20 sm:flex sm:items-center sm:justify-between sm:gap-6">
                    <div className="mb-4 sm:mb-0">
                        <p className="font-semibold text-foreground">Looking for your Shelf workspace?</p>
                        <p className="text-sm text-muted-foreground">
                            Your assets and bookings are in the Shelf app at app.shelf.nu, not on this website.
                        </p>
                    </div>
                    <Button asChild className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white">
                        <Link href="https://app.shelf.nu/login">
                            <LogIn className="mr-2 h-4 w-4" />
                            Log in to Shelf
                        </Link>
                    </Button>
                </div>

                <p className="text-sm font-semibold text-foreground mb-4">Or try one of these pages</p>
                <ul className="mx-auto mb-10 grid max-w-3xl gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
                    {POPULAR_PAGES.map((page) => (
                        <li key={page.href}>
                            <Link
                                href={page.href}
                                className="group flex h-full items-start justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 transition-colors hover:border-orange-300"
                            >
                                <span>
                                    <span className="block font-medium text-foreground">{page.label}</span>
                                    <span className="block text-sm text-muted-foreground">{page.description}</span>
                                </span>
                                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-orange-600" />
                            </Link>
                        </li>
                    ))}
                </ul>

                <Button variant="outline" asChild>
                    <Link href="/">Go home</Link>
                </Button>
            </Container>
        </div>
    );
}
