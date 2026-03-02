import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

interface PageHeaderProps {
    title: string;
    description: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
    return (
        <section className="relative py-20 pb-32 md:py-32 overflow-hidden border-b border-border/40 bg-surface/50 dark:bg-zinc-900/10">
            {/* Background Gradients */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute -top-[10%] left-[20%] w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-normal dark:bg-orange-900/10" />

            <Container className="relative">
                <ScrollReveal width="100%">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6">
                            {title}
                        </h1>
                        <p className="mt-6 text-xl leading-8 text-muted-foreground">
                            {description}
                        </p>
                        {children && (
                            <div className="mt-10 flex items-center justify-center gap-x-6">
                                {children}
                            </div>
                        )}
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
