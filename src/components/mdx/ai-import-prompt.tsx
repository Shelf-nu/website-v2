"use client";

import { useState } from "react";
import { Check, ChevronDown, Copy, FileSpreadsheet } from "lucide-react";
import { IMPORT_PROMPT } from "@/data/import-prompt";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const STEPS = ["Copy the prompt", "Paste it into your AI with your spreadsheet attached", "Upload the CSV it returns in Assets → Import"];

/**
 * "Let your AI clean up your spreadsheet": a copyable prompt that carries
 * Shelf's CSV import rules, so ChatGPT, Claude or Gemini can turn any export
 * into an importable file. Used on the CSV import guide and /migrate.
 * `location` says where the copy happened (import_prompt_copy event).
 */
export function AiImportPrompt({ location = "unknown", className }: { location?: string; className?: string }) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(IMPORT_PROMPT);
            setCopied(true);
            setTimeout(() => setCopied(false), 2200);
            trackEvent("import_prompt_copy", { location });
        } catch {
            // Clipboard unavailable (insecure context, older browser): the prompt stays selectable below.
            setExpanded(true);
        }
    }

    return (
        <div className={cn("not-prose my-8 rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6", className)}>
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-100 dark:bg-orange-950/40 dark:ring-orange-900/40">
                    <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-orange-600">Import with your AI assistant</p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight text-heading">Let your AI clean up your spreadsheet</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        This prompt knows Shelf&apos;s import format. Paste it into ChatGPT, Claude or Gemini with your export attached, and you get back a file that is ready to upload, plus a list of anything it couldn&apos;t match.
                    </p>
                </div>
            </div>

            <ol className="mt-5 grid gap-2 sm:grid-cols-3">
                {STEPS.map((step, i) => (
                    <li key={step} className="flex items-start gap-2.5 rounded-xl bg-muted/50 px-3 py-2.5 text-sm leading-snug text-body">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold text-heading ring-1 ring-border">{i + 1}</span>
                        {step}
                    </li>
                ))}
            </ol>

            {/* The prompt repeats the guide's rules word for word, so it stays out of on-site search. */}
            <div className="relative mt-4" data-pagefind-ignore>
                <pre
                    aria-label="The import prompt"
                    className={cn(
                        "overflow-hidden whitespace-pre-wrap break-words rounded-xl bg-muted/60 p-4 font-mono text-xs leading-relaxed text-muted-foreground ring-1 ring-border/60",
                        expanded ? "max-h-none" : "max-h-40",
                    )}
                >
                    {IMPORT_PROMPT}
                </pre>
                {!expanded && <div className="pointer-events-none absolute inset-x-px bottom-px h-16 rounded-b-xl bg-gradient-to-t from-muted to-transparent" />}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                <button
                    type="button"
                    onClick={copy}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-150 hover:bg-orange-700 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                >
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    <span aria-live="polite">{copied ? "Copied" : "Copy prompt"}</span>
                </button>
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    aria-expanded={expanded}
                    className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                    {expanded ? "Show less" : "Read the full prompt"}
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} aria-hidden="true" />
                </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Check your organization&apos;s policy before sharing inventory data with an AI assistant. The prompt runs in your AI, not in Shelf, and Shelf never sees what you paste.
            </p>
        </div>
    );
}
