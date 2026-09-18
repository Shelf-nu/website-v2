import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { HOME_QUESTIONS } from "@/data/home";
import { AskTheTeamButton, QuestionItem } from "./question-item";

/**
 * The questions the team gets every week, answered where the doubts start
 * (right after the product section). Replaces the generic FAQ.
 *
 * The FAQPage JSON-LD is generated from the same list that is rendered, so
 * the schema always matches the visible text.
 */
export function HomeQuestions() {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: HOME_QUESTIONS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    };

    return (
        <section id="questions" className="border-t border-border bg-card py-20 sm:py-24">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <Container>
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-16 gap-y-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                    {/* On small screens the help box drops below the list (order), on large ones the column is sticky. */}
                    <div className="contents lg:sticky lg:top-28 lg:block lg:self-start">
                        <div className="flex flex-col items-start gap-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-orange-600">Frequently asked questions</p>
                            <h2 className="text-3xl font-bold tracking-tight text-balance text-heading sm:text-4xl">Questions we get every week.</h2>
                            <p className="text-base leading-relaxed text-caption sm:text-lg">Straight answers, fine print included.</p>
                        </div>
                        <div className="order-3 mt-5 rounded-xl bg-surface p-4 text-sm leading-relaxed text-muted-foreground ring-1 ring-border lg:mt-7">
                            <p>
                                <b className="font-semibold text-foreground">Didn&apos;t find yours?</b> Ask the team in chat, or search the knowledge base.
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-4">
                                <AskTheTeamButton className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground shadow-sm transition-transform duration-150 hover:bg-muted/60 active:scale-[0.96]" />
                                <Link href="/knowledge-base" className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
                                    Search the knowledge base <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="order-2 mt-5 lg:mt-0">
                        {HOME_QUESTIONS.map((item, index) => (
                            <QuestionItem
                                key={item.id}
                                id={item.id}
                                defaultOpen={index === 0}
                                summary={
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-base font-medium text-heading transition-colors hover:text-orange-600 group-open:text-orange-600 sm:py-6 sm:text-lg [&::-webkit-details-marker]:hidden">
                                        <h3 className="font-[inherit] text-[length:inherit]">{item.question}</h3>
                                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                                    </summary>
                                }
                            >
                                <div className="max-w-[65ch] pb-7">
                                    <p className="text-base leading-relaxed text-body">{item.answer}</p>
                                    <Link href={item.href} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700">
                                        {item.linkLabel} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                    </Link>
                                </div>
                            </QuestionItem>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
