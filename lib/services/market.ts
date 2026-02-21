

export interface MarketData {
    symbol: string;
    price: number;
    change24h: number;
    volume24h?: number;
    marketCap?: number;
    high24h?: number;
    low24h?: number;
    lastUpdated: string;
    source: "Polygon" | "CoinGecko" | "Yahoo Finance" | "Mock" | "Error" | "Binance";
}

/**
 * Servicio para obtener datos de mercado.
 * Estrategia de "Alta Precisión Híbrida":
 * - Crypto: Binance (Tiempo Real puro) -> Polygon -> CoinGecko
 * - Stocks/Forex/Indices: Yahoo Finance (Intraday/Live aprox) -> Polygon (Cierre Anterior confiable)
 */
// 💾 CACHÉ EN MEMORIA (Simple y Efectiva)
// Guarda los precios por 60 segundos para evitar saturar las APIs y mejorar la velocidad.
const MARKET_CACHE = new Map<string, { data: MarketData, timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 segundos de vida para el dato

export async function getMarketData(symbol: string): Promise<MarketData | null> {
    const cleanSymbol = symbol.toUpperCase().trim();
    if (!cleanSymbol) return null;

    // 1. ⚡ REVISAR CACHÉ PRIMERO
    const cached = MARKET_CACHE.get(cleanSymbol);
    if (cached) {
        const now = Date.now();
        const age = now - cached.timestamp;
        if (age < CACHE_TTL_MS) {
            console.log(`� CACHÉ HIT para ${cleanSymbol} (Edad: ${Math.round(age / 1000)}s)`);
            return cached.data;
        } else {
            console.log(`⌛ Caché expirado para ${cleanSymbol}. Actualizando...`);
            MARKET_CACHE.delete(cleanSymbol);
        }
    }

    console.log(`�📡 Buscando datos frescos de mercado para: ${cleanSymbol}...`);

    let result: MarketData | null = null;
    const isCrypto = ["BTC", "ETH", "SOL", "XRP", "ADA", "BNB", "DOGE", "LTC"].includes(cleanSymbol) || cleanSymbol.includes("-USD") || cleanSymbol.includes("USDT");

    // --- ESTRATEGIA CRYPTO (Prioridad Velocidad/Real-time) ---
    if (isCrypto) {
        // 1. Binance (El más rápido y preciso)
        try {
            const binanceData = await fetchBinanceData(cleanSymbol);
            if (binanceData) result = binanceData;
        } catch (e) {
            console.error("❌ Binance error:", e);
        }

        // 2. Polygon (Backup)
        if (!result) {
            try {
                const polygonData = await fetchPolygonData(cleanSymbol);
                if (polygonData) result = polygonData;
            } catch (e) { console.error("❌ Polygon Crypto error:", e); }
        }
    }

    // --- ESTRATEGIA STOCKS / FOREX / INDICES (Prioridad Datos PRO) ---
    else {
        // 1. Polygon PRO (Máxima precisión al segundo)
        try {
            console.log(`📡 Intentando Polygon PRO (Prioridad #1) para: ${cleanSymbol}...`);
            const polygonData = await fetchPolygonData(cleanSymbol);
            if (polygonData) result = polygonData;
        } catch (e) {
            console.error("❌ Polygon PRO error:", e);
        }

        // 2. Yahoo Finance (Backup - Scraping Directo)
        if (!result) {
            try {
                let yahooSymbol = cleanSymbol;
                if (cleanSymbol === "NDX" || cleanSymbol === "NASDAQ100") yahooSymbol = "^NDX";
                else if (cleanSymbol === "SPX") yahooSymbol = "^GSPC";
                else if (cleanSymbol === "DJI") yahooSymbol = "^DJI";
                else if (cleanSymbol === "EURUSD") yahooSymbol = "EURUSD=X";
                else if (cleanSymbol === "GBPUSD") yahooSymbol = "GBPUSD=X";
                else if (cleanSymbol === "USDJPY") yahooSymbol = "JPY=X";
                else if (["XAU", "GOLD", "ORO", "XAUUSD"].includes(cleanSymbol)) yahooSymbol = "GC=F";
                else if (["XAG", "SILVER", "PLATA", "XAGUSD"].includes(cleanSymbol)) yahooSymbol = "SI=F";
                else if (["OIL", "WTI", "USOIL"].includes(cleanSymbol)) yahooSymbol = "CL=F";
                else if (["BRENT", "UKOIL"].includes(cleanSymbol)) yahooSymbol = "BZ=F";

                console.log(`📡 Intentando Yahoo (Backup #2) para: ${yahooSymbol}...`);
                const stockData = await fetchStockData(yahooSymbol);
                if (stockData) result = stockData;
            } catch (e) {
                console.error("❌ Yahoo Finance fallback error:", e);
            }
        }
    }

    // --- FALLBACKS FINALES ---

    // CoinGecko (Solo Crypto - Lento pero seguro)
    if (!result && isCrypto) {
        try {
            const cryptoData = await fetchCryptoData(cleanSymbol);
            if (cryptoData) result = cryptoData;
        } catch (error) { console.error("❌ CoinGecko error:", error); }
    }

    // Mock (Último recurso, pero marcando como tal)
    if (!result) {
        console.warn(`⚠️ No se encontró datos reales, usando MOCK para ${cleanSymbol}`);
        result = getMockMarketData(cleanSymbol);
    }

    // 💾 GUARDAR EN CACHÉ antes de retornar
    if (result) {
        MARKET_CACHE.set(cleanSymbol, {
            data: result,
            timestamp: Date.now()
        });
    }

    return result;
}

// 🚀 Nueva función: Binance Public API (Sin Key, Rate limit alto)
async function fetchBinanceData(symbol: string): Promise<MarketData | null> {
    let pair = symbol.replace("-USD", "USDT").replace("/USD", "USDT");
    if (!pair.endsWith("USDT") && !pair.endsWith("BUSD")) pair += "USDT"; // Asumir USDT default

    // Mapeos manuales para evitar errores
    if (symbol === "BTC") pair = "BTCUSDT";
    if (symbol === "ETH") pair = "ETHUSDT";

    try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`);
        if (!res.ok) return null;

        const data = await res.json();
        const price = parseFloat(data.lastPrice);

        console.log(`✅ Binance data found for ${pair}: ${price}`);

        return {
            symbol: prettifySymbol(symbol),
            price: price,
            change24h: parseFloat(parseFloat(data.priceChangePercent).toFixed(2)),
            volume24h: parseFloat(data.quoteVolume),
            high24h: parseFloat(data.highPrice),
            low24h: parseFloat(data.lowPrice),
            lastUpdated: new Date().toISOString(),
            source: "Binance"
        };
    } catch (e) {
        return null; // Silencioso, pasamos al siguiente
    }
}

// 🌍 Nueva función: Frankfurter API (Excelente para Forex Oficial del BCE)
async function fetchFrankfurterData(symbol: string): Promise<MarketData | null> {
    const base = symbol.substring(0, 3);
    const quote = symbol.substring(3, 6);

    // Frankfurter: base EUR default. Endpoint: latest?from=USD&to=JPY
    try {
        const url = `https://api.frankfurter.app/latest?from=${base}&to=${quote}`;
        const res = await fetch(url);
        if (!res.ok) return null;

        const data = await res.json();
        const price = data.rates[quote];

        if (!price) return null;

        console.log(`✅ Frankfurter data for ${symbol}: ${price}`);

        return {
            symbol: prettifySymbol(`${base}/${quote}`),
            price: price,
            change24h: 0,
            volume24h: 0,
            lastUpdated: new Date().toISOString(),
            source: "Yahoo Finance"
        };
    } catch (e) {
        return null; // Silencioso
    }
}

async function fetchPolygonData(symbol: string): Promise<MarketData | null> {
    const apiKey = process.env.POLYGON_API_KEY;
    if (!apiKey) return null;

    let ticker = symbol.toUpperCase();
    const isForex = symbol.length === 6 && !symbol.includes("-") && !symbol.includes("/") && !symbol.includes(":");

    // Mapping logic para Tickers PRO
    if (["NDX", "NASDAQ", "NASDAQ100", "US100", "NAS100"].includes(ticker)) ticker = "I:NDX";
    else if (["SPX", "SP500", "US500", "S&P 500"].includes(ticker)) ticker = "I:SPX";
    else if (["DJI", "DOW", "US30", "US 30"].includes(ticker)) ticker = "I:DJI";
    else if (isForex) ticker = `C:${ticker}`;
    else if (["BTC", "ETH", "SOL", "XRP", "ADA"].includes(ticker) || ticker.includes("-USD")) {
        const coreSym = ticker.replace("-USD", "").replace("/USD", "");
        ticker = `X:${coreSym}USD`;
    }

    try {
        let url = "";
        if (ticker.startsWith("C:")) {
            // Forex Real-time
            url = `https://api.polygon.io/v1/last/quote/${ticker}?apiKey=${apiKey}`;
        } else if (ticker.startsWith("X:")) {
            // Crypto Real-time
            url = `https://api.polygon.io/v1/last/crypto/${ticker.replace("X:", "")}/USD?apiKey=${apiKey}`;
        } else {
            // Stocks / Indices Real-time Last Trade
            url = `https://api.polygon.io/v2/last/trade/${ticker}?apiKey=${apiKey}`;
        }

        console.log(`📡 Polygon PRO Fetch: ${url.replace(apiKey, "HIDDEN")}`);
        const res = await fetch(url);
        if (!res.ok) {
            // Fallback al prev-close si el last trade falla (fuera de horario por ejemplo)
            const fallbackUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`;
            const fRes = await fetch(fallbackUrl);
            if (!fRes.ok) return null;
            const fData = await fRes.json();
            if (fData.results?.[0]) {
                const r = fData.results[0];
                return {
                    symbol: prettifySymbol(ticker),
                    price: r.c,
                    change24h: 0,
                    lastUpdated: new Date().toISOString(),
                    source: "Polygon"
                };
            }
            return null;
        }

        const data = await res.json();
        const result = data.results || data.last; // Depende del endpoint

        if (result) {
            const price = result.p || result.askprice || result.price || 0;
            if (price === 0) return null;

            return {
                symbol: prettifySymbol(ticker),
                price: price,
                change24h: 0, // El last trade no da % cambio directamente
                lastUpdated: new Date().toISOString(),
                source: "Polygon"
            };
        }
    } catch (e) {
        console.error("❌ Polygon PRO error:", e);
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
        // Usamos la API pública de Yahoo directamente para evitar líos de librerías/versiones de Node
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
        const res = await fetch(url);

        if (!res.ok) return null;

        const data = await res.json();
        const result = data.chart?.result?.[0];

        if (!result || !result.meta) return null;

        const meta = result.meta;
        const price = meta.regularMarketPrice;
        const prevClose = meta.previousClose;
        const change = price - prevClose;
        const changePercent = (change / prevClose) * 100;

        return {
            symbol: prettifySymbol(meta.symbol || symbol),
            price: price,
            change24h: parseFloat(changePercent.toFixed(2)),
            volume24h: meta.regularMarketVolume || 0,
            high24h: meta.regularMarketDayHigh || price,
            low24h: meta.regularMarketDayLow || price,
            lastUpdated: new Date().toISOString(),
            source: "Yahoo Finance"
        };
    } catch (e) {
        console.error(`❌ Error Yahoo Direct API (${symbol}):`, e);
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
