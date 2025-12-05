import { Container } from "@/components/ui/container";

const steps = [
    {
        id: 1,
        title: "Tag your assets",
        description: "Apply our durable QR codes or RFID tags to your physical assets.",
    },
    {
        id: 2,
        title: "Scan to track",
        description: "Use the mobile app to scan assets when they move or change hands.",
    },
    {
        id: 3,
        title: "View insights",
        description: "See real-time location, usage history, and depreciation reports.",
    },
];

export function HowItWorks() {
    return (
        <section className="py-24 sm:py-32">
            <Container>
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        How it works
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Three simple steps to total control
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {steps.map((step) => (
                            <div key={step.id} className="relative pl-16">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                                    {step.id}
                                </div>
                                <h3 className="text-lg font-semibold leading-8 text-foreground">
                                    {step.title}
                                </h3>
                                <p className="mt-2 text-base leading-7 text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
