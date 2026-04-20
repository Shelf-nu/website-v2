"use client";

import { Check, Copy } from "lucide-react";
import { Children, isValidElement, useState, type ReactNode } from "react";

function extractText(node: ReactNode): string {
    if (node == null || typeof node === "boolean") return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (isValidElement<{ children?: ReactNode }>(node)) return extractText(node.props.children);
    return "";
}

function extractLanguage(node: ReactNode): string | null {
    if (!isValidElement<{ className?: string }>(node)) return null;
    const match = /language-([\w-]+)/.exec(node.props.className ?? "");
    return match ? match[1] : null;
}

const LANGUAGE_LABELS: Record<string, string> = {
    bash: "Shell",
    sh: "Shell",
    zsh: "Shell",
    js: "JavaScript",
    javascript: "JavaScript",
    ts: "TypeScript",
    typescript: "TypeScript",
    tsx: "TSX",
    jsx: "JSX",
    json: "JSON",
    yml: "YAML",
    yaml: "YAML",
    md: "Markdown",
    mdx: "MDX",
    html: "HTML",
    css: "CSS",
    py: "Python",
    python: "Python",
    sql: "SQL",
    csv: "CSV",
    text: "Text",
    txt: "Text",
    plaintext: "Text",
    prompt: "Prompt",
};

export function CodeBlock({ children }: { children?: ReactNode }) {
    const [copied, setCopied] = useState(false);

    const codeChild = Children.toArray(children).find(isValidElement);
    const language = extractLanguage(codeChild);
    const label = language ? LANGUAGE_LABELS[language] ?? language : null;
    const text = extractText(children);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch {
            // Clipboard unavailable (insecure context, older browser) — fail silently.
        }
    }

    return (
        <div className="not-prose group relative my-6 overflow-hidden rounded-xl bg-zinc-950 ring-1 ring-white/10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                    {label ?? "Code"}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={copied ? "Copied" : "Copy code"}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                >
                    {copied ? (
                        <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <pre className="overflow-x-auto px-5 py-4 text-[13.5px] leading-relaxed text-zinc-100 [&>code]:bg-transparent [&>code]:p-0 [&>code]:font-mono [&>code]:font-normal [&>code]:text-inherit">
                {children}
            </pre>
        </div>
    );
}
