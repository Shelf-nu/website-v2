export interface PricingFAQ {
    question: string;
    answer: string;
}

export const pricingFaqs: PricingFAQ[] = [
    {
        question: "What counts as an asset?",
        answer: "An asset is any unique physical item you track in Shelf. Keyboards, laptops, vehicles, tools, and furniture are all examples of assets. Consumables (like pens or screws) are typically not tracked as individual assets."
    },
    {
        question: "Can I upgrade or downgrade my plan?",
        answer: "Yes, you can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle."
    },
    {
        question: "Do you offer discounts for non-profits?",
        answer: "Yes, we offer a 20% discount for registered non-profit organizations and educational institutions. Please contact our support team with proof of status to apply."
    },
    {
        question: "Is my data secure?",
        answer: "Absolutely. We use industry-standard encryption for data in transit and at rest. Our Enterprise plan offers additional security features like SSO and Audit Logs."
    },
    {
        question: "Do you offer a free trial?",
        answer: "Yes, both our Pro and Team plans come with a 14-day free trial. No credit card is required to start your trial."
    }
];
