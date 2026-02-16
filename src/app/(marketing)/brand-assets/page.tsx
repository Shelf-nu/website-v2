import { PageHeader } from "@/components/layouts/shared/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ColorPalette } from "@/components/brand/color-palette";

export const metadata = {
    title: "Brand Assets - Shelf Asset Management",
    description: "Download official Shelf logos, icons, and Brand Guidelines.",
};

export default function BrandAssetsPage() {
    return (
        <>
            <PageHeader
                title="Brand Assets"
                description="Everything you need to present Shelf correctly."
                heroTagline="Media Kit"
                image="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop"
            />

            <Container className="py-24">
                {/* Logos Section */}
                <div className="mb-24">
                    <h2 className="text-2xl font-bold mb-8">Logos</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Light Mode Logo */}
                        <div className="border rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-50/50">
                            <div className="flex-1 flex items-center justify-center py-12 scale-150">
                                <Logo />
                            </div>
                            <div className="w-full border-t pt-4 flex justify-between items-center mt-4">
                                <div className="text-sm font-medium text-muted-foreground">Default (Light)</div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="w-4 h-4" /> SVG
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2">
                                        <Download className="w-4 h-4" /> PNG
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Dark Mode Logo Mockup */}
                        <div className="border rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-950 text-white">
                            <div className="flex-1 flex items-center justify-center py-12 scale-150">
                                <Logo />
                            </div>
                            <div className="w-full border-t border-white/10 pt-4 flex justify-between items-center mt-4">
                                <div className="text-sm font-medium text-zinc-400">Dark Mode</div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" className="gap-2">
                                        <Download className="w-4 h-4" /> SVG
                                    </Button>
                                    <Button variant="secondary" size="sm" className="gap-2">
                                        <Download className="w-4 h-4" /> PNG
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colors Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-8">Colors</h2>
                    <ColorPalette />
                </div>
            </Container>
        </>
    );
}
