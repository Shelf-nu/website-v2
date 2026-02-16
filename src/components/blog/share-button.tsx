"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShareButton() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className={cn(
                "gap-2 transition-all duration-300",
                copied ? "text-green-600 border-green-200 bg-green-50" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={handleCopy}
        >
            {copied ? (
                <>
                    <Check className="h-4 w-4" />
                    <span className="sr-only">Copied</span>
                    <span className="text-xs font-medium">Copied</span>
                </>
            ) : (
                <>
                    <Link2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Share</span>
                </>
            )}
        </Button>
    );
}
