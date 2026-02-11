import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export interface MarketData {
    symbol: string;
    price: number;
    change24h: number;
    volume24h?: number;
    marketCap?: number;
    high24h?: number;
    low24h?: number;
    lastUpdated: string;
    source: "Polygon" | "CoinGecko" | "Yahoo Finance" | "Mock" | "Error";
}

export async function getMarketData(symbol: string): Promise<MarketData | null> {
    const cleanSymbol = symbol.toUpperCase().trim();
    if (!cleanSymbol) return null;

    console.log(`📡 Buscando datos de mercado para: ${cleanSymbol} (Prioridad: Polygon)...`);

    // 1. Polygon.io (Direct Fetch)
    try {
        const polygonData = await fetchPolygonData(cleanSymbol);
        if (polygonData) return polygonData;
    } catch (e) {
        console.error("❌ Polygon error:", e);
    }

    // 2. Yahoo Finance (Fallback)
    try {
        let yahooSymbol = cleanSymbol;
        if (cleanSymbol === "NDX" || cleanSymbol === "NASDAQ100") yahooSymbol = "^NDX";
        else if (cleanSymbol === "SPX") yahooSymbol = "^GSPC";
        else if (cleanSymbol === "EURUSD") yahooSymbol = "EURUSD=X";
        else if (cleanSymbol === "BTC") yahooSymbol = "BTC-USD";

        console.log(`📡 Buscando datos en Yahoo (fallback) para: ${yahooSymbol}...`);
        const stockData = await fetchStockData(yahooSymbol);
        if (stockData) return stockData;
    } catch (e) {
        console.error("❌ Yahoo Finance error (Fallback):", e);
    }

    // 3. CoinGecko (Crypto Fallback)
    try {
        const cryptoData = await fetchCryptoData(cleanSymbol);
        if (cryptoData) return cryptoData;
    } catch (error) {
        console.error("❌ Error fetching crypto data:", error);
    }

    // 4. Mock
    console.warn(`⚠️ No se encontró datos reales, usando MOCK para ${cleanSymbol}`);
    return getMockMarketData(cleanSymbol);
}

async function fetchPolygonData(symbol: string): Promise<MarketData | null> {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) {
        console.error("❌ Missing POLYGON_API_KEY");
        return null;
    }

    let ticker = symbol;
    // Mapping logic
    if (["NDX", "NASDAQ", "NASDAQ100", "US100"].includes(symbol)) ticker = "I:NDX";
    else if (["SPX", "SP500", "US500"].includes(symbol)) ticker = "I:SPX";
    else if (["DJI", "DOW", "US30"].includes(symbol)) ticker = "I:DJI";
    else if (symbol.length === 6 && !symbol.includes("-")) {
        ticker = `C:${symbol}`;
    } else if (["BTC", "ETH", "SOL", "XRP", "ADA"].includes(symbol) || symbol.includes("-USD")) {
        const coreSym = symbol.replace("-USD", "");
        ticker = `X:${coreSym}USD`;
    }

    console.log(`📡 Polygon Fetch Ticker: ${ticker}`);

    // Helper to fetch valid prev close
    const fetchPreviousClose = async (t: string) => {
        const url = `https://api.polygon.io/v2/aggs/ticker/${t}/prev?adjusted=true&apiKey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`⚠️ Polygon Fetch Failed (${t}): ${res.status} ${res.statusText}`);
            return null;
        }
        return res.json();
    };

    let data = await fetchPreviousClose(ticker);

    // Si Polygon falla para Indices (común en plan gratuito), retornamos null
    // para que el sistema haga fallback a Yahoo Finance y muestre el precio real del indice (^NDX)
    // en lugar de un ETF proxy (QQQ).

    if (data && data.results && data.results.length > 0) {
        const result = data.results[0];
        const price = result.c;
        const open = result.o;
        const change = open ? ((price - open) / open) * 100 : 0;

        console.log(`✅ Polygon data found for ${ticker}: ${price}`);

        return {
            symbol: prettifySymbol(ticker),
            price: price,
            change24h: parseFloat(change.toFixed(2)),
            volume24h: result.v,
            high24h: result.h,
            low24h: result.l,
            lastUpdated: new Date().toISOString(),
            source: "Polygon"
        };
    }

    return null;
}


async function fetchCryptoData(symbol: string): Promise<MarketData | null> {
    try {
        const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`);
        if (!searchRes.ok) return null;

        const searchData = await searchRes.json();
        const coin = searchData.coins?.find((c: any) => c.symbol === symbol.toUpperCase()) || searchData.coins?.[0];

        if (!coin) return null;

        const priceRes = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
        );

        if (!priceRes.ok) return null;
        const priceData = await priceRes.json();
        const data = priceData[coin.id];

        if (!data) return null;

        // Si es crypto, forzamos el sufijo /USD para estilizar
        let displaySymbol = coin.symbol.toUpperCase();
        if (!displaySymbol.includes("USD")) displaySymbol += "USD";

        return {
            symbol: prettifySymbol(displaySymbol),
            price: data.usd,
            change24h: data.usd_24h_change,
            volume24h: data.usd_24h_vol,
            marketCap: data.usd_market_cap,
            lastUpdated: new Date().toISOString(),
            source: "CoinGecko"
        };
    } catch (e) {
        return null;
    }
}

async function fetchStockData(symbol: string): Promise<MarketData | null> {
    try {
        // @ts-ignore
        const quote: any = await yahooFinance.quote(symbol);

        if (!quote) return null;

        const price = quote.regularMarketPrice || quote.ask || quote.bid || 0;

        if (price <= 0) return null;

        const prevClose = quote.regularMarketPreviousClose || price;
        const change = quote.regularMarketChangePercent || ((price - prevClose) / prevClose) * 100;

        return {
            symbol: prettifySymbol(quote.symbol || symbol),
            price: price,
            change24h: parseFloat(change ? change.toFixed(2) : "0"),
            volume24h: quote.regularMarketVolume || 0,
            high24h: quote.regularMarketDayHigh || price,
            low24h: quote.regularMarketDayLow || price,
            lastUpdated: new Date().toISOString(),
            source: "Yahoo Finance"
        };
    } catch (e) {
        console.error(`❌ Error Yahoo Finance (${symbol}):`, e);
        return null;
    }
}

function getMockMarketData(symbol: string): MarketData {
    const isForex = symbol.length === 6 && !symbol.includes("-") && !symbol.includes("=");
    const isCrypto = ["BTC", "ETH", "SOL"].includes(symbol);

    let basePrice = Math.random() * 1000 + 100;

    if (["NDX", "NASDAQ100", "US100"].includes(symbol)) {
        basePrice = 17000 + Math.random() * 1000;
    } else if (["SPX", "SP500", "US500"].includes(symbol)) {
        basePrice = 5000 + Math.random() * 200;
    } else if (["BTC", "BTC-USD"].includes(symbol)) {
        basePrice = 60000 + Math.random() * 5000;
    } else if (isForex) {
        basePrice = 1.05 + Math.random() * 0.1;
    } else if (isCrypto) {
        basePrice = 2000 + Math.random() * 1000;
    }

    return {
        symbol: prettifySymbol(symbol),
        price: parseFloat(basePrice.toFixed(isForex ? 4 : 2)),
        change24h: parseFloat((Math.random() * 10 - 5).toFixed(2)),
        volume24h: Math.floor(Math.random() * 10000000),
        high24h: parseFloat((basePrice * 1.05).toFixed(isForex ? 4 : 2)),
        low24h: parseFloat((basePrice * 0.95).toFixed(isForex ? 4 : 2)),
        lastUpdated: new Date().toISOString(),
        source: "Mock"
    };
}

// ✨ Función para estilizar los símbolos (Bonitos y Estilizados)
function prettifySymbol(rawSymbol: string): string {
    // Limpieza inicial de prefijos/sufijos técnicos
    let s = rawSymbol
        .replace("I:", "")
        .replace("C:", "")
        .replace("X:", "")
        .replace(":", "")
        .replace("=X", "")  // Yahoo Forex
        .toUpperCase();

    // 1. Índices: Nombres cortos y elegantes
    if (["NDX", "^NDX", "NASDAQ", "NASDAQ100", "US100"].includes(s)) return "NAS100";
    if (["SPX", "^GSPC", "SP500", "US500"].includes(s)) return "S&P 500";
    if (["DJI", "^DJI", "DOW", "US30"].includes(s)) return "US 30";
    if (["VIX", "^VIX"].includes(s)) return "VIX";

    // 2. Forex: Formato clásico con barra (EUR/USD)
    // Detectamos si son 6 letras consecutivas y NO es una acción conocida de 6 letras (raro pero posible)
    // Lista de exclusión básica de acciones famosas de 6 letras (aunque pocas exchanges usan 6 letras sin separador)
    const stockExceptions = ["GOOGL", "AMZN", "NVIDIA"]; // Solo ejemplos
    if (s.length === 6 && /^[A-Z]+$/.test(s) && !stockExceptions.includes(s)) {
        return `${s.substring(0, 3)}/${s.substring(3)}`;
    }

    // 3. Crypto: Formato Moneda/USD
    if (s.includes("-USD")) return s.replace("-USD", "/USD");
    if (s.endsWith("USD") && s.length > 3) {
        const base = s.replace("USD", "");
        return `${base}/USD`;
    }

    // Default: Retornar limpio
    return s;
}
