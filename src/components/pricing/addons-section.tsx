"use client";

import Link from "next/link";
import { Barcode, Check, ClipboardCheck, KeyRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";
import {
    addOns,
    formatAddOnPrice,
    formatUSD,
    type AddOn,
} from "@/data/pricing.addons";

const ICONS: Record<string, LucideIcon> = {
    audits: ClipboardCheck,
    "alternative-barcodes": Barcode,
    sso: KeyRound,
};

function PriceLine({ addOn, isYearly }: { addOn: AddOn; isYearly: boolean }) {
    const price = formatAddOnPrice(addOn, isYearly);

    // Per-seat add-ons carry their own band table below, so the headline is
    // just the entry rate. Flat add-ons get the "billed annually as" line that
    // matches how the plan cards above render yearly pricing.
    const showAnnualTotal =
        isYearly && !addOn.tiers && addOn.priceYearly !== null;

    // No monthly price exists for this add-on — say so rather than letting the
    // annual figure read as a monthly one.
    const monthlyUnavailable =
        !isYearly && !addOn.tiers && addOn.priceMonthly === null;

    return (
        <div className="mb-5 pb-5 border-b border-border-subtle">
            <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-heading">
                    {price}
                </span>
            </div>
            {showAnnualTotal && (
                <p className="text-caption text-xs mt-1.5">
                    billed annually as {formatUSD(addOn.priceYearly!)}/yr
                </p>
            )}
            {monthlyUnavailable && (
                <p className="text-caption text-xs mt-1.5">annual billing only</p>
            )}
            {addOn.tiers && (
                <p className="text-caption text-xs mt-1.5">
                    priced per user who signs in via SSO
                </p>
            )}
        </div>
    );
}

function TierTable({ addOn }: { addOn: AddOn }) {
    if (!addOn.tiers) return null;

    // overflow-x-auto, not overflow-hidden: the table fits at 375px today
    // (291px of 311px available), but a longer band label or a larger base
    // font would otherwise be silently clipped rather than scrollable.
    return (
        <div className="mb-5 rounded-lg border border-border-subtle overflow-x-auto">
            <table className="w-full text-[12px]">
                <thead>
                    <tr className="bg-muted/40">
                        <th className="text-left font-semibold text-caption px-3 py-2">
                            Users
                        </th>
                        <th className="text-right font-semibold text-caption px-3 py-2">
                            Annual
                        </th>
                        <th className="text-right font-semibold text-caption px-3 py-2">
                            Monthly
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {addOn.tiers.map((tier) => (
                        <tr key={tier.label} className="border-t border-border-subtle">
                            <td className="px-3 py-2 text-body font-medium">
                                {tier.to === null
                                    ? `${tier.from}+`
                                    : `${tier.from}–${tier.to}`}
                            </td>
                            <td className="px-3 py-2 text-right text-body tabular-nums">
                                {formatUSD(tier.yearlyPerUser)}
                            </td>
                            <td className="px-3 py-2 text-right text-caption tabular-nums">
                                {tier.monthlyPerUser === null
                                    ? "—"
                                    : formatUSD(tier.monthlyPerUser)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="text-[11px] text-caption px-3 py-2 bg-muted/20 border-t border-border-subtle leading-relaxed">
                Per user, per month. Bands are cumulative — the first{" "}
                {addOn.tiers[0].to} always bill at the first-tier rate. Bands above
                the first are annual billing only.
                {addOn.unlimitedEnquiryThreshold && (
                    <>
                        {" "}
                        Above roughly {addOn.unlimitedEnquiryThreshold} users an
                        unlimited-user licence usually works out cheaper — ask us for
                        a quote.
                    </>
                )}
            </p>
        </div>
    );
}

export function AddOnsSection({ isYearly }: { isYearly: boolean }) {
    return (
        <div className="max-w-[1400px] mx-auto mt-24">
            <div className="text-center mb-12">
                <Badge
                    variant="secondary"
                    className="mb-4 bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-100/50 dark:border-orange-900/50"
                >
                    Add-ons
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight">
                    Extend your workspace
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Add-ons attach to any Team workspace and can be turned on or off
                    anytime from your workspace settings — you are never locked in. Add
                    one mid-cycle on annual billing and you are charged only for the time
                    remaining until your renewal.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {addOns.map((addOn) => {
                    const Icon = ICONS[addOn.id];
                    return (
                        <div
                            key={addOn.id}
                            className="flex flex-col rounded-xl border border-border-subtle bg-card/50 hover:bg-card hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg transition-all duration-300 p-6"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                {Icon && (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/50">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight text-heading leading-tight">
                                        {addOn.name}
                                    </h3>
                                    <p className="text-xs text-caption">
                                        {addOn.availableOn} plan
                                    </p>
                                </div>
                            </div>

                            {/* Slot is always rendered, badge or not, so the price
                                lines stay on the same baseline across all three
                                cards — a conditional badge shifted this card's
                                price 34px below its neighbours. */}
                            <div className="mb-3 flex h-[22.5px] items-center">
                                {addOn.badge && (
                                    <Badge
                                        variant="secondary"
                                        className="w-fit bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border-orange-100/50 dark:border-orange-900/50 text-[11px] font-semibold"
                                    >
                                        {addOn.badge}
                                    </Badge>
                                )}
                            </div>

                            <p className="text-sm text-caption leading-normal mb-5">
                                {addOn.tagline}
                            </p>

                            <PriceLine addOn={addOn} isYearly={isYearly} />

                            <TierTable addOn={addOn} />

                            <ul className="space-y-2.5 mb-6 flex-1">
                                {addOn.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start text-[13px] text-body font-medium leading-snug"
                                    >
                                        <Check className="mr-2.5 h-3.5 w-3.5 text-orange-600 mt-0.5 flex-shrink-0 stroke-[3px]" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Migration prompt — doubles as internal linking on
                                "moving from <competitor>" intent, which is the
                                actual job this add-on gets hired for. */}
                            {addOn.migrationFrom && (
                                <p className="mb-5 text-[12px] text-caption leading-relaxed">
                                    Moving from{" "}
                                    {addOn.migrationFrom.map((tool, i, arr) => (
                                        <span key={tool.slug}>
                                            <Link
                                                href={`/alternatives/${tool.slug}`}
                                                className="underline underline-offset-2 hover:text-orange-600"
                                            >
                                                {tool.name}
                                            </Link>
                                            {i < arr.length - 2 ? ", " : i === arr.length - 2 ? " or " : ""}
                                        </span>
                                    ))}
                                    ? Keep the labels already on your assets — no
                                    re-tagging, no relabelling day.
                                </p>
                            )}

                            <div className="mt-auto flex flex-col gap-2.5">
                                {addOn.salesCta && (
                                    <Button variant="outline" className="w-full" asChild>
                                        <Link
                                            href={addOn.salesCta.href}
                                            onClick={() =>
                                                trackEvent("demo_cta", {
                                                    location: addOn.salesCta!.location,
                                                })
                                            }
                                        >
                                            {addOn.salesCta.label}
                                        </Link>
                                    </Button>
                                )}
                                {addOn.href && (
                                    <Button variant="ghost" className="w-full" asChild>
                                        <Link href={addOn.href}>Learn more</Link>
                                    </Button>
                                )}
                                <p className="text-[11px] text-caption text-center leading-relaxed">
                                    {addOn.freeInTrial
                                        ? "Free to enable during your 7-day Team trial"
                                        : "Set up together with our team on a paid plan"}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}
