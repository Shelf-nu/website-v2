"use client";

import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, Check } from "lucide-react";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { trackEvent, getLandingPage, getPagesViewed, getUtmParams } from "@/lib/analytics";
import { enrichCrispWithLead } from "@/lib/crisp";
import { cn } from "@/lib/utils";

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
/*  Step definitions                                                   */
/* ------------------------------------------------------------------ */

const STEPS = [
    { label: "Your info", fields: ["firstName", "lastName", "email"] },
    { label: "Your team", fields: ["company", "teamSize", "equipment"] },
    { label: "Your needs", fields: ["needs", "message", "heardAbout"] },
] as const;

/* ------------------------------------------------------------------ */
/*  Per-step validation schemas                                        */
/* ------------------------------------------------------------------ */

const step0Schema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
});

const step1Schema = z.object({
    company: z.string().min(1, "Company name is required"),
    teamSize: z.string().min(1, "Please select your team size"),
    equipment: z.string().min(1, "Please tell us what equipment you manage"),
});

const step2Schema = z.object({
    needs: z.array(z.string()).min(1, "Please select at least one option"),
    message: z.string().min(1, "Please tell us how we can help"),
    heardAbout: z.string().min(1, "Please let us know how you found us"),
});

/* Full schema for final submission */
const demoFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    company: z.string().min(1, "Company name is required"),
    teamSize: z.string().min(1, "Please select your team size"),
    equipment: z.string().min(1, "Please tell us what equipment you manage"),
    needs: z.array(z.string()).min(1, "Please select at least one option"),
    heardAbout: z.string().min(1, "Please let us know how you found us"),
    message: z.string().min(1, "Please tell us how we can help"),
});

type FormFields = z.infer<typeof demoFormSchema>;
type FieldErrors = Partial<Record<keyof FormFields, string>>;

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
/*  Progress bar                                                       */
/* ------------------------------------------------------------------ */

function StepProgress({ currentStep }: { currentStep: number }) {
    return (
        <div className="mb-6">
            {/* Step indicators */}
            <div className="flex items-center justify-between mb-2.5">
                {STEPS.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-2">
                        <div
                            className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300",
                                i < currentStep
                                    ? "bg-orange-600 text-white"
                                    : i === currentStep
                                      ? "bg-orange-600 text-white"
                                      : "bg-muted text-muted-foreground/60",
                            )}
                        >
                            {i < currentStep ? (
                                <Check className="h-3 w-3" />
                            ) : (
                                i + 1
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-xs hidden sm:inline transition-colors",
                                i === currentStep
                                    ? "text-foreground font-medium"
                                    : i < currentStep
                                      ? "text-muted-foreground"
                                      : "text-muted-foreground/60",
                            )}
                        >
                            {step.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="h-0.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                    className="h-full bg-orange-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Slide animation variants                                           */
/* ------------------------------------------------------------------ */

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 80 : -80,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? 80 : -80,
        opacity: 0,
    }),
};

/* ------------------------------------------------------------------ */
/*  Demo form                                                          */
/* ------------------------------------------------------------------ */

export function DemoForm() {
    const searchParams = useSearchParams();

    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const [pending, setPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formError, setFormError] = useState<string | undefined>();
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);

    // Accumulated form data across steps
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        teamSize: "",
        equipment: "",
        heardAbout: "",
        message: "",
    });

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

    function updateField(field: string, value: string) {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    /* ---------- Step validation ---------- */

    function validateCurrentStep(): boolean {
        setFieldErrors({});
        setFormError(undefined);

        let result;
        if (currentStep === 0) {
            result = step0Schema.safeParse(formData);
        } else if (currentStep === 1) {
            result = step1Schema.safeParse(formData);
        } else {
            result = step2Schema.safeParse({ ...formData, needs: selectedNeeds });
        }

        if (!result.success) {
            const errors: FieldErrors = {};
            result.error.issues.forEach((issue) => {
                const key = issue.path[0] as keyof FieldErrors;
                if (!errors[key]) errors[key] = issue.message;
            });
            setFieldErrors(errors);
            return false;
        }

        return true;
    }

    function goNext() {
        if (!validateCurrentStep()) return;
        setDirection(1);
        setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }

    function goBack() {
        setFieldErrors({});
        setFormError(undefined);
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }

    /* ---------- Enter key → Continue (not submit) on steps 0-1 ---------- */

    function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
        if (e.key === "Enter" && currentStep < STEPS.length - 1) {
            e.preventDefault();
            goNext();
        }
    }

    /* ---------- Final submission ---------- */

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Only submit on the last step
        if (currentStep < STEPS.length - 1) {
            goNext();
            return;
        }

        if (!validateCurrentStep()) return;

        setFieldErrors({});
        setFormError(undefined);

        // Honeypot check
        const form = e.currentTarget;
        const honeypot = new FormData(form).get("website");
        if (honeypot) {
            setSuccess(true);
            return;
        }

        // Build final data
        const raw = {
            ...formData,
            needs: selectedNeeds,
            heardAbout: formData.heardAbout || undefined,
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
            const utm = getUtmParams();
            trackEvent("demo_form_submit", {
                landing_page: getLandingPage(),
                pages_viewed: getPagesViewed().join(" → "),
                team_size: result.data.teamSize,
                heard_about: result.data.heardAbout || "",
                ...utm,
            });
            enrichCrispWithLead({ ...result.data, heardAbout: result.data.heardAbout || "" });
            setSuccess(true);
            return;
        }

        setPending(true);
        try {
            const body = {
                first_name: result.data.firstName,
                last_name: result.data.lastName,
                email: result.data.email,
                company_name: result.data.company,
                team_size: result.data.teamSize,
                equipment_type: result.data.equipment,
                interested_in: result.data.needs,
                hear_about_us: result.data.heardAbout || "",
                message: result.data.message,
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
                const utm = getUtmParams();
                trackEvent("demo_form_submit", {
                    landing_page: getLandingPage(),
                    pages_viewed: getPagesViewed().join(" → "),
                    team_size: result.data.teamSize,
                    heard_about: result.data.heardAbout || "",
                    ...utm,
                });
                enrichCrispWithLead({ ...result.data, heardAbout: result.data.heardAbout || "" });
                setSuccess(true);
                return;
            }

            // 400 — server-side validation errors
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
                    // Navigate to the step with the error
                    const errorFields = Object.keys(mapped);
                    for (let s = 0; s < STEPS.length; s++) {
                        if (STEPS[s].fields.some((f) => errorFields.includes(f))) {
                            setDirection(s < currentStep ? -1 : 1);
                            setCurrentStep(s);
                            break;
                        }
                    }
                    return;
                }
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
                        setCurrentStep(0);
                        setFormData({
                            firstName: "",
                            lastName: "",
                            email: "",
                            company: "",
                            teamSize: "",
                            equipment: "",
                            heardAbout: "",
                            message: "",
                        });
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
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
            {/* Form-level error banner */}
            {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {formError}
                </div>
            )}

            {/* Progress bar */}
            <StepProgress currentStep={currentStep} />

            {/* Step content with slide transitions */}
            <div className="relative min-h-[280px]">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="space-y-4"
                    >
                        {/* Step 0: Your info */}
                        {currentStep === 0 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First name<Required /></Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            placeholder="Jane"
                                            value={formData.firstName}
                                            onChange={(e) => updateField("firstName", e.target.value)}
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
                                            value={formData.lastName}
                                            onChange={(e) => updateField("lastName", e.target.value)}
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
                                        value={formData.email}
                                        onChange={(e) => updateField("email", e.target.value)}
                                        aria-invalid={!!fieldErrors.email}
                                    />
                                    <FieldError error={fieldErrors.email} />
                                </div>
                            </>
                        )}

                        {/* Step 1: Your team */}
                        {currentStep === 1 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="company">Company name<Required /></Label>
                                    <Input
                                        id="company"
                                        name="company"
                                        placeholder="Acme Inc."
                                        value={formData.company}
                                        onChange={(e) => updateField("company", e.target.value)}
                                        aria-invalid={!!fieldErrors.company}
                                        autoFocus
                                    />
                                    <FieldError error={fieldErrors.company} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="teamSize">Team size<Required /></Label>
                                    <select
                                        id="teamSize"
                                        name="teamSize"
                                        value={formData.teamSize}
                                        onChange={(e) => updateField("teamSize", e.target.value)}
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
                                    <Label htmlFor="equipment">What type of equipment do you manage?<Required /></Label>
                                    <Input
                                        id="equipment"
                                        name="equipment"
                                        placeholder="e.g. IT hardware, AV gear, tools, vehicles..."
                                        value={formData.equipment}
                                        onChange={(e) => updateField("equipment", e.target.value)}
                                        aria-invalid={!!fieldErrors.equipment}
                                    />
                                    <FieldError error={fieldErrors.equipment} />
                                </div>
                            </>
                        )}

                        {/* Step 2: Your needs */}
                        {currentStep === 2 && (
                            <>
                                <div className="space-y-3">
                                    <Label>What do you need most?<Required /></Label>
                                    <div className="space-y-2">
                                        {NEEDS_OPTIONS.map((need) => (
                                            <label
                                                key={need}
                                                className={cn(
                                                    "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                                                    selectedNeeds.includes(need)
                                                        ? "border-orange-200 bg-orange-50/30"
                                                        : "border-border hover:border-orange-200 hover:bg-muted/30",
                                                )}
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
                                    <Label htmlFor="message">How can we help?<Required /></Label>
                                    <Textarea
                                        id="message"
                                        name="message"
                                        placeholder="Tell us about your use case..."
                                        className="min-h-[80px]"
                                        value={formData.message}
                                        onChange={(e) => updateField("message", e.target.value)}
                                    />
                                    <FieldError error={fieldErrors.message} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="heardAbout">How did you hear about us?<Required /></Label>
                                    <Input
                                        id="heardAbout"
                                        name="heardAbout"
                                        placeholder="e.g. Google, a colleague, Product Hunt..."
                                        value={formData.heardAbout}
                                        onChange={(e) => updateField("heardAbout", e.target.value)}
                                    />
                                    <FieldError error={fieldErrors.heardAbout} />
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
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

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 pt-2">
                {currentStep > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={goBack}
                        className="gap-1.5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                )}

                <div className="flex-1" />

                {currentStep < STEPS.length - 1 ? (
                    <Button
                        type="button"
                        onClick={goNext}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-11 px-8"
                    >
                        Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        type="submit"
                        disabled={pending}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-11 px-8"
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
                )}
            </div>

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
