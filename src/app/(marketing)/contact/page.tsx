
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, MessageSquare } from "lucide-react";

export const metadata = {
    title: "Contact Us | Shelf Asset Management",
    description: "Get in touch with the Shelf team for support, sales, or general inquiries.",
};

export default function ContactPage() {
    return (
        <Container className="py-24 max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">Get in touch</h1>
            <p className="text-xl text-muted-foreground mb-12">
                We're here to help. Whether you have questions about pricing, features, or need technical support.
            </p>

            <div className="grid gap-8 md:grid-cols-2 text-left">
                <div className="rounded-2xl border p-8 bg-card">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100/50 mb-6">
                        <MessageSquare className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">Sales & General</h3>
                    <p className="text-muted-foreground mb-6">
                        Interested in Shelf for your team? Let's talk about your needs.
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/demo">Book a Demo</Link>
                    </Button>
                </div>

                <div className="rounded-2xl border p-8 bg-card">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100/50 mb-6">
                        <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">Support</h3>
                    <p className="text-muted-foreground mb-6">
                        Need help with your account or run into a bug?
                    </p>
                    <Button variant="outline" asChild className="w-full">
                        <Link href="mailto:support@shelf.nu">Email Support</Link>
                    </Button>
                </div>
            </div>

            <div className="mt-16 pt-16 border-t">
                <h3 className="font-semibold mb-4">Other ways to connect</h3>
                <div className="flex justify-center gap-6 text-muted-foreground">
                    <Link href="https://twitter.com/shelf_nu" className="hover:text-foreground">Twitter</Link>
                    <Link href="https://github.com/Shelf-nu/shelf.nu" className="hover:text-foreground">GitHub</Link>
                    <Link href="https://www.linkedin.com/company/shelf-nu" className="hover:text-foreground">LinkedIn</Link>
                </div>
            </div>
        </Container>
    );
}
