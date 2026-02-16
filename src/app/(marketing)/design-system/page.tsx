import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, AlertCircle, Info, ChevronRight, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DesignSystemPage() {
    return (
        <div className="bg-background min-h-screen pb-20">
            <div className="border-b bg-muted/30">
                <Container className="py-12">
                    <Badge variant="outline" className="mb-4">Internal Tool</Badge>
                    <h1 className="text-4xl font-bold tracking-tight mb-4">Design System Overview</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        A rendering of all current UI tokens, components, and styles for consistency checks.
                    </p>
                </Container>
            </div>

            <Container className="py-16 space-y-24">

                {/* 1. Typography */}
                <section id="typography" className="space-y-8">
                    <div className="border-b pb-4">
                        <h2 className="text-2xl font-semibold">1. Typography</h2>
                    </div>
                    <div className="grid gap-12 md:grid-cols-2">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <span className="text-xs text-muted-foreground uppercase tracking-widest">Headings</span>
                                <h1 className="text-5xl font-bold tracking-tight">Heading 1</h1>
                                <h2 className="text-4xl font-bold tracking-tight">Heading 2</h2>
                                <h3 className="text-3xl font-bold tracking-tight">Heading 3</h3>
                                <h4 className="text-2xl font-semibold tracking-tight">Heading 4</h4>
                                <h5 className="text-xl font-semibold tracking-tight">Heading 5</h5>
                                <h6 className="text-lg font-semibold tracking-tight">Heading 6</h6>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <span className="text-xs text-muted-foreground uppercase tracking-widest">Body & Text</span>
                                <p className="leading-7">
                                    <strong>Body Default:</strong> The quick brown fox jumps over the lazy dog. shelf_v2 is designed for clarity and speed.
                                    Asset management requires precise data entry and clear legibility.
                                </p>
                                <p className="text-muted-foreground leading-7">
                                    <strong>Muted Text:</strong> Used for secondary information, descriptions, and metadata. It should recede visually but remain legible.
                                </p>
                                <p className="text-sm font-medium leading-none">Small Medium Text</p>
                                <p className="text-sm text-muted-foreground">Small Muted Text</p>
                                <div className="flex gap-4 items-center">
                                    <Link href="#" className="text-primary underline underline-offset-4">Primary Link</Link>
                                    <Link href="#" className="font-medium hover:underline">Unstyled Link</Link>
                                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Navigation Link</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Colors */}
                <section id="colors" className="space-y-8">
                    <div className="border-b pb-4">
                        <h2 className="text-2xl font-semibold">2. Colors & Semantic Tokens</h2>
                    </div>
                    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
                        <div className="space-y-2">
                            <div className="h-24 rounded-lg bg-background border flex items-center justify-center shadow-sm">
                                <span className="text-foreground font-medium">Background</span>
                            </div>
                            <p className="text-sm text-muted-foreground">bg-background</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 rounded-lg bg-foreground flex items-center justify-center shadow-sm">
                                <span className="text-background font-medium">Foreground</span>
                            </div>
                            <p className="text-sm text-muted-foreground">bg-foreground</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 rounded-lg bg-card border flex items-center justify-center shadow-sm">
                                <span className="text-card-foreground font-medium">Card</span>
                            </div>
                            <p className="text-sm text-muted-foreground">bg-card</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 rounded-lg bg-muted flex items-center justify-center">
                                <span className="text-muted-foreground font-medium">Muted</span>
                            </div>
                            <p className="text-sm text-muted-foreground">bg-muted</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                                <span className="text-primary-foreground font-medium">Primary</span>
                            </div>
                            <p className="text-sm text-muted-foreground">bg-primary</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 rounded-lg bg-secondary flex items-center justify-center shadow-sm">
                                <span className="text-secondary-foreground font-medium">Secondary</span>
                            </div>
                            <p className="text-sm text-muted-foreground">bg-secondary</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 rounded-lg bg-destructive flex items-center justify-center shadow-sm">
                                <span className="text-destructive-foreground font-medium">Destructive</span>
                            </div>
                            <p className="text-sm text-muted-foreground">bg-destructive</p>
                        </div>
                        <div className="space-y-2">
                            <div className="h-24 rounded-lg border-2 border-border flex items-center justify-center border-dashed">
                                <span className="text-muted-foreground font-medium">Border</span>
                            </div>
                            <p className="text-sm text-muted-foreground">border-border</p>
                        </div>
                    </div>
                </section>

                {/* 3. Buttons */}
                <section id="buttons" className="space-y-8">
                    <div className="border-b pb-4">
                        <h2 className="text-2xl font-semibold">3. Buttons</h2>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button>Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="link">Link</Button>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button size="lg">Large Size</Button>
                        <Button>Default Size</Button>
                        <Button size="sm">Small Size</Button>
                        <Button size="icon"><Settings className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                        <Button disabled>Disabled</Button>
                        <Button disabled variant="outline">Disabled Outline</Button>
                        <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading
                        </Button>
                    </div>
                </section>

                {/* 4. Badges */}
                <section id="badges" className="space-y-8">
                    <div className="border-b pb-4">
                        <h2 className="text-2xl font-semibold">4. Badges</h2>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <Badge>Default</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="outline">Outline</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">Custom Color</Badge>
                    </div>
                </section>

                {/* 5. Cards */}
                <section id="cards" className="space-y-8">
                    <div className="border-b pb-4">
                        <h2 className="text-2xl font-semibold">5. Cards</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Simple Card</CardTitle>
                                <CardDescription>Just the basics.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>This is standard card content. It sits inside a contained block.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>With Footer</CardTitle>
                                    <Badge variant="outline">New</Badge>
                                </div>
                                <CardDescription>Card with actions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Useful for dashboard widgets or pricing tiers.</p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button variant="ghost" size="sm">Cancel</Button>
                                <Button size="sm">Save</Button>
                            </CardFooter>
                        </Card>

                        <Card className="transition-all hover:shadow-md cursor-pointer hover:border-primary/50">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    Hoverable
                                    <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
                                </CardTitle>
                                <CardDescription>Interactive state.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p>Clicking this entire card could trigger an action or navigation.</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* 6. Tables (Visual only via HTML/Tailwind as no Table component exists) */}
                <section id="tables" className="space-y-8">
                    <div className="border-b pb-4">
                        <h2 className="text-2xl font-semibold">6. Tables</h2>
                    </div>
                    <div className="rounded-md border">
                        <div className="w-full text-sm">
                            <table className="w-full caption-bottom text-sm">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Asset Tag</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Value</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle bg-background font-mono">AST-001</td>
                                        <td className="p-4 align-middle">Electronics</td>
                                        <td className="p-4 align-middle"><Badge variant="secondary">Available</Badge></td>
                                        <td className="p-4 align-middle text-right">$1,200</td>
                                    </tr>
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle bg-background font-mono">AST-002</td>
                                        <td className="p-4 align-middle">Furniture</td>
                                        <td className="p-4 align-middle"><Badge variant="outline">In Use</Badge></td>
                                        <td className="p-4 align-middle text-right">$450</td>
                                    </tr>
                                    <tr className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle bg-background font-mono">AST-003</td>
                                        <td className="p-4 align-middle">IT Equipment</td>
                                        <td className="p-4 align-middle"><Badge variant="destructive">Maintenance</Badge></td>
                                        <td className="p-4 align-middle text-right">$2,100</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* 7. Icons & Extras */}
                <section id="icons" className="space-y-8">
                    <div className="border-b pb-4">
                        <h2 className="text-2xl font-semibold">7. Icons & Tooltips</h2>
                    </div>
                    <div className="flex gap-8 items-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-4 bg-muted rounded-lg">
                                <Check className="h-6 w-6 text-foreground" />
                            </div>
                            <span className="text-xs text-muted-foreground">Default</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-4 bg-primary/10 rounded-lg">
                                <AlertCircle className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground">Primary</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="p-4 bg-muted rounded-lg">
                                <Info className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <span className="text-xs text-muted-foreground">Muted</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 ml-8">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline">Hover Me</Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>This uses the Tooltip component</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <span className="text-xs text-muted-foreground">Tooltip</span>
                        </div>
                    </div>
                </section>

            </Container>
        </div>
    );
}
