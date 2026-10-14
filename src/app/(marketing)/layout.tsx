import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker";
import { SignupAttribution } from "@/components/analytics/signup-attribution";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <AnalyticsTracker />
            <SignupAttribution />
            <div data-pagefind-ignore>
                <Navbar />
            </div>
            <main className="flex-1">{children}</main>
            <div data-pagefind-ignore>
                <Footer />
            </div>
        </div>
    );
}
