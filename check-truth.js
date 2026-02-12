const fetch = require('node-fetch'); // Needs node-fetch if not in node 18+. Node 18+ has fetch global. 

async function checkRealPrices() {
    console.log("--- BUSCANDO LA VERDAD (PRECIOS REALES) ---");

    // 1. Binance EURUSDT (Proxy de Forex)
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=EURUSDT");
        const data = await res.json();
        console.log(`✅ BINANCE EUR/USDT: ${data.price}`);
    } catch (e) {
        console.log("❌ Binace Error:", e.message);
    }

    // 2. Binance BTCUSDT
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const data = await res.json();
        console.log(`✅ BINANCE BTC/USDT: ${data.price}`);
    } catch (e) {
        console.log("❌ Binace Error:", e.message);
    }

    // 3. Yahoo Finance Chart (Standard)
    try {
        const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/EURUSD=X");
        const data = await res.json();
        const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
        console.log(`🤔 YAHOO EUR/USD: ${price}`);
        const time = data.chart?.result?.[0]?.meta?.regularMarketTime;
        console.log(`   (Yahoo Time: ${new Date(time * 1000).toISOString()})`);
    } catch (e) {
        console.log("❌ Yahoo Error:", e.message);
    }
}

checkRealPrices();
