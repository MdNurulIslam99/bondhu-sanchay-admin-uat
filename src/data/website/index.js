/**
 * Dummy Page Names and Page Sections, using the text of the bondhu-sanchay website project.
 * legal.js and faqs.js are unchanged copies of that project's data files.
 * The website's project list comes from the Projects page, not from here.
 *
 * Each row is one Page Section. Rows that share a Section Header (the same array below) are the
 * repeating entries of that section, numbered by Position.
 */
import { faqs } from "./faqs";
import { privacyPolicy, termsAndConditions } from "./legal";

const unsplash = (photo) => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1000&q=85`;
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const paragraphs = (text) => text.split("\n\n").map((p) => `<p>${esc(p)}</p>`).join("");
const legalHtml = (s) => paragraphs((s.body ?? []).join("\n\n")).replace("<p></p>", "") + (s.list ? `<ul>${s.list.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : "");

const row = (title, subTitle = "", text = "", photo = "") => ({ title, subTitle, description: text ? paragraphs(text) : "", images: photo ? [photo] : [] });
const htmlRow = (title, description) => ({ title, subTitle: "", description, images: [] });

const CONTENT = [
    ["home", "Home", [
        [row("Small savings, building a big tomorrow.", "From friendship to trust, from trust to prosperity", "Just ৳500 a month. Your regular savings and our shared effort create a future full of possibility. Bondhu Sanchay is a promise to move forward together.", unsplash("photo-1441974231531-c6227db76b6e"))],
        [row("Active members", "A family built on trust"), row("Total savings", "Big capital from small savings"), row("Total invested", "Together on the path to possibility"), row("Profit earned", "The fruit of shared effort")],
        [row("How the journey works", "An easy start, a bright future", "Three simple steps from saving to possibility.")],
        [row("Join the family", "01", "Become a member and join a family built on trust and support."), row("Save regularly", "02", "Deposit ৳500 each month. Small savings grow into big capital."), row("Move ahead together", "03", "Invest through shared decisions and share the results openly.")],
        [row("From savings to new possibilities", "Our investments", "Planned ventures, shared participation. Here are our sample projects.")],
        [row("More than savings, a bond of trust.", "Our promise", "Behind every taka is a friend's dream. Staying responsible to that dream is the foundation of our journey.")],
        [row("Accounts stay transparent", "", "Every deposit, investment and profit is easy to look up."), row("We decide together", "", "Members take part and talk things through before every venture."), row("Thinking long term", "", "Regular saving builds the foundation of our future.")],
        [row("A few questions, simple answers.", "Want to know more?", "Find answers to your questions about Bondhu Sanchay.")],
    ]],
    ["about", "About Us", [
        [row("Started in friendship, headed for the future.", "Our story", "A shared effort built on small savings and big dreams: Bondhu Sanchay.")],
        [row("Not alone: we move ahead with everyone beside us.", "Why Bondhu Sanchay?", "Every month each member contributes ৳500, beginning in June 2025. From this pooled saving, we invest in a range of ventures. Keeping every contribution and every investment result transparent is our goal.\n\nBondhu Sanchay is an idea of cooperation, where a habit of regular saving, responsible decisions and mutual trust light our way.", unsplash("photo-1500382017468-9049fed747ef"))],
        [row("The values that hold us together", "Our foundation")],
        [row("Participation", "", "Every member has a voice and a role."), row("Transparency", "", "A clear account of every deposit, investment and return."), row("Responsibility", "", "Shared decisions made with a clear view of opportunity and risk.")],
    ]],
    ["investments", "Investments", [
        [row("Our investment ventures", "Together toward possibility", "From saving to production, from enterprise to progress.")],
    ]],
    ["members", "Members", [
        [row("Every member, a possibility.", "Our family", "Friends joined by one dream. Mobile numbers are partly hidden to protect member privacy.")],
        [row("What membership means for you")],
        [row("Save ৳500 a month"), row("Join shared discussions"), row("See the accounts openly")],
    ]],
    ["reports", "Reports", [
        [row("A clear account of every taka.", "Trust through transparency", "Consolidated sample reports of savings and profit. No personal financial data is published here.")],
    ]],
    ["faq", "FAQ", [
        [row("Know the details, move ahead with confidence.", "Your questions, our answers", "Answers to common questions about saving, membership and investments.")],
    ]],
    ["contact", "Contact Us", [
        [row("Come, let us start together.", "An invitation to begin", "Interested in joining, or want to know more? We would love to hear from you.")],
        [row("Your savings, our shared strength.", "", "Just ৳500 a month. Regular saving builds a good habit.")],
        [row("Tell us you are interested", "Step 1"), row("Learn the membership rules", "Step 2"), row("Join the journey together", "Step 3")],
    ]],
    ["privacy-policy", "Privacy Policy", [
        [row(privacyPolicy.title, privacyPolicy.eyebrow, privacyPolicy.intro)],
        privacyPolicy.sections.map((s) => htmlRow(s.heading, legalHtml(s))),
    ]],
    ["terms-and-conditions", "Terms & Conditions", [
        [row(termsAndConditions.title, termsAndConditions.eyebrow, termsAndConditions.intro)],
        termsAndConditions.sections.map((s) => htmlRow(s.heading, legalHtml(s))),
    ]],
    ["footer", "Footer", [
        [row("Bondhu Sanchay", "Save together, grow together", "A little saved each month, prosperity shared.\n\nA future built on friendship and trust.")],
        [row("Start saving, keep growing", "", "Transparent accounts and shared decisions guide every step we take.")],
        [row("Your small savings, our big tomorrow.", "Moving forward together", "Start a new journey of possibility with just ৳500 a month.")],
    ]],
];

export const websitePageNames = CONTENT.map(([id, name]) => ({ id, name, status: "active" }));

export const websiteSections = CONTENT.flatMap(([pageId, , groups]) => groups.flatMap((rows, g) => rows.map((r, i) => ({
    id: `${pageId}-${g + 1}-${i + 1}`,
    pageId,
    sectionHeader: `Section ${g + 1}`,
    position: i + 1,
    status: "active",
    ...r,
}))));

export const websiteFaqs = faqs.map(([question, answer], i) => ({ id: `f${i + 1}`, question, answer }));
