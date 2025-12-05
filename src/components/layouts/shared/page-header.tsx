import { Container } from "@/components/ui/container";

interface PageHeaderProps {
    title: string;
    description: string;
    heroTagline?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, heroTagline, children }: PageHeaderProps) {
    return (
        <div className="bg-background border-b py-20 sm:py-24">
            <Container>
                <div className="mx-auto max-w-3xl text-center">
                    {heroTagline && (
                        <p className="text-primary font-semibold mb-4 text-sm uppercase tracking-wide">
                            {heroTagline}
                        </p>
                    )}
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
                        {title}
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8">
                        {description}
                    </p>
                    {children}
                </div>
            </Container>
        </div>
    );
}
