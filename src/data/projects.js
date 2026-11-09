/**
 * Investment projects. The project names and investors come from the owner; the start dates match the
 * investment sheet. Location, contact, summary and details are DUMMY text to be replaced with real information.
 * Money figures are not stored here: they come from the investor's account in investment-sheet.js.
 */
const unsplash = (photo) => `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=1000&q=85`;

export const BUSINESS_TYPES = ["Retail Shop", "Trading & Distribution", "Technology", "Agriculture", "Manufacturing", "Service", "Other"];

export const PROJECTS = [
    {
        id: "mitali-cosmetic-bag-house",
        name: "Mitali Cosmetic & Bag House",
        account: "Ashik",
        businessType: "Retail Shop",
        status: "running",
        startDate: "2026-04-01",
        location: "Dhaka",
        contactPerson: "Ashik",
        contactMobile: "",
        showOnWebsite: "yes",
        summary: "A neighbourhood shop selling cosmetics, skincare and ladies' bags.",
        description: "<p>Mitali Cosmetic &amp; Bag House is a retail shop offering everyday cosmetics, skincare products and a range of ladies' bags.</p><h3>How the investment is used</h3><ul><li>Buying stock for the shop</li><li>Adding new product lines</li><li>Day-to-day running costs</li></ul>",
        images: [unsplash("photo-1596462502278-27bfdc403348"), unsplash("photo-1590874103328-eac38a683ce7")],
    },
    {
        id: "ahanaf-enterprise",
        name: "Ahanaf Enterprise",
        account: "Mukto",
        businessType: "Trading & Distribution",
        status: "running",
        startDate: "2026-07-01",
        location: "Dhaka",
        contactPerson: "Mukto",
        contactMobile: "",
        showOnWebsite: "yes",
        summary: "A trading business that buys goods in bulk and supplies local sellers.",
        description: "<p>Ahanaf Enterprise is a trading business that sources goods in bulk and supplies them to local sellers.</p><h3>How the investment is used</h3><ul><li>Working capital for bulk purchases</li><li>Keeping stock ready for regular buyers</li><li>Delivery and storage costs</li></ul>",
        images: [unsplash("photo-1553413077-190dd305871c"), unsplash("photo-1586528116311-ad8dd3c8310d")],
    },
    {
        id: "getech",
        name: "Getech",
        account: "Sadik",
        businessType: "Technology",
        status: "running",
        startDate: "2026-09-23",
        location: "Dhaka",
        contactPerson: "Sadik",
        contactMobile: "",
        showOnWebsite: "yes",
        summary: "A technology business dealing in electronic products and related services.",
        description: "<p>Getech is a technology business dealing in electronic products and related services.</p><h3>How the investment is used</h3><ul><li>Buying products and components</li><li>Growing the customer base</li><li>Day-to-day business expenses</li></ul>",
        images: [unsplash("photo-1518770660439-4636190af475"), unsplash("photo-1498049794561-7780e7231661")],
    },
];
