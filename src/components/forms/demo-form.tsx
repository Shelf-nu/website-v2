"use client";

import { useActionState, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { submitDemoForm, type DemoFormState } from "@/app/(marketing)/demo/actions";

/* ------------------------------------------------------------------ */
/*  Submit button with pending state                                   */
/* ------------------------------------------------------------------ */

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
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
    );
}

/* ------------------------------------------------------------------ */
/*  Field error display                                                */
/* ------------------------------------------------------------------ */

function FieldError({ error }: { error?: string }) {
    if (!error) return null;
    return <p className="text-sm text-red-600 mt-1">{error}</p>;
}

/* ------------------------------------------------------------------ */
/*  Demo form                                                          */
/* ------------------------------------------------------------------ */

export function DemoForm() {
    const [state, formAction] = useActionState<DemoFormState, FormData>(
        submitDemoForm,
        null,
    );

    const searchParams = useSearchParams();

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

    // Reset handler for success state
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        if (state?.success) {
            setShowForm(false);
        }
    }, [state]);

    const fieldErrors = state && !state.success ? state.fieldErrors : undefined;
    const formError = state && !state.success ? state.formError : undefined;

    /* ---------- Success state ---------- */
    if (!showForm && state?.success) {
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
                    onClick={() => setShowForm(true)}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                >
                    Submit another request
                </button>
            </div>
        );
    }

    /* ---------- Form state ---------- */
    return (
        <form action={formAction} className="space-y-4">
            {/* Form-level error banner */}
            {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {formError}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Jane"
                        required
                        aria-invalid={!!fieldErrors?.firstName}
                    />
                    <FieldError error={fieldErrors?.firstName} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        required
                        aria-invalid={!!fieldErrors?.lastName}
                    />
                    <FieldError error={fieldErrors?.lastName} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="jane@company.com"
                    required
                    aria-invalid={!!fieldErrors?.email}
                />
                <FieldError error={fieldErrors?.email} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="company">Company name</Label>
                <Input
                    id="company"
                    name="company"
                    placeholder="Acme Inc."
                    required
                    aria-invalid={!!fieldErrors?.company}
                />
                <FieldError error={fieldErrors?.company} />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">How can we help?</Label>
                <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your use case..."
                    className="min-h-[100px]"
                />
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

            <SubmitButton />

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
