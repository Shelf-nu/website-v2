import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FEATURED_STORIES, MINI_STORIES, MORE_STORIES } from "@/data/home";
import { LinkRow } from "./link-row";
import { SectionHead } from "./section-head";

const readLink = "inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 group-hover:text-orange-700";

function Company({ logo, company, descriptor }: { logo: string; company: string; descriptor: string }) {
    return (
        <div className="flex items-center gap-3">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-border">
                <Image src={logo} alt={company} fill sizes="40px" className="object-contain p-1.5" />
            </span>
            <span className="flex flex-col">
                <b className="text-sm font-semibold text-heading">{company}</b>
                <span className="text-xs text-caption">{descriptor}</span>
            </span>
        </div>
    );
}

/** Who says so: two featured stories with real media, three result-led cards, and a link to every other story. */
export function HomeStories() {
    return (
        <section className="bg-background py-20 sm:py-24">
            <Container>
                <SectionHead
                    eyebrow="Customer stories"
                    title="Real teams, real numbers."
                    lead="From an antique mall in Illinois to a flight program in Indiana, the teams tell it better than we can."
                />

                <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {FEATURED_STORIES.map((story) => (
                        <Link key={story.id} href={story.href} className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-shadow duration-200 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/30">
                            <div className="relative aspect-[16/9] overflow-hidden bg-neutral-900">
                                <Image src={story.shot.src} alt={story.shot.alt} width={story.shot.width} height={story.shot.height} sizes="(max-width: 1024px) 100vw, 620px" className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]" />
                                {story.isVideo && (
                                    <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg">
                                        <Play className="ml-0.5 h-4 w-4 fill-orange-600 text-orange-600" aria-hidden="true" />
                                    </span>
                                )}
                                {story.credit && <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">{story.credit}</span>}
                            </div>
                            <div className="flex flex-1 flex-col p-6 sm:p-8">
                                <Company logo={story.logo} company={story.company} descriptor={story.descriptor} />
                                <q className="mt-5 block flex-1 text-lg font-medium leading-relaxed text-pretty text-heading sm:text-xl">{story.quote}</q>
                                <p className="mt-4 text-sm text-caption">
                                    <b className="font-semibold text-heading">{story.author}</b>, {story.role}
                                </p>
                                {story.numbers && (
                                    <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-border-subtle pt-5">
                                        {story.numbers.map((n) => (
                                            <div key={n.label}>
                                                <dt className="sr-only">{n.label}</dt>
                                                <dd className="text-xl font-bold tracking-tight text-heading sm:text-2xl">{n.value}</dd>
                                                <dd className="mt-1 text-xs leading-snug text-caption">{n.label}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                )}
                                <span className={`${readLink} mt-6`}>
                                    Read the story <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                    {MINI_STORIES.map((story) => (
                        <Link key={story.id} href={story.href} className="group flex flex-col rounded-2xl bg-card p-6 ring-1 ring-border transition-shadow duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30">
                            <Company logo={story.logo} company={story.company} descriptor={story.descriptor} />
                            <p className="mt-5 text-lg font-semibold leading-snug text-heading">
                                {story.result[0]}
                                <em className="not-italic text-orange-600">{story.result[1]}</em>
                                {story.result[2]}
                            </p>
                            <p className="mt-3 flex-1 text-sm leading-relaxed text-caption">{story.text}</p>
                            {story.by && <p className="mt-3 text-xs font-medium text-muted-foreground">{story.by}</p>}
                            <span className={`${readLink} mt-5`}>
                                Read story <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                            </span>
                        </Link>
                    ))}
                </div>

                {/* Every other case study the homepage linked to before. Keep them: see src/data/home.ts. */}
                <LinkRow label="More stories:" items={MORE_STORIES} />

                <div className="mt-8 text-center">
                    <Button variant="outline" size="lg" asChild>
                        <Link href="/case-studies">View all case studies</Link>
                    </Button>
                </div>
            </Container>
        </section>
    );
}
