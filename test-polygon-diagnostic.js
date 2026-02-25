
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

async function testPolygon() {
    const apiKey = process.env.POLYGON_API_KEY;
    const ticker = "NVDA";
    const url = `https://api.polygon.io/v2/last/trade/${ticker}?apiKey=${apiKey}`;

    console.log(`Testing URL: ${url}`);
    try {
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const data = await res.json();
        console.log("Full Response:", JSON.stringify(data, null, 2));

        const fallbackUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`;
        console.log(`\nTesting Fallback: ${fallbackUrl}`);
        const fRes = await fetch(fallbackUrl);
        console.log(`Fallback Status: ${fRes.status}`);
        const fData = await fRes.json();
        console.log("Fallback Response:", JSON.stringify(fData, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

testPolygon();
