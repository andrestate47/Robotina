import { NextRequest, NextResponse } from "next/server"
import { getMarketData } from "@/lib/services/market"

export async function POST(req: NextRequest) {
  try {
    const { data, symbol, tradingStyle } = await req.json()

    if (!data) {
      return NextResponse.json({ error: "No se envió ninguna imagen." }, { status: 400 })
    }

    console.log("📤 Imagen recibida del frontend:", data.slice(0, 80))

    // 🔍 Paso 1: Identificar Símbolo (Si el usuario no lo dio)
    let activeSymbol = symbol?.toUpperCase().trim()

    if (!activeSymbol) {
      console.log("🕵️‍♂️ Usuario no dio símbolo. Intentando detectar automáticamente con IA...")
      try {
        const detectionResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-2024-08-06",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Identify the financial asset symbol/ticker in this chart. For Forex/Currencies, return the 6-letter pair (e.g., EURUSD, GBPJPY). For Crypto, return the ticker (e.g., BTC, ETH). For Stocks, return the ticker (e.g., AAPL). Return ONLY the symbol text. If unsure or generic, return 'UNKNOWN'." },
                  { type: "image_url", image_url: { url: data.startsWith("data:image") ? data : `data:image/png;base64,${data}` } },
                ],
              },
            ],
            max_tokens: 10,
          }),
        })
        const detectionResult = await detectionResponse.json()
        const detectedObj = detectionResult.choices?.[0]?.message?.content?.trim()

        if (detectedObj && detectedObj !== "UNKNOWN") {
          // Limpiar posibles puntos o texto extra
          activeSymbol = detectedObj.replace(/\.$/, "").trim()
          console.log(`🧠 IA detectó símbolo: ${activeSymbol}`)
        }
      } catch (e) {
        console.error("⚠️ Error detectando símbolo:", e)
      }
    }

    // 🔍 Paso 2: Obtener datos de mercado reales
    let marketInfoText = ""
    let marketData = null

    if (activeSymbol) {
      console.log(`🔎 Buscando datos para símbolo: ${activeSymbol}`)
      marketData = await getMarketData(activeSymbol)

      if (marketData) {
        marketInfoText = `
DATA DE MERCADO REAL (${marketData.source}) - Prioridad MÁXIMA:
- Activo: ${marketData.symbol}
- Precio Actual: $${marketData.price}
- Cambio 24h: ${marketData.change24h}%
- Volumen: ${marketData.volume24h}

INSTRUCCIÓN CRÍTICA DE RESPUESTA:
1. NUNCA devuelvas "null" en entrada/salida/stop_loss. SIEMPRE calcula valores hipotéticos o niveles de referencia (Soporte/Resistencia).
2. Si el análisis es "NEUTRO", usa el Soporte más cercano como "entrada" (compra ideal) y la Resistencia como "salida".
3. Si el gráfico es ANTIGUO (precio diferente al real): IGNORA el precio de la imagen. Crea un plan de trading basado en el PRECIO REAL suministrado ("Precio Actual").
4. Sé valiente: Prefiere dar un plan "LONG" o "SHORT" basado en la tendencia macro del precio real antes que un "NEUTRO" vacío.

Estructura JSON requerida (campos numéricos OBLIGATORIOS):
`
      }
    }

    console.log("📡 Enviando payload a OpenAI para análisis final...")

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-2024-08-06",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analiza cuidadosamente la imagen adjunta. Es un gráfico financiero (análisis técnico).
${marketInfoText}

Tu misión es combinar el ANÁLISIS VISUAL con los DATOS EN TIEMPO REAL:

ESTILO DE TRADING ELEGIDO: ${tradingStyle ? tradingStyle.toUpperCase() : "INTRADAY"}
1. Ajusta los TPs y SL según el estilo:
   - SCALPING: Busca movimientos rápidos (15m - 1h). SL muy ajustado, TPs cortos.
   - INTRADAY: Busca movimientos de la sesión (4h - 1D). SL moderado.
   - SWING: Busca tendencias de días/semanas. SL amplio, TPs lejanos esperando grandes recorridos.

2. COMPARA fechas/precios: Si el precio en la imagen es muy distinto al "Precio Actual" provisto arriba, ADVIERTE que el gráfico podría ser antiguo.
3. VALIDA la tendencia: Si el gráfico parece alcista pero el "Cambio 24h" es muy negativo, recomienda precaución extra.
3. VALIDACIÓN LÓGICA Y PRECISIÓN (Anti-Confusión):
   - **PRECISIÓN DECIMAL PROHIBIDA DE REDONDEAR:** Para Forex (EURUSD, GBPUSD...) USA SIEMPRE 4 o 5 DECIMALES (ej. 1.08234, NO 1.08). Para Crypto usa 2 (BTC) o hasta 8 (SHIB).
   - **Manejo de Discrepancias:**
     - Si el precio de la imagen (ej: 1.1904) difiere del "Precio Actual" (ej: 1.0820) por más del 1%:
       "¡ADVERTENCIA! El gráfico parece antiguo o de otro broker."
       -> TU ANÁLISIS debe basarse en la ESTRUCTURA visual del gráfico (patrones), PERO...
       -> LOS NIVELES DE ENTRADA/SALIDA deben recalcularse usando el PRECIO ACTUAL como referencia (Pivot Point).
     - Si la diferencia es pequeña (<1%): Asume que es el mismo precio y ajusta tus niveles técnicos al PRECIO REAL para máxima precisión.

4. Lee niveles clave: Soporte, resistencia, canales.

Genera un recomendación técnica en formato JSON con esta estructura exacta:

{
  "tipo_analisis": "LONG" | "SHORT" | "NEUTRO",
  "entrada": 0.0,
  "salida": 0.0,
  "stop_loss": 0.0,
  "confianza": "Alta" | "Media" | "Baja",
  "patron_detectado": "Nombre del patrón",
  "indicadores_clave": ["RSI", "MACD", "EMA", "Volumen", "Divergencia", ...],
  "comentario": "Análisis crítico. DEBES mencionar explícitamente si el precio real confirma o contradice el gráfico. Justifica la entrada."
}

Sé extremadamente preciso con los niveles numéricos (entrada, salida, stop loss) y coherente con la dirección de la tendencia.

No inventes valores NUMÉRICOS (entrada, salida) si no se pueden estimar; usa null.

PERO los campos de TEXTO (patron_detectado, comentario, confianza) SIEMPRE deben tener contenido. Si no hay patrón claro, pon "Indefinido" o "Consolidación".

Usa tono profesional, analítico y breve.

IMPORTANTE: Responde ÚNICAMENTE con el objeto JSON, sin texto antes ni después.

Ejemplo de salida esperada:

{
  "tipo_analisis": "LONG",
  "entrada": 112.13,
  "salida": 116.09,
  "stop_loss": 111.40,
  "confianza": "Alta",
  "patron_detectado": "Tendencia alcista con soporte en EMA 50",
  "indicadores_clave": ["Volumen alto", "RSI > 60", "EMA 20 ascendente"],
  "comentario": "El gráfico muestra impulso alcista sostenido con volumen creciente. Se recomienda entrada moderada con gestión de riesgo ajustada."
}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: data.startsWith("data:image")
                    ? data
                    : `data:image/png;base64,${data}`,
                },
              },
            ],
          },
        ],
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      const message = result?.error?.message || "Error al comunicarse con OpenAI"
      return NextResponse.json({ error: message }, { status: response.status })
    }

    const content = result?.choices?.[0]?.message?.content || ""
    let parsedJSON: any = {}

    try {
      // Limpiar bloques de código Markdown si existen (```json ... ```)
      const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim()

      const match = cleanContent.match(/{[\s\S]*}/)
      if (match) {
        parsedJSON = JSON.parse(match[0])
      } else {
        throw new Error("No JSON found")
      }
    } catch (err) {
      console.warn("⚠️ No se pudo parsear el JSON:", err)
      console.log("Raw Content:", content) // Debug
      parsedJSON = {
        patron_detectado: "Análisis no estructurado",
        comentario: content || "Error al interpretar la respuesta de la IA.",
        confianza: "Baja"
      }
    }

    // ✅ Corrección automática de tipo_analisis si falta
    if (!parsedJSON["tipo_analisis"] && parsedJSON["entrada"] && parsedJSON["salida"]) {
      parsedJSON["tipo_analisis"] =
        Number(parsedJSON["salida"]) > Number(parsedJSON["entrada"]) ? "LONG" : "SHORT"
    }

    // 🧬 Inyectar Market Data real en la respuesta final para mostrar en el frontend
    if (marketData) {
      parsedJSON["datos_mercado"] = marketData
    }

    return NextResponse.json(parsedJSON)
  } catch (error) {
    console.error("❌ Error en /api/analyze-image:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "✅ Endpoint /api/analyze-image funcionando correctamente.",
  })
}
