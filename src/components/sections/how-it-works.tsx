import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

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
        <section className="py-24 sm:py-32 bg-zinc-50/50 dark:bg-zinc-900/10">
            <Container>
                <div className="mx-auto max-w-2xl lg:text-center">
                    <ScrollReveal width="100%">
                        <h2 className="text-base font-semibold leading-7 text-orange-600 uppercase tracking-widest mb-3">
                            How it works
                        </h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Three simple steps to control
                        </p>
                    </ScrollReveal>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {steps.map((step, index) => (
                            <ScrollReveal key={step.id} width="100%" delay={index * 0.15}>
                                <div className="relative pl-16 group p-6 rounded-2xl transition-colors hover:bg-white/50 border border-transparent hover:border-black/5">
                                    <div className="absolute left-0 top-6 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                                        {step.id}
                                    </div>
                                    <h3 className="text-xl font-bold leading-8 text-foreground">
                                        {step.title}
                                    </h3>
                                    <p className="mt-2 text-base leading-7 text-muted-foreground">
                                        {step.description}
                                    </p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}
