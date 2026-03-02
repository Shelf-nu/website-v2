import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface PageHeaderProps {
    title: string;
    description: string;
    heroTagline?: string;
    children?: React.ReactNode;
    image?: string;
}

export function PageHeader({ title, description, heroTagline, children, image }: PageHeaderProps) {
    // Default placeholder if no image is provided
    const displayImage = image || "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop";

    return (
        <section className="relative overflow-hidden bg-surface/50 dark:bg-zinc-900/10 border-b border-border/40 py-16 sm:py-24 lg:py-32">
            {/* Background Gradients */}
            <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="absolute -top-[10%] left-[20%] w-[500px] h-[500px] bg-orange-100/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply dark:mix-blend-normal dark:bg-orange-900/10" />
            <div className="absolute bottom-0 right-[10%] w-[300px] h-[300px] bg-orange-50/30 rounded-full blur-[80px] pointer-events-none" />

            <Container className="relative">
                <div className="mb-8">
                    <Breadcrumbs />
                </div>
                <ScrollReveal width="100%">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        <div className="max-w-2xl">
                            {heroTagline && (
                                <p className="text-orange-600 font-semibold mb-4 text-sm uppercase tracking-widest">
                                    {heroTagline}
                                </p>
                            )}
                            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6 leading-[1.1]">
                                {title}
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                                {description}
                            </p>
                            {children}
                        </div>

                        {/* Visual Enhancement Image */}
                        <div className="relative mt-8 lg:mt-0 hidden lg:block">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-orange-900/10 border border-border/50 aspect-[4/3] transform rotate-2 hover:rotate-0 transition-all duration-700">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={displayImage}
                                    alt=""
                                    className="object-cover w-full h-full"
                                />
                                {/* Overlay gradient for text readability if needed, though mostly stylistic here */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent mix-blend-overlay" />
                            </div>
                            {/* Decorative backing */}
                            <div className="absolute -inset-4 bg-zinc-900/5 rounded-[2rem] -z-10 rotate-[-2deg]" />
                        </div>
                    </div>
                </ScrollReveal>
            </Container>
        </section>
    );
}
