
import { getMarketData } from "./lib/services/market.js";
import dotenv from "dotenv";
dotenv.config();

async function debugMarket() {
    console.log("--- DEBUG MARKET DECISION ---");
    const symbols = ["NVDA", "AAPL", "EURUSD", "BTC", "SPY"];

    for (const sym of symbols) {
        console.log(`\nTesting: ${sym}`);
        const data = await getMarketData(sym);
        if (data) {
            console.log("FINAL RESULT:");
            console.log(`- Symbol: ${data.symbol}`);
            console.log(`- Price: ${data.price}`);
            console.log(`- Source: ${data.source}`);
            console.log(`- LastUpdated: ${data.lastUpdated}`);
        } else {
            console.log("RESULT: NULL");
        }
    }
}

debugMarket();
