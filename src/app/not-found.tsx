import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NotFoundTracker } from "@/components/analytics/not-found-tracker";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <NotFoundTracker />
            <Container className="text-center">
                <p className="text-sm font-semibold text-orange-600 uppercase tracking-wider mb-4">
                    404
                </p>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                    Page not found
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or deleted.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild className="bg-orange-600 hover:bg-orange-700 text-white">
                        <Link href="/">Go home</Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/blog">Browse blog</Link>
                    </Button>
                </div>
            </Container>
        </div>
    );
}
