const { yahooFinance } = require('yahoo-finance2'); // This might fail if using import syntax in TS file but require here. 
// Actually yahoo-finance2 export is default.
// Let's use fetch for Yahoo to be safe/consistent with my script style or use the library if possible.
// Better to just use fetch for the endpoints I know or use the library if installed.

// Let's check what the app is actually doing.
// I'll create a script that imports the logic or replicates it to test what the APIs return.

const fetch = require('node-fetch'); // Needs node-fetch if not in node 18+. Node 18+ has fetch global. 

const POLYGON_KEY = "N9sWt6YbB9SOdX0bK7QTU37X1sRv2f2R";

async function testForex() {
    console.log("--- TEST FOREX ---");

    // 1. Polygon
    const ticker = "C:EURUSD";
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${POLYGON_KEY}`;
    console.log(`Checking Polygon ${ticker}...`);
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Polygon Data:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Polygon Error:", e.message);
    }

    // 2. Yahoo (via API directly to avoid library issues in script)
    const ySymbol = "EURUSD=X";
    console.log(`Checking Yahoo ${ySymbol}...`);
    try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ySymbol}?interval=1d&range=1d`);
        const data = await res.json();
        const meta = data.chart?.result?.[0]?.meta;
        const price = meta?.regularMarketPrice;
        console.log("Yahoo Price:", price);
        console.log("Yahoo Meta:", JSON.stringify(meta, null, 2));
    } catch (e) {
        console.error("Yahoo Error:", e.message);
    }
}

testForex();
