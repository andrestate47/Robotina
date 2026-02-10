import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

// Definición de la interfaz para los datos de mercado
export interface MarketData {
    symbol: string;
    price: number;
    change24h: number; // Porcentaje de cambio
    volume24h?: number;
    marketCap?: number;
    high24h?: number;
    low24h?: number;
    lastUpdated: string;
    source: "CoinGecko" | "Yahoo Finance" | "Mock" | "Error";
}

/**
 * Servicio para obtener datos de mercado.
 * Intenta obtener datos reales de Cripto (via CoinGecko Gratis).
 * Para Stocks/Forex, usa datos simulados (Mock) ya que requieren API Keys.
 */
export async function getMarketData(symbol: string): Promise<MarketData | null> {
    // Limpieza inicial: Quitar barras comunes en forex (EUR/USD -> EURUSD)
    let cleanSymbol = symbol.toUpperCase().trim().replace("/", "");
    if (!cleanSymbol) return null;

    // Ajuste para Yahoo Finance
    let yahooSymbol = cleanSymbol;

    // 1. Criptos conocidas (BTC -> BTC-USD)
    if (!cleanSymbol.includes("-") && !cleanSymbol.includes("=") && ["BTC", "ETH", "SOL", "XRP", "ADA", "DOGE", "DOT", "LTC", "AVAX", "LINK"].includes(cleanSymbol)) {
        yahooSymbol = `${cleanSymbol}-USD`;
    }
    // 2. Forex (Pares de 6 letras -> EURUSD=X)
    // Yahoo usa el sufijo =X para tipos de cambio
    else if (cleanSymbol.length === 6 && !cleanSymbol.includes("=") && !cleanSymbol.includes("-")) {
        // Asumimos que si tiene 6 letras y son letras, podría ser forex.
        // Ej: EURUSD, GBPJPY, USDMXN
        yahooSymbol = `${cleanSymbol}=X`;
    }

    console.log(`📡 Buscando datos de mercado para: ${cleanSymbol} (Yahoo: ${yahooSymbol})...`);

    // 1. Intentar buscar en Yahoo Finance (Stocks/Forex/Cripto)
    try {
        console.log(`📡 Buscando en Yahoo Finance para: ${yahooSymbol}...`);
        const stockData = await fetchStockData(yahooSymbol);
        if (stockData) return stockData;
    } catch (e) {
        console.error("❌ Yahoo Finance error:", e);
    }

    // 2. Fallback: Intentar buscar en CoinGecko (Solo Crypto)
    try {
        const cryptoData = await fetchCryptoData(cleanSymbol);
        if (cryptoData) return cryptoData;

        console.warn(`⚠️ No se encontró datos reales, usando MOCK para ${cleanSymbol}`);
    } catch (error) {
        console.error("❌ Error fetching crypto data:", error);
    }

    // 2. Fallback: Mock Data (Stocks/Forex/Otros o si falla API)
    return getMockMarketData(cleanSymbol);
}

async function fetchCryptoData(symbol: string): Promise<MarketData | null> {
    try {
        // Paso 1: Buscar el ID de la moneda (BTC -> bitcoin)
        const searchRes = await fetch(`https://api.coingecko.com/api/v3/search?query=${symbol}`);
        if (!searchRes.ok) return null;

        const searchData = await searchRes.json();
        const cleanSym = cleanSymbol(symbol); // Helper function usage
        // Buscamos coincidencia exacta o el primero
        const coin = searchData.coins?.find((c: any) => c.symbol === symbol.toUpperCase()) || searchData.coins?.[0];

        if (!coin) return null;

        // Paso 2: Obtener precio y detalles
        const priceRes = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coin.id}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
        );

        if (!priceRes.ok) return null;
        const priceData = await priceRes.json();
        const data = priceData[coin.id];

        if (!data) return null;

        return {
            symbol: cleanSym,
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

function getMockMarketData(symbol: string): MarketData {
    // Detección básica de Forex para dar precios realistas en Mock
    const isForex = symbol.length === 6 && !symbol.includes("-") && !symbol.includes("=");
    const isCrypto = ["BTC", "ETH", "SOL"].includes(symbol);

    let basePrice = Math.random() * 1000 + 100;

    if (isForex) {
        // Generar precio realista para Forex (ej. 1.05 - 1.15)
        basePrice = 1.05 + Math.random() * 0.1;
    } else if (isCrypto) {
        // Precio crypto genérico alto
        basePrice = 30000 + Math.random() * 5000;
    }

    return {
        symbol: cleanSymbol(symbol),
        price: parseFloat(basePrice.toFixed(isForex ? 4 : 2)),
        change24h: parseFloat((Math.random() * 10 - 5).toFixed(2)),
        volume24h: Math.floor(Math.random() * 10000000),
        high24h: parseFloat((basePrice * 1.05).toFixed(isForex ? 4 : 2)),
        low24h: parseFloat((basePrice * 0.95).toFixed(isForex ? 4 : 2)),
        lastUpdated: new Date().toISOString(),
        source: "Mock" // Claramente identificado como Mock
    };
}


async function fetchStockData(symbol: string): Promise<MarketData | null> {
    try {
        const quote: any = await yahooFinance.quote(symbol);

        if (!quote) return null;

        const price = quote.regularMarketPrice || quote.ask || quote.bid || 0;
        const prevClose = quote.regularMarketPreviousClose || price;
        const change = quote.regularMarketChangePercent || ((price - prevClose) / prevClose) * 100;

        return {
            symbol: quote.symbol || symbol,
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

function cleanSymbol(s: string) {
    return s.toUpperCase().trim();
}
