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
                  { type: "text", text: "Look at the text in the chart image carefully. Identify the financial asset displayed. Your goal is to return the PRECISE Ticker Symbol used in financial markets (Yahoo Finance style pref).\n\nCRITICAL RULES:\n1. If you see specific text like 'S&P 500 Pure Growth', return '^SP500PG' (or appropriate ETF like 'RPG').\n2. If you see a code in parentheses like '(SPBUYUN)', RETURN 'SPBUYUN'.\n3. DO NOT generalize specialized S&P indices to just 'SPX'.\n4. 'Nasdaq 100' -> 'NDX'. 'Gold' -> 'GC=F'. 'Bitcoin' -> 'BTC-USD'.\n5. If the image has a clear ticker like 'AAPL', 'TSLA', 'EURUSD', return it exactly.\n\nReturn ONLY the symbol string. No explanations." },
                  { type: "image_url", image_url: { url: data.startsWith("data:image") ? data : `data:image/png;base64,${data}` } },
                ],
              },
            ],
            max_tokens: 20,
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
DATA DE MERCADO REAL (${marketData.source}) - REFERENCIA:
- Activo: ${marketData.symbol}
- Precio Actual: $${marketData.price}
- Cambio 24h: ${marketData.change24h}%
- Volumen: ${marketData.volume24h}

Usa estos datos como contexto adicional para validar tu análisis gráfico.
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
        response_format: { type: "json_object" }, // Forzar JSON estricto
        messages: [
          {
            role: "system",
            content: "Eres un asistente experto en análisis técnico de gráficos financieros. Tu tarea es extraer información visual y proporcionar niveles técnicos de referencia basados puramente en la acción del precio observada. Responde siempre en formato JSON válido."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analiza la imagen adjunta. Identifica patrones técnicos y niveles clave.

${marketInfoText}

INSTRUCCIONES CLAVE DE PRECIO:
1. Analiza el eje Y de la imagen. SI el precio en el gráfico es MUY diferente (>5%) del dato real provisto ($${marketData?.price}), IGNORA EL DATO REAL y usa los precios de la imagen (asume que es un gráfico histórico o backtest).
2. SI los precios coinciden aproximadamente, usa el PRECIO REAL ($${marketData?.price}) como ancla de precisión.
3. Si es LONG, la "entrada" debe ser el nivel lógico actual en la imagen.
4. Si es SHORT, la "entrada" debe ser el nivel lógico actual en la imagen.
5. Los objetivos (Salida) y Stop Loss deben ser coherentes con la escala VISUAL de la imagen.

FORMATO JSON REQUERIDO:
{
  "tipo_analisis": "LONG" | "SHORT" | "NEUTRO",
  "entrada": number (Precio de ejecución sugerido, cercano al precio real),
  "salida": number (Objetivo técnico / Take Profit),
  "stop_loss": number (Nivel de invalidación),
  "confianza": "Alta" | "Media" | "Baja",
  "patron_detectado": string (ej. "Doble Suelo", "Tendencia Alcista"),
  "indicadores_clave": string[] (ej. ["RSI sobreventa", "Volumen alto"]),
  "comentario": string (Explicación breve del setup)
}

Reglas:
- Si no hay datos reales provistos, estima basado en la escala del eje Y de la imagen.
- NO INVENTES PRECIOS LEJANOS AL ACTUAL si la imagen es reciente.
- IMPORTANTE: Si es un rango lateral claro, marca "NEUTRO".
`
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

    // 🔍 Paso 3: Análisis y Validación Post-IA (El "Árbitro")
    const { tipo_analisis, entrada, salida, stop_loss } = parsedJSON
    let validationWarnings: string[] = []
    let isHistorical = false

    // 3.1 validación de Coherencia Matemática
    if (tipo_analisis === "LONG") {
      if (salida <= entrada) validationWarnings.push("Take Profit ilógico para un LONG (debe ser mayor a la entrada).")
      if (stop_loss >= entrada) validationWarnings.push("Stop Loss ilógico para un LONG (debe ser menor a la entrada).")
    } else if (tipo_analisis === "SHORT") {
      if (salida >= entrada) validationWarnings.push("Take Profit ilógico para un SHORT (debe ser menor a la entrada).")
      if (stop_loss <= entrada) validationWarnings.push("Stop Loss ilógico para un SHORT (debe ser mayor a la entrada).")
    }

    // 3.2 Validación de Realidad (Imagen vs Precio Real)
    if (marketData && parsedJSON.entrada) {
      const diffPercent = Math.abs((marketData.price - parsedJSON.entrada) / marketData.price) * 100
      if (diffPercent > 5) {
        isHistorical = true
        console.log(`⚠️ Detectado gráfico histórico/diferente. Diferencia precio: ${diffPercent.toFixed(2)}%`)
        validationWarnings.push(`El precio en la imagen ($${parsedJSON.entrada}) difiere significativamente del mercado actual ($${marketData.price}). Análisis tratado como HISTÓRICO.`)
      }
    }

    // 3.3 Ajuste final de Confianza
    if (validationWarnings.length > 0) {
      parsedJSON["confianza"] = "Baja"
      parsedJSON["comentario"] += "\n\n⚠️ NOTAS DEL SISTEMA: " + validationWarnings.join(" ")
    }

    // 🧬 Inyectar metadata enriquecida
    parsedJSON["es_historico"] = isHistorical
    parsedJSON["warnings"] = validationWarnings
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
