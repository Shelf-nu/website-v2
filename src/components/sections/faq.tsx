"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface FAQItem {
    question: string;
    answer: React.ReactNode;
}

interface FAQSectionProps {
    title?: string;
    description?: string;
    items?: FAQItem[];
    className?: string;
}

const defaultFaqs: FAQItem[] = [
    {
        question: "What makes Shelf different from spreadsheets?",
        answer: "Spreadsheets are static and prone to error. Shelf is dynamic—it tracks availability in real-time, generates unique QR codes for every item, and keeps a complete history of every checkout and maintenance action automatically."
    },
    {
        question: "Can I import my existing data?",
        answer: "Yes. We offer a simple CSV importer that lets you bring in thousands of assets, contacts, and locations in minutes. We provide templates to make the process seamless."
    },
    {
        question: "Do I need special hardware?",
        answer: "No. Shelf works with any smartphone or tablet. Our mobile app (iOS and Android) lets you scan QR codes using your device's camera. You can also use standard USB scanners if you prefer."
    },
    {
        question: "How does the 'Open Source' part work?",
        answer: "Shelf is open source, meaning our code is publicly available for audit and contribution. We host the managed version (SaaS) so you don't have to worry about servers, updates, or security—but you never lose control of your data standard."
    },
    {
        question: "Is there a limit to how many users I can add?",
        answer: "Our Team and Enterprise plans allow for unlimited users. We believe asset management works best when everyone is accountable, so we don't penalize you for growing your team."
    }
];

export function FAQSection({
    title = "Frequently Asked Questions",
    description = "Everything you need to know about getting started with Shelf.",
    items = defaultFaqs,
    className
}: FAQSectionProps) {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": typeof item.answer === 'string' ? item.answer : "Check our documentation for more details."
            }
        }))
    };

    return (
        <section className={`py-24 sm:py-32 bg-white border-t border-zinc-100 ${className}`}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <Container>
                <ScrollReveal width="100%">
                    <div className="mx-auto max-w-2xl lg:max-w-4xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl mb-4">
                                {title}
                            </h2>
                            {description && (
                                <p className="text-lg text-zinc-500">
                                    {description}
                                </p>
                            )}
                        </div>

                        <Accordion type="single" collapsible className="w-full">
                            {items.map((faq, index) => (
                                <AccordionItem key={index} value={`item-${index}`} className="border-b border-zinc-200">
                                    <AccordionTrigger className="text-left text-lg font-medium text-zinc-900 data-[state=open]:text-orange-600 hover:text-orange-600 hover:no-underline py-6">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-zinc-600 text-[1.05rem] leading-relaxed pb-8">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
