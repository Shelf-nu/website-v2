import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ALSO_IN_SHELF, COMPANION, PLATFORM_BOOKINGS, PLATFORM_TILES } from "@/data/home";
import { LinkRow } from "./link-row";
import { Shot } from "./shot";
import { SectionHead } from "./section-head";

const linkClass = "inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700";

function Facts({ items }: { items: string[] }) {
    return (
        <ul className="mt-6 space-y-3">
            {items.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-snug text-body">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" strokeWidth={2.5} aria-hidden="true" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

/** What Shelf does today: two feature moments, four tiles, and a link to every other feature. */
export function HomePlatform() {
    return (
        <section className="bg-background py-20 sm:py-24">
            <Container>
                <SectionHead
                    eyebrow="The platform"
                    title="Everything your gear needs, in one place."
                    lead="Shelf started as a tracker. Today it runs your equipment inventory, bookings, custody, kits and labels, plus a mobile app for the field, all on one asset record."
                />

                {/* Bookings */}
                <div className="mt-16 grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
                    <div className="overflow-hidden rounded-2xl bg-card shadow-xl shadow-black/5 ring-1 ring-border dark:shadow-black/30">
                        <Shot shot={PLATFORM_BOOKINGS} sizes="(max-width: 1023px) calc(100vw - 32px), 720px" className="h-auto w-full dark:brightness-90" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-orange-600">Bookings</p>
                        <h3 className="mt-3 text-2xl font-bold tracking-tight text-balance text-heading sm:text-3xl">See what&apos;s free, book it, and never double-book again.</h3>
                        <p className="mt-4 text-base leading-relaxed text-body">
                            Equipment scheduling on one availability timeline, for every asset and kit. Reserve a camera body for a shoot, a lecture hall&apos;s AV for a semester, or a truck&apos;s tool set for a week, and Shelf prevents double-bookings before they happen.
                        </p>
                        <Facts items={["Availability view across every asset and kit", "Kits book as one unit, partial check-ins when they come back in pieces", "PDF pull lists and calendar invites for every booking"]} />
                        <Link href="/features/bookings" className={`${linkClass} mt-7`}>
                            Explore bookings <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                    </div>
                </div>

                {/* Companion */}
                <div className="mt-20 grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
                    <div className="lg:order-2">
                        <div className="mx-auto grid max-w-md grid-cols-2 gap-4 rounded-[28px] bg-surface p-4 ring-1 ring-border sm:gap-5 sm:p-5">
                            {[COMPANION.audit, COMPANION.booking].map((shot) => (
                                <Image key={shot.src} src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(max-width: 640px) 45vw, 220px" className="h-auto w-full rounded-[14px] ring-1 ring-black/10" />
                            ))}
                        </div>
                    </div>
                    <div className="lg:order-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-orange-600">Shelf Companion</p>
                        <h3 className="mt-3 text-2xl font-bold tracking-tight text-balance text-heading sm:text-3xl">Scan, hand over, and audit. From the phone in your pocket.</h3>
                        <p className="mt-4 text-base leading-relaxed text-body">
                            The Companion app is where the field meets the record. Point the camera at a label and the asset opens; check it out to a person, log its location, or run through a room to confirm what&apos;s there.
                        </p>
                        <Facts items={["Scans Shelf QR labels, plus Code 128 and DataMatrix with the barcodes add-on", "Check in, check out and assign custody on the spot", "Free with every account, on iPhone and Android"]} />
                        <Link href="/mobile-app" className={`${linkClass} mt-7`}>
                            Get the app <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                    </div>
                </div>

                {/* Four more */}
                <div className="mt-20 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {PLATFORM_TILES.map((tile) => (
                        <Link key={tile.href} href={tile.href} className="group flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border transition-shadow duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30">
                            <div className="aspect-[16/10] overflow-hidden border-b border-border bg-surface">
                                <Shot shot={tile.shot} sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 50vw, 300px" className="h-full w-full object-cover object-left-top dark:brightness-90" />
                            </div>
                            <div className="flex flex-1 flex-col p-5">
                                <h4 className="text-base font-semibold text-heading">{tile.title}</h4>
                                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-caption">{tile.text}</p>
                                <span className={`${linkClass} mt-4`}>
                                    {tile.link} <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Every other feature page. These links carry the homepage's link equity: keep them. */}
                <LinkRow
                    label="Also in Shelf:"
                    items={ALSO_IN_SHELF}
                    trailing={
                        <Link href="/features" className={linkClass}>
                            All features <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                    }
                />
            </Container>
        </section>
    );
}
