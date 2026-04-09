"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { trackEvent, getUtmParams } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

const quickSchema = z.object({
    email: z.string().email("Please enter a valid email"),
});

const fullSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    company: z.string().optional(),
    platform: z.enum(["ios", "android", "both"], {
        error: "Please select a platform",
    }),
    existingUser: z.boolean(),
});

type FullFields = z.infer<typeof fullSchema>;
type FieldErrors = Partial<Record<keyof FullFields, string>>;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function FieldError({ error }: { error?: string }) {
    if (!error) return null;
    return <p className="text-sm text-red-600 mt-1">{error}</p>;
}

function Required() {
    return <span className="text-red-500 ml-0.5">*</span>;
}

const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT || "";

const PLATFORM_OPTIONS = [
    { value: "ios", label: "iOS" },
    { value: "android", label: "Android" },
    { value: "both", label: "Both" },
] as const;

/* ------------------------------------------------------------------ */
/*  Quick inline email capture (for hero)                              */
/* ------------------------------------------------------------------ */

export function QuickWaitlistForm({ className }: { className?: string }) {
    const [email, setEmail] = useState("");
    const [pending, setPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | undefined>();

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(undefined);

        const honeypot = new FormData(e.currentTarget).get("website");
        if (honeypot) { setSuccess(true); return; }

        const result = quickSchema.safeParse({ email });
        if (!result.success) {
            setError(result.error.issues[0].message);
            return;
        }

        const utm = getUtmParams();
        if (!FORM_ENDPOINT) {
            trackEvent("mobile_app_waitlist_submit", { type: "quick", ...utm });
            setSuccess(true);
            return;
        }

        setPending(true);
        try {
            const res = await fetch(FORM_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: result.data.email,
                    source: "mobile_app_waitlist_quick",
                    source_url: window.location.href,
                    ...utm,
                }),
            });
            const data = await res.json();
            if (data.success) {
                trackEvent("mobile_app_waitlist_submit", { type: "quick", success: "true", ...utm });
            } else {
                trackEvent("mobile_app_waitlist_submit", { type: "quick", success: "false", ...utm });
            }
            setSuccess(true);
        } catch {
            trackEvent("mobile_app_waitlist_submit", { type: "quick", success: "error", ...utm });
            setSuccess(true);
        } finally {
            setPending(false);
        }
    }

    if (success) {
        return (
            <div className={cn("flex items-center gap-2 text-sm font-medium text-green-600", className)}>
                <CheckCircle2 className="h-4 w-4" />
                You&apos;re in! We&apos;ll be in touch.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={cn("flex flex-col sm:flex-row gap-3", className)}>
            <div className="flex-1">
                <Input
                    type="email"
                    placeholder="Enter your work email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(undefined); }}
                    aria-invalid={!!error}
                    className="h-12 bg-background"
                />
                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>
            <div className="hidden" aria-hidden="true">
                <input type="text" name="website" autoComplete="off" />
            </div>
            <Button
                type="submit"
                disabled={pending}
                className="h-12 px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold shrink-0"
            >
                {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>Get Early Access <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
            </Button>
        </form>
    );
}

/* ------------------------------------------------------------------ */
/*  Full waitlist form (for dedicated section)                         */
/* ------------------------------------------------------------------ */

export function WaitlistForm() {
    const searchParams = useSearchParams();

    const [pending, setPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState<string | undefined>();
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        platform: "" as string,
        existingUser: false,
    });

    const [sourceUrl, setSourceUrl] = useState("");
    const [utmParams, setUtmParams] = useState({
        utmSource: "",
        utmMedium: "",
        utmCampaign: "",
        utmTerm: "",
        utmContent: "",
    });

    useEffect(() => {
        setSourceUrl(window.location.href);
        setUtmParams({
            utmSource: searchParams.get("utm_source") ?? "",
            utmMedium: searchParams.get("utm_medium") ?? "",
            utmCampaign: searchParams.get("utm_campaign") ?? "",
            utmTerm: searchParams.get("utm_term") ?? "",
            utmContent: searchParams.get("utm_content") ?? "",
        });
    }, [searchParams]);

    function updateField(field: string, value: string | boolean) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFieldErrors({});
        setFormError(undefined);

        const form = e.currentTarget;
        const honeypot = new FormData(form).get("website");
        if (honeypot) { setSuccess(true); return; }

        const result = fullSchema.safeParse(formData);
        if (!result.success) {
            const errors: FieldErrors = {};
            result.error.issues.forEach((issue) => {
                const key = issue.path[0] as keyof FieldErrors;
                if (!errors[key]) errors[key] = issue.message;
            });
            setFieldErrors(errors);
            return;
        }

        const utm = getUtmParams();
        const eventProps = {
            type: "full",
            platform: result.data.platform,
            existing_user: String(result.data.existingUser),
            ...utm,
        };

        if (!FORM_ENDPOINT) {
            trackEvent("mobile_app_waitlist_submit", eventProps);
            setSuccess(true);
            return;
        }

        setPending(true);
        try {
            const body = {
                first_name: result.data.firstName,
                last_name: result.data.lastName,
                email: result.data.email,
                company_name: result.data.company || "",
                platform_preference: result.data.platform,
                existing_shelf_user: result.data.existingUser,
                source: "mobile_app_waitlist",
                source_url: sourceUrl,
                utm_source: utmParams.utmSource,
                utm_medium: utmParams.utmMedium,
                utm_campaign: utmParams.utmCampaign,
                utm_term: utmParams.utmTerm,
                utm_content: utmParams.utmContent,
            };

            const res = await fetch(FORM_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (data.success) {
                trackEvent("mobile_app_waitlist_submit", eventProps);
                setSuccess(true);
                return;
            }

            setFormError(
                data.error ||
                    "Something went wrong. Please try again or email us at hello@shelf.nu.",
            );
        } catch {
            setFormError(
                "Something went wrong. Please try again or email us at hello@shelf.nu.",
            );
        } finally {
            setPending(false);
        }
    }

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    You&apos;re on the list!
                </h3>
                <p className="text-muted-foreground text-sm">
                    We&apos;ll reach out when beta access opens for your platform.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {formError}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="waitlist-firstName">First name<Required /></Label>
                    <Input
                        id="waitlist-firstName"
                        name="firstName"
                        placeholder="Jane"
                        value={formData.firstName}
                        onChange={(e) => updateField("firstName", e.target.value)}
                        aria-invalid={!!fieldErrors.firstName}
                    />
                    <FieldError error={fieldErrors.firstName} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="waitlist-lastName">Last name<Required /></Label>
                    <Input
                        id="waitlist-lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => updateField("lastName", e.target.value)}
                        aria-invalid={!!fieldErrors.lastName}
                    />
                    <FieldError error={fieldErrors.lastName} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="waitlist-email">Work email<Required /></Label>
                <Input
                    id="waitlist-email"
                    name="email"
                    type="email"
                    placeholder="jane@company.com"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={!!fieldErrors.email}
                />
                <FieldError error={fieldErrors.email} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="waitlist-company">Company name</Label>
                <Input
                    id="waitlist-company"
                    name="company"
                    placeholder="Acme Inc. (optional)"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Platform preference<Required /></Label>
                <div className="flex gap-3">
                    {PLATFORM_OPTIONS.map((opt) => (
                        <label
                            key={opt.value}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors text-sm font-medium",
                                formData.platform === opt.value
                                    ? "border-orange-200 bg-orange-50/30 text-orange-700"
                                    : "border-border hover:border-orange-200 hover:bg-muted/30",
                            )}
                        >
                            <input
                                type="radio"
                                name="platform"
                                value={opt.value}
                                checked={formData.platform === opt.value}
                                onChange={(e) => updateField("platform", e.target.value)}
                                className="sr-only"
                            />
                            {opt.label}
                        </label>
                    ))}
                </div>
                <FieldError error={fieldErrors.platform} />
            </div>

            <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.existingUser}
                        onChange={(e) => updateField("existingUser", e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600" />
                </label>
                <span className="text-sm text-muted-foreground">I&apos;m an existing Shelf user</span>
            </div>

            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
                <label htmlFor="waitlist-website">Website</label>
                <input type="text" id="waitlist-website" name="website" autoComplete="off" />
            </div>

            <Button
                type="submit"
                disabled={pending}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold h-11"
            >
                {pending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>Join as a Founding Tester <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                We&apos;ll never share your email. Unsubscribe anytime.
            </p>
        </form>
    );
}
