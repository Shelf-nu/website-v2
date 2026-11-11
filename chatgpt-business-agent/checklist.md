# Checklist: publish the Shelf Business Agent in ChatGPT

Carlos does every step here. Nothing has been claimed, connected or published yet.

The steps follow OpenAI's help article "Setting up your business on ChatGPT" (https://help.openai.com/articles/20001635), read 2026-11-11. Button names may differ slightly. If a screen doesn't match, trust the screen.

## 0. Before you start (10 minutes)

- [ ] Use a ChatGPT account you'll keep long term. Whoever claims the business is its admin and adds teammates later. Don't forward a claim invite to someone else.
- [ ] Have these ready for Persona identity verification:
  - your government ID
  - the Delaware incorporation certificate
  - the EIN
  - the registered address exactly as on the papers: 1111b South Governors Avenue, STE 6801, Dover, DE 19904
  The name, address and tax number must match the official records exactly, or Persona fails.
- [ ] Open the three files in this folder: `business-info.md`, `agent-guidelines.md`, `faq.md`.

## 1. Claim shelf.nu in Business Hub

1. [ ] Sign in to ChatGPT and open **Business Hub** from the sidebar (or go to https://chatgpt.com/business-hub).
2. [ ] Search for **Shelf**. Choose only the listing whose website is **shelf.nu**. Other businesses also use the name Shelf (for example shelf.io), so never claim one of theirs. If shelf.nu isn't listed, choose the option to **add** an online business.
3. [ ] Confirm which ChatGPT account will manage the business.
4. [ ] Pick a verification method. My recommendation is **Business email**: it's the quickest, and you have the mailbox. Pick the address ChatGPT shows, enter the code, done.
   - **Avoid Website domain.** It needs a DNS TXT record, and you have no Cloudflare DNS access.
   - **Shopify store** also works (see step 3), but it verifies through the label store. Use it only if business email isn't offered.
5. [ ] Wait for OpenAI's approval email. If they ask for more information, reply with exactly what they ask for. Don't re-submit while it's under review.

## 2. Verify your identity with Persona (this gives the blue check)

1. [ ] In Business Hub, open your profile, find **Complete verification with Persona**, then **Verify** → **Continue to Persona**.
2. [ ] Submit your ID, the business registration and proof that you represent Shelf.
3. [ ] Wait for the approval email. Until Persona is approved you can't publish profile changes, see insights or create the agent. The blue check appears only after approval.

## 3. Fill in the profile

Open your profile in the **Business** tab and paste from `business-info.md`:

- [ ] Website: https://www.shelf.nu
- [ ] Category
- [ ] Short and long description
- [ ] Logo
- [ ] Return policy and delivery policy (the exact text is in `business-info.md`)
- [ ] Contact: support@shelf.nu
- [ ] Leave hours blank

OpenAI reviews changes before they appear, which can take a while.

## 4. Connect the label store (store.shelf.nu) through Shopify

1. [ ] In the Shopify admin for store.shelf.nu, install **ChatGPT** by OpenAI: https://apps.shopify.com/chatgpt (free app).
2. [ ] Read the permission screen before approving. It asks to view customer data, products, marketing and store analytics. That's normal for this app, but check it's what you expect.
3. [ ] Connect it to the **same** Business Hub profile (Shelf / shelf.nu). Don't create a second business for the store.
4. [ ] Sync the product feed. The agent then gets label prices and stock from Shopify, and nobody types them by hand.
5. [ ] **Skip ads.** The same app offers ChatGPT ad campaigns, which bill as you go. They're a separate decision and not part of this setup.

Note: the Shopify setup may create a **draft agent** by itself. If it does, open that draft in step 5 rather than making a new one.

## 5. Create the agent

1. [ ] In the Business tab, open the draft agent, or select **Create agent** (it shows only after Persona approval, and only for eligible US online businesses).
2. [ ] Paste the whole "Instructions to paste" section of `agent-guidelines.md` into the instructions field.
3. [ ] If there's a place for extra information or FAQs, paste the questions and answers from `faq.md`.
4. [ ] Check what the agent already pulled in by itself (description, return policy, Shopify products). Correct anything that's out of date.

## 6. Preview with these 10 questions

Ask each one in the preview. A test **fails** if the answer contains anything from the "Must not say" column. If one fails, fix the instructions and test again.

| # | Ask | Expected answer (gist) | Must not say |
|---|-----|------------------------|--------------|
| 1 | How much does Shelf cost for a team of 30? | Team is 67 USD a month or 370 USD a year per workspace, with unlimited users. No per-user fee. | Any per-user price for the plan itself, or an invented discount |
| 2 | Is there a free trial, and do I need a credit card? | Free plan for one user, forever. The Team trial is 7 days with no card. | A trial longer than 7 days, or "card required" |
| 3 | Can I get a refund if we don't renew in time? | No refunds after a trial, renewals included (terms section 14). Points to the free plan or trial to test first, and to support@shelf.nu. | "Yes", "pro-rated refund", or any promise |
| 4 | Can I scan the barcodes already on our equipment? | Yes, with the Alternative Barcodes add-on (18.50 USD a month or 170 USD a year): Code128, Code39, EAN-13, DataMatrix and other systems' QR codes. Shelf QR codes need no add-on. | That barcode scanning is included for free |
| 5 | Can students check out cameras to their classmates? | Self-service users check out to themselves only. An admin or manager can assign gear to others. Base users request bookings. | That Self-service users can assign to others |
| 6 | We need SSO with Okta for 300 users. What does that cost? | Per-SSO-user annual bands: 9 / 4 / 1 / 0.05 USD. Above about 100 users, an unlimited licence is usually cheaper, and the team quotes it. Points to the demo link. | That password users stay free alongside SSO, SCIM, the unlimited licence price, or "turn it on yourself" |
| 7 | Does Shelf have work orders for maintenance? | No work-order system. Asset reminders handle scheduled dates like inspections or service. | "Yes", "CMMS", "work orders" |
| 8 | Can I add several photos to each asset? | One image per asset. | Galleries or multiple photos |
| 9 | When will you have an API / RFID? | No public API and no RFID today. Gives no dates. Suggests support@shelf.nu. | "Coming soon", "on the roadmap", any date |
| 10 | Is there a mobile app? | Shelf Companion, free on iPhone, iPad and Android, plus the web app in any browser. Scanning non-Shelf barcodes needs Alternative Barcodes. Gives the App Store and Google Play links. | "No native app" or "PWA only" |

Also check that every answer:
- [ ] says it's an AI for Shelf when asked "Am I talking to a person?"
- [ ] never asks for an email, phone number, password or payment details
- [ ] uses only links from `agent-guidelines.md`

## 7. Publish

- [ ] When all 10 tests pass, select **Publish**. People can chat only with a published agent.
- [ ] Ask it question 1 once more from a normal ChatGPT chat (not the preview) to confirm it's live.

## 8. What to watch in Insights (weekly, 10 minutes)

Insights cover the last 28 days, as totals only. You never see individual chats or prompts. A blank number can mean "not enough data yet", not zero.

- **Mentions:** how often ChatGPT cited shelf.nu. The brand name alone doesn't count. Note the first number as your baseline.
- **Website clicks:** clicks from ChatGPT to shelf.nu. Compare with our own data: `node scripts/analytics.mjs referrers --days 30` in the website repo (ChatGPT was already the #4 referrer in August 2026).
- **Discovery topics:** the themes ChatGPT links us to. This is the useful one:
  - If a topic matches a segment we sell to (equipment checkout, university AV, IT loaners), good.
  - If a topic is about something we don't do (work orders, retail inventory, RFID), tighten the agent instructions and the matching site page so ChatGPT stops sending the wrong people.
- **Keep it current:** whenever a price or plan changes on https://www.shelf.nu/pricing, update `agent-guidelines.md` and the agent the same day. A stale price breaks OpenAI's accuracy rule and can get the agent paused.
