import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { AskTheTeamButton, QuestionItem } from "@/components/sections/home/question-item";
import { cn } from "@/lib/utils";

export interface QuestionEntry {
    /** Stable id, sent as the `question` prop of the `question_open` event */
    id: string;
    question: string;
    answer: string;
    /** Optional "read more" link under the answer */
    href?: string;
    linkLabel?: string;
}

interface QuestionsSectionProps {
    /** Page name sent with the `question_open` event, e.g. "home", "pricing", "mobile-app" */
    page: string;
    eyebrow: string;
    title: string;
    lead?: string;
    items: QuestionEntry[];
    /** Opens the first question by default (true on the homepage) */
    openFirst?: boolean;
    id?: string;
    className?: string;
}

/**
 * The "questions we get" pattern shared by the homepage, pricing and the
 * app page: a sticky heading column with an "ask the team" box, and a
 * native <details> list, so every answer is in the static HTML.
 *
 * The FAQPage JSON-LD is generated from the same list that is rendered,
 * so the schema always matches the visible text.
 */
export function QuestionsSection({ page, eyebrow, title, lead, items, openFirst = false, id = "questions", className }: QuestionsSectionProps) {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    };

    return (
        <section id={id} className={cn("border-t border-border bg-card py-20 sm:py-24", className)}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <Container>
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-16 gap-y-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                    {/* On small screens the help box drops below the list (order); on large ones the column is sticky. */}
                    <div className="contents lg:sticky lg:top-28 lg:block lg:self-start">
                        <div className="flex flex-col items-start gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-orange-600">{eyebrow}</p>
                            <h2 className="text-3xl font-bold tracking-tight text-balance text-heading sm:text-4xl">{title}</h2>
                            {lead && <p className="text-base leading-relaxed text-caption sm:text-lg">{lead}</p>}
                        </div>
                        <div className="order-3 mt-5 rounded-xl bg-surface p-4 text-sm leading-relaxed text-muted-foreground ring-1 ring-border lg:mt-7">
                            <p>
                                <b className="font-semibold text-foreground">Didn&apos;t find yours?</b> Ask the team in chat, or search the knowledge base.
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-4">
                                <AskTheTeamButton page={page} className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-transform duration-150 hover:bg-muted/60 active:scale-[0.96]" />
                                <Link href="/knowledge-base" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
                                    Search the knowledge base <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="order-2 mt-5 lg:mt-0">
                        {items.map((item, index) => (
                            <QuestionItem
                                key={item.id}
                                id={item.id}
                                page={page}
                                defaultOpen={openFirst && index === 0}
                                summary={
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-medium text-heading transition-colors hover:text-orange-600 group-open:text-orange-600 sm:py-6 sm:text-lg [&::-webkit-details-marker]:hidden">
                                        <h3 className="font-[inherit] text-[length:inherit]">{item.question}</h3>
                                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                                    </summary>
                                }
                            >
                                {/* Answers are in the HTML for Google, but kept out of on-site search: the old
                                    accordion never rendered them, and indexing them doubled the pricing page's
                                    text, which pushed /pricing to #4 for "pricing" (search-quality suite). */}
                                <div className="max-w-[65ch] pb-7" data-pagefind-ignore>
                                    <p className="whitespace-pre-line text-base leading-relaxed text-body">{item.answer}</p>
                                    {item.href && item.linkLabel && (
                                        <Link href={item.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
                                            {item.linkLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                        </Link>
                                    )}
                                </div>
                            </QuestionItem>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
