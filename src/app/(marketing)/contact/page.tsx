import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Metadata } from "next";
import { Mail, MessageSquare, MapPin } from "lucide-react";

export const metadata: Metadata = {
    title: "Contact Us - Shelf Asset Management",
    description: "Get in touch with the Shelf team.",
};

export default function ContactPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Container className="py-20 md:py-32">
                <div className="mx-auto max-w-2xl text-center mb-16">
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                        Get in touch
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        We stick to our mission of being simple and accessible.
                        That includes being easy to reach.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
                    <Card className="text-center p-6">
                        <CardContent className="pt-6">
                            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Email</h3>
                            <p className="text-muted-foreground mb-4">For general inquiries</p>
                            <Button variant="link" asChild>
                                <a href="mailto:hello@shelf.nu">hello@shelf.nu</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="text-center p-6">
                        <CardContent className="pt-6">
                            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Support</h3>
                            <p className="text-muted-foreground mb-4">For help with the product</p>
                            <Button variant="link" asChild>
                                <a href="mailto:support@shelf.nu">support@shelf.nu</a>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="text-center p-6">
                        <CardContent className="pt-6">
                            <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Office</h3>
                            <p className="text-muted-foreground mb-4">Come say hi</p>
                            <p className="text-sm font-medium">
                                123 Asset St.<br />
                                San Francisco, CA
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </Container>
        </div>
    );
}
