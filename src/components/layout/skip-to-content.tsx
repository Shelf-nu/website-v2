import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SkipToContent() {
    return (
        <Link
            href="#main-content"
            className="fixed top-4 left-4 z-[100] -translate-y-[150%] transition-transform focus:translate-y-0"
        >
            <Button variant="secondary" className="shadow-lg border-primary border">
                Skip to content
            </Button>
        </Link>
    );
}
