import { Check, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { WHY_SWITCH } from "@/data/home";
import { SectionHead } from "./section-head";

/** Why teams switch: the before and after, in the words teams use when they arrive. */
export function HomeWhySwitch() {
    return (
        <section className="border-b border-border bg-surface py-20 sm:py-24">
            <Container>
                <SectionHead
                    eyebrow="Why teams switch"
                    title="Sign-out sheets don't scale. Spreadsheets don't scan."
                    lead="Most teams arrive from a shared spreadsheet, a clipboard, or one person's memory. This is what changes."
                />

                <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-background/60 p-6 sm:p-8">
                        <h3 className="text-sm font-semibold text-muted-foreground">Spreadsheets and sign-out sheets</h3>
                        <ul className="mt-5 space-y-3.5">
                            {WHY_SWITCH.before.map((item) => (
                                <li key={item} className="flex gap-3 text-[15px] leading-snug text-muted-foreground">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                        <X className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl bg-card p-6 shadow-xl shadow-black/5 ring-1 ring-border sm:p-8 dark:shadow-black/30">
                        <h3 className="text-sm font-semibold text-heading">Shelf</h3>
                        <ul className="mt-5 space-y-3.5">
                            {WHY_SWITCH.after.map((item) => (
                                <li key={item} className="flex gap-3 text-[15px] leading-snug text-heading">
                                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                                        <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Container>
        </section>
    );
}
