"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Needs options (multi-select checkboxes)                            */
/* ------------------------------------------------------------------ */

const NEEDS_OPTIONS = [
    "Track and manage my inventory",
    "Assign equipment to team members",
    "Book and schedule equipment",
    "Run audits and reports",
    "Automate check-in/check-out",
] as const;

const TEAM_SIZE_OPTIONS = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "500+",
] as const;

/* ------------------------------------------------------------------ */
/*  Validation schema (client-side)                                    */
/* ------------------------------------------------------------------ */

const demoFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    company: z.string().min(1, "Company name is required"),
    teamSize: z.string().min(1, "Please select your team size"),
    equipment: z.string().min(1, "Please tell us what equipment you manage"),
    needs: z.array(z.string()).min(1, "Please select at least one option"),
    heardAbout: z.string().min(1, "Please tell us how you heard about us"),
    message: z.string().min(1, "Please tell us how we can help"),
});

type FormFields = z.infer<typeof demoFormSchema>;
type FieldErrors = Partial<Record<keyof FormFields, string>>;

/* ------------------------------------------------------------------ */
/*  Field error display                                                */
/* ------------------------------------------------------------------ */

function FieldError({ error }: { error?: string }) {
    if (!error) return null;
    return <p className="text-sm text-red-600 mt-1">{error}</p>;
}

function Required() {
    return <span className="text-red-500 ml-0.5">*</span>;
}

/* ------------------------------------------------------------------ */
/*  Form endpoint                                                      */
/* ------------------------------------------------------------------ */

const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT || "";

/* ------------------------------------------------------------------ */
/*  Server ↔ client field-name mapping                                 */
/*  Server uses snake_case; client uses camelCase.                     */
/* ------------------------------------------------------------------ */

/** Map server error field names → client form field names */
const SERVER_TO_CLIENT: Record<string, keyof FormFields> = {
    first_name: "firstName",
    last_name: "lastName",
    email: "email",
    company_name: "company",
    team_size: "teamSize",
    equipment_type: "equipment",
    interested_in: "needs",
    hear_about_us: "heardAbout",
    message: "message",
};

/* ------------------------------------------------------------------ */
/*  Demo form                                                          */
/* ------------------------------------------------------------------ */

export function DemoForm() {
    const searchParams = useSearchParams();

    const [pending, setPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState<string | undefined>();
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);

    // Capture source URL and UTM params on mount (client-side only)
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

    function toggleNeed(need: string) {
        setSelectedNeeds((prev) =>
            prev.includes(need)
                ? prev.filter((n) => n !== need)
                : [...prev, need],
        );
    }

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setFieldErrors({});
        setFormError(undefined);

        const formData = new FormData(e.currentTarget);

        // Honeypot check — if filled, silently "succeed"
        if (formData.get("website")) {
            setSuccess(true);
            return;
        }

        // Client-side validation
        const raw = {
            firstName: formData.get("firstName") as string,
            lastName: formData.get("lastName") as string,
            email: formData.get("email") as string,
            company: formData.get("company") as string,
            teamSize: formData.get("teamSize") as string,
            equipment: formData.get("equipment") as string,
            needs: selectedNeeds,
            heardAbout: formData.get("heardAbout") as string,
            message: formData.get("message") as string,
        };

        const result = demoFormSchema.safeParse(raw);
        if (!result.success) {
            const errors: FieldErrors = {};
            result.error.issues.forEach((issue) => {
                const key = issue.path[0] as keyof FieldErrors;
                if (!errors[key]) errors[key] = issue.message;
            });
            setFieldErrors(errors);
            return;
        }

        // Submit to external endpoint
        if (!FORM_ENDPOINT) {
            // No endpoint configured — show success anyway (dev/static fallback)
            setSuccess(true);
            return;
        }

        setPending(true);
        try {
            // Map client field names → server snake_case field names
            const body = {
                first_name: result.data.firstName,
                last_name: result.data.lastName,
                email: result.data.email,
                company_name: result.data.company,
                team_size: result.data.teamSize,
                equipment_type: result.data.equipment,
                interested_in: result.data.needs, // array, not comma-joined
                hear_about_us: result.data.heardAbout,
                message: result.data.message,
                // Extra tracking fields (endpoint can ignore if not needed)
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
                setSuccess(true);
                return;
            }

            // 400 — server-side validation errors (keyed by snake_case field names)
            if (data.errors && typeof data.errors === "object") {
                const mapped: FieldErrors = {};
                for (const [serverField, msg] of Object.entries(data.errors)) {
                    const clientField = SERVER_TO_CLIENT[serverField];
                    if (clientField) {
                        mapped[clientField] = msg as string;
                    }
                }
                if (Object.keys(mapped).length > 0) {
                    setFieldErrors(mapped);
                    return;
                }
            }

            // 405 / 415 / 500 — generic error string
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

    /* ---------- Success state ---------- */
    if (success) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                    Thanks! We&apos;ll be in touch shortly.
                </h3>
                <p className="text-muted-foreground mb-6">
                    Check your inbox for a confirmation.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        setSuccess(false);
                        setFieldErrors({});
                        setFormError(undefined);
                        setSelectedNeeds([]);
                    }}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                    Submit another request
                </button>
            </div>
        );
    }

    /* ---------- Form state ---------- */
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form-level error banner */}
            {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {formError}
                </div>
            )}

            <p className="text-xs text-muted-foreground"><span className="text-red-500">*</span> All fields are required</p>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First name<Required /></Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Jane"
                        required
                        aria-invalid={!!fieldErrors.firstName}
                    />
                    <FieldError error={fieldErrors.firstName} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last name<Required /></Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        required
                        aria-invalid={!!fieldErrors.lastName}
                    />
                    <FieldError error={fieldErrors.lastName} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Work email<Required /></Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@company.com"
                    required
                    aria-invalid={!!fieldErrors.email}
                />
                <FieldError error={fieldErrors.email} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="company">Company name<Required /></Label>
                <Input
                    id="company"
                    name="company"
                    placeholder="Acme Inc."
                    required
                    aria-invalid={!!fieldErrors.company}
                />
                <FieldError error={fieldErrors.company} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="teamSize">Team size<Required /></Label>
                <select
                    id="teamSize"
                    name="teamSize"
                    required
                    defaultValue=""
                    aria-invalid={!!fieldErrors.teamSize}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="" disabled>Select team size…</option>
                    {TEAM_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>{size}</option>
                    ))}
                </select>
                <FieldError error={fieldErrors.teamSize} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="equipment">What type of equipment are you mainly managing?<Required /></Label>
                <Input
                    id="equipment"
                    name="equipment"
                    placeholder="e.g. IT hardware, AV gear, tools, vehicles..."
                    required
                    aria-invalid={!!fieldErrors.equipment}
                />
                <FieldError error={fieldErrors.equipment} />
            </div>

            <div className="space-y-3">
                <Label>What do you need the most from an asset management system?<Required /></Label>
                <div className="space-y-2">
                    {NEEDS_OPTIONS.map((need) => (
                        <label
                            key={need}
                            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                                selectedNeeds.includes(need)
                                    ? "border-orange-300 bg-orange-50/50"
                                    : "border-border hover:border-orange-200 hover:bg-muted/30"
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={selectedNeeds.includes(need)}
                                onChange={() => toggleNeed(need)}
                                className="h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500"
                            />
                            <span className="text-sm font-medium">{need}</span>
                        </label>
                    ))}
                </div>
                <FieldError error={fieldErrors.needs} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="heardAbout">How did you hear about us?<Required /></Label>
                <Input
                    id="heardAbout"
                    name="heardAbout"
                    placeholder="e.g. Google, a colleague, Product Hunt..."
                    required
                    aria-invalid={!!fieldErrors.heardAbout}
                />
                <FieldError error={fieldErrors.heardAbout} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">How can we help?<Required /></Label>
                <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your use case..."
                    className="min-h-[100px]"
                    required
                />
                <FieldError error={fieldErrors.message} />
            </div>

            {/* Honeypot — hidden from humans, bots auto-fill it */}
            <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                    type="text"
                    id="website"
                    name="website"
                    autoComplete="off"
                />
            </div>

            {/* Hidden fields: source URL + UTM params */}
            <input type="hidden" name="sourceUrl" value={sourceUrl} />
            <input type="hidden" name="utmSource" value={utmParams.utmSource} />
            <input type="hidden" name="utmMedium" value={utmParams.utmMedium} />
            <input type="hidden" name="utmCampaign" value={utmParams.utmCampaign} />
            <input type="hidden" name="utmTerm" value={utmParams.utmTerm} />
            <input type="hidden" name="utmContent" value={utmParams.utmContent} />

            <Button
                type="submit"
                disabled={pending}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold h-11"
            >
                {pending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting…
                    </>
                ) : (
                    <>
                        Book Demo <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
                By booking a demo, you agree to our{" "}
                <a href="/terms" className="underline underline-offset-2">
                    Terms of Service
                </a>
                .
            </p>
        </form>
    );
}
