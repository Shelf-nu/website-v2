import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Shelf",
    description: "Get in touch with our team.",
};

export default function ContactPage() {
    return (
        <Container className="py-20">
            <div className="mx-auto max-w-2xl text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
                    Contact Us
                </h1>
                <p className="text-xl text-muted-foreground mb-10">
                    Have questions? We'd love to hear from you.
                </p>
                <div className="grid gap-6">
                    <div className="rounded-lg border p-8">
                        <h3 className="text-lg font-semibold">Sales</h3>
                        <p className="mt-2 text-muted-foreground">
                            Interested in Shelf for your team?
                        </p>
                        <Button className="mt-4" variant="outline">Contact Sales</Button>
                    </div>
                    <div className="rounded-lg border p-8">
                        <h3 className="text-lg font-semibold">Support</h3>
                        <p className="mt-2 text-muted-foreground">
                            Need help with your account?
                        </p>
                        <Button className="mt-4" variant="outline">Contact Support</Button>
                    </div>
                </div>
            </div>
        </Container>
    );
}
