/**
 * Real collection data, copied from the "Bondhu-Sanchay Parishad" sheets (2025, 2026 and the summary).
 * There is no API yet: this file is the source of the data shown in the app.
 *
 * Each month in `collections` is one sheet cell:
 *   a number  paid, on that day of the month
 *   P         paid, but the sheet has no date
 *   a string  paid, with the date exactly as written in the sheet (for example "10/25")
 *   _         not paid
 *
 * After changing this file, click Settings > Reset Data, because saved browser data is loaded first.
 */
const P = "";
const _ = null;

export const MONTHLY_AMOUNT = 500;

export const COLLECTION_SHEETS = [
    { year: 2025, months: ["2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12"] },
    { year: 2026, months: ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"] },
];

// Dues are counted up to this month. Move it forward when a new month's collection starts.
export const LAST_COLLECTION_MONTH = "2026-11";

export const MEMBERS = [
    {
        sl: 1, name: "Md Sadekur Rahaman Pias", mobile: "01617850226",
        collections: { 2025: [20, 2, 5, 3, 1, 16, "8/1"], 2026: [8, 20, 7, P, P, 24, 17, 15, P, 28, _, _] },
    },
    {
        sl: 2, name: "Md Nurul Islam", mobile: "01634064799",
        collections: { 2025: [P, 8, 12, P, 7, P, 22], 2026: [13, 26, 1, 18, P, 30, P, 15, 21, 27, 4, _] },
    },
    {
        sl: 3, name: "Mukto", mobile: "01981144965",
        collections: { 2025: [P, 8, 6, P, 17, P, P], 2026: [10, P, P, P, 9, P, P, P, 30, P, P, _] },
    },
    {
        sl: 4, name: "Shuvo", mobile: "01945616750",
        collections: { 2025: [21, 6, 2, 3, 4, 2, 16], 2026: [P, 8, 7, 11, 9, 25, 24, 5, P, 4, _, _] },
    },
    {
        sl: 5, name: "Md Mostafizur Rahman", mobile: "01956231450",
        collections: { 2025: [21, 12, P, P, P, P, P], 2026: [P, P, P, P, P, P, P, P, 30, P, _, _] },
    },
    {
        sl: 6, name: "Md Zubaer Al Mahmud Rabby", mobile: "01883483398",
        collections: { 2025: [24, 2, 1, 11, 17, 14, 16], 2026: [P, 8, P, P, P, P, P, P, P, P, _, _] },
    },
    {
        sl: 7, name: "Md Sadikur Rahman Sadik", mobile: "01684399623",
        collections: { 2025: [20, 13, 1, 3, 17, P, 20], 2026: [P, P, P, 1, P, P, P, P, P, _, _, _] },
    },
    {
        sl: 8, name: "M Ragib Al Sharier Mahfuj", mobile: "01516503646",
        collections: { 2025: [26, P, "6/15", P, 17, 16, 16], 2026: [8, 12, 3, P, 19, "10/25", P, 5, 2, 6, 2, _] },
    },
    {
        sl: 9, name: "Md Shafiur Rahman", mobile: "01987468655",
        collections: { 2025: [25, 2, 1, 11, 17, 16, 16], 2026: [P, P, P, 1, P, P, P, 2, P, P, P, _] },
    },
    {
        sl: 10, name: "Istiak Riad", mobile: "01962147161",
        collections: { 2025: [19, 6, 2, 7, 17, P, 20], 2026: [8, P, 29, P, 9, P, 30, 30, _, _, _, _] },
    },
    {
        sl: 11, name: "Mahedi Hasan Opu", mobile: "01797408016",
        collections: { 2025: [P, P, P, P, P, P, P], 2026: [P, P, P, P, P, P, _, _, _, _, _, _] },
    },
    {
        // The name and mobile cells of row 12 are empty in the sheet.
        sl: 12, name: "Member 12 (name not in sheet)", mobile: "",
        collections: { 2025: [P, P, P, P, P, P, P], 2026: [P, _, _, _, _, _, _, _, _, _, _, _] },
    },
];
