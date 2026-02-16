import { Container } from "@/components/ui/container";
import { BarChart3, Lock, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const features = [
    {
        name: "Real-time Tracking",
        description:
            "Know exactly where your assets are at any given moment with our advanced GPS and RFID integration.",
        icon: Zap,
    },
    {
        name: "Detailed Analytics",
        description:
            "Gain insights into asset usage, depreciation, and maintenance schedules with powerful reporting tools.",
        icon: BarChart3,
    },
    {
        name: "Enterprise Security",
        description:
            "Keep your data safe with bank-grade encryption, role-based access control, and audit logs.",
        icon: Lock,
    },
];

export function FeatureSection() {
    return (
        <section className="py-32 sm:py-40 relative overflow-hidden">
            {/* Subtle background gradient to tie into Hero */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-50/40 opacity-50 blur-[100px] rounded-full -z-10 pointer-events-none" />

            <Container>
                <div className="mx-auto max-w-2xl lg:text-center">
                    <ScrollReveal width="100%">
                        <p className="text-base font-semibold leading-7 text-orange-600 uppercase tracking-widest mb-3">
                            Deploy faster
                        </p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                            Everything you need to <br />
                            <span className="text-orange-600">manage your assets</span>
                        </h2>
                        <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
                            Shelf provides a comprehensive suite of tools to help you track, manage, and optimize your physical assets.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <ScrollReveal key={feature.name} width="100%" delay={index * 0.1} className="h-full">
                                <div className="flex flex-col items-start text-left h-full p-8 rounded-2xl bg-muted/30 border border-border/60 hover:bg-muted/50 hover:border-orange-500/10 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 group">
                                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border/50 shadow-sm text-orange-600 group-hover:scale-110 transition-transform duration-300">
                                        <feature.icon
                                            className="h-6 w-6 flex-none"
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <dt className="text-xl font-bold leading-7 text-foreground tracking-tight mb-3">
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-0 flex flex-auto flex-col text-base leading-relaxed text-muted-foreground">
                                        <p className="flex-auto">{feature.description}</p>
                                    </dd>
                                </div>
                            </ScrollReveal>
                        ))}
                    </dl>
                </div>
            </Container>
        </section>
    );
}
