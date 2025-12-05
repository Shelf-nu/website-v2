import { Container } from "@/components/ui/container";
import { BarChart3, Lock, Zap } from "lucide-react";

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
        <section className="py-24 sm:py-32">
            <Container>
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        Deploy faster
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Everything you need to manage assets
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Shelf provides a comprehensive suite of tools to help you track, manage, and optimize your physical assets.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.name} className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                                    <feature.icon
                                        className="h-5 w-5 flex-none text-primary"
                                        aria-hidden="true"
                                    />
                                    {feature.name}
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                                    <p className="flex-auto">{feature.description}</p>
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </Container>
        </section>
    );
}
