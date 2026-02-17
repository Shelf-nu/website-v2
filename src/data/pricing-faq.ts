export interface PricingFAQ {
    question: string;
    answer: string;
}

export const pricingFaqs: PricingFAQ[] = [
    {
        question: "What is your pricing?",
        answer: "Shelf offers four plans: Personal (free), Plus ($34/month), Team ($67/month), and Enterprise (custom pricing). The Personal plan is designed for hobbyists and small personal collections. Plus is for power users who need unlimited custom fields and CSV import/export. Team unlocks multi-user collaboration with bookings and reservations. Enterprise adds SSO, dedicated hosting, and custom agreements."
    },
    {
        question: "How is an asset defined?",
        answer: "An asset is any item that you have added to your asset database which has a QR code. This includes physical items like laptops, cameras, tools, vehicles, furniture, and equipment. Consumables (like pens or screws) are typically not tracked as individual assets."
    },
    {
        question: "What does the free plan include?",
        answer: "The Personal plan is free forever — no time limit and no credit card required. It includes unlimited assets, locations, tags, and categories, plus assign custody, kits, and QR code generation. You get 3 custom fields to start. It's designed for personal asset management and small collections."
    },
    {
        question: "Do you charge for team seats?",
        answer: "On the Team plan, user seats are unlimited and included in the base price. You can invite as many team members as you need without per-seat charges. The only seat-based pricing applies to the SSO add-on and Enterprise agreements."
    },
    {
        question: "Do you charge per asset tracked?",
        answer: "No. All Shelf plans include unlimited assets. We believe asset tracking should scale with your needs without penalizing growth. Our goal is to help teams track over 1 billion assets worldwide."
    },
    {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes are reflected in your next billing cycle. You can also switch between monthly and yearly billing to take advantage of our annual discount."
    },
    {
        question: "Do you offer discounts for non-profits?",
        answer: "Yes, we offer a 20% discount for registered non-profit organizations and educational institutions. Please contact our support team with proof of status to apply the discount to your account."
    },
    {
        question: "Will you help us switch to Shelf?",
        answer: "Absolutely. We offer free migration assistance to help you move from spreadsheets, other asset management tools, or any existing system. Our team will help you import your data via CSV and get set up quickly. Just reach out to our support team to get started."
    },
    {
        question: "Is my data secure?",
        answer: "Yes. We use industry-standard TLS/SSL encryption for all data in transit and encryption at rest for stored data. Our Team plan offers SSO as an add-on, and our Enterprise plan includes SSO/SAML, dedicated hosting, and custom security agreements. All plans include automatic upgrades and server maintenance."
    },
    {
        question: "Do you offer a free trial?",
        answer: "Yes, the Team plan comes with a free trial so you can test all collaboration features including bookings, calendar, and unlimited user seats. No credit card is required to start your trial."
    }
];
