
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function testSnapshot() {
    const apiKey = process.env.POLYGON_API_KEY;
    const ticker = "NVDA";
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${apiKey}`;

    console.log(`Testing Snapshot: ${url}`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

testSnapshot();
