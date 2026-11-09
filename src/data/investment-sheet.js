/**
 * Real investment data, copied from the "Bondhu-Sanchay Parishad Invest and Profit" sheets.
 * After changing this file, click Settings > Reset Data, because saved browser data is loaded first.
 */

// Profit is expected up to this month (the sheet's "End Month"). Move it forward each month.
export const PROFIT_THROUGH_MONTH = "2026-10";

// One row per amount invested. firstProfitMonth is the first month its profit is expected.
export const INVESTMENTS = [
    { id: "ashik-1", name: "Ashik", investDate: "2026-04-01", amount: 40000, monthlyProfit: 2000, firstProfitMonth: "2026-04", status: "running" },
    { id: "mukto-1", name: "Mukto", investDate: "2026-07-01", amount: 20000, monthlyProfit: 700, firstProfitMonth: "2026-07", status: "running" },
    { id: "sadik-1", name: "Sadik", investDate: "2026-09-23", amount: 20000, monthlyProfit: 700, firstProfitMonth: "2026-10", status: "running" },
    { id: "sadik-2", name: "Sadik", investDate: "2026-09-30", amount: 10000, monthlyProfit: 400, firstProfitMonth: "2026-10", status: "running" },
    { id: "sadik-3", name: "Sadik", investDate: "2026-10-25", amount: 10000, monthlyProfit: 400, firstProfitMonth: "2026-11", status: "running" },
];

// `collected` is what was received after the cost, as in the sheet's "Profit Collect" column.
export const PROFIT_RECORDS = [
    { id: "ashik-2026-04", account: "Ashik", month: "2026-04", collected: 1000, cost: 1000, note: "Cashout cost" },
    { id: "ashik-2026-05", account: "Ashik", month: "2026-05", collected: 2000, cost: 0, note: "" },
    { id: "ashik-2026-06", account: "Ashik", month: "2026-06", collected: 2000, cost: 0, note: "" },
    { id: "ashik-2026-07", account: "Ashik", month: "2026-07", collected: 2000, cost: 0, note: "" },
    { id: "ashik-2026-08", account: "Ashik", month: "2026-08", collected: 2000, cost: 0, note: "" },
    { id: "sadik-2026-10", account: "Sadik", month: "2026-10", collected: 1100, cost: 0, note: "" },
];
