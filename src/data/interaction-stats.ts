/**
 * Organization-level interaction counters for the site-wide JSON-LD payload.
 *
 * These power the `interactionStatistic` field on the homepage
 * `SoftwareApplication` schema. Keeping them here (rather than inlined in the
 * JsonLd component) makes the values easy to find and refresh.
 *
 * Refresh cadence: quarterly, or any time GitHub stars jump noticeably.
 *   - GitHub stars / forks:  https://github.com/Shelf-nu/shelf.nu
 *   - Registered users:      internal admin dashboard
 *
 * When you update these numbers, also bump `lastVerified` below.
 */

export const lastVerified = "2026-04-15";

export type InteractionStat = {
    /** schema.org interactionType URL */
    interactionType: string;
    userInteractionCount: number;
    name: string;
};

export const interactionStats: readonly InteractionStat[] = [
    {
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: 2562,
        name: "GitHub stars",
    },
    {
        interactionType: "https://schema.org/FollowAction",
        userInteractionCount: 286,
        name: "GitHub forks",
    },
    {
        interactionType: "https://schema.org/RegisterAction",
        userInteractionCount: 15910,
        name: "Registered users",
    },
];
