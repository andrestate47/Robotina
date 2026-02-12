const fetch = require('node-fetch');

async function testSanity() {
    console.log("--- TEST DE CORDURA DE PRECIOS ---");

    // 1. Frankfurter (Esperanza de la humanidad)
    try {
        const res = await fetch("https://api.frankfurter.app/latest?from=EUR&to=USD");
        const data = await res.json();
        console.log(`🇪🇺 Frankfurter EUR/USD: ${data.rates.USD} (Fecha: ${data.date})`);
    } catch (e) {
        console.log("❌ Frankfurter Error:", e.message);
    }

    // 2. Binance Directo
    try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=EURUSDT");
        const data = await res.json();
        console.log(`🔶 Binance EUR/USDT: ${data.price}`);
    } catch (e) {
        console.log("❌ Binance Error:", e.message);
    }
}

testSanity();
