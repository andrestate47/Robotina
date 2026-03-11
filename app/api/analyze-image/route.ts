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
                  { type: "text", text: "Eres un trader experto en reconocimiento visual de datos. Tu ÚNICA y OBLIGATORIA tarea es mirar DETENIDAMENTE la ESQUINA SUPERIOR IZQUIERDA de la imagen y las MARCAS DE AGUA de fondo para encontrar el símbolo (Ticker) del activo.\n\nNO intentes adivinar por la forma de las velas. LEE EXCLUSIVAMENTE el texto.\n\nREGLAS ESTRICTAS DE EXTRACCIÓN ('Whitelisting'):\n1. Crypto (Prioridad absoluta): Si lees Bitcoin, BTC, BTCUSD, BTC/USD, Binance:BTCUSDT -> devuelve 'BTC'. Para Ethereum -> 'ETH'. Solana -> 'SOL'.\n2. Forex: Busca pares de divisas (ej. EUR/USD, AUD/CAD, USDJPY, AUD/USD). Devuelve SIEMPRE LAS 6 LETRAS JUNTAS SIN BARRA (ej. 'EURUSD', 'AUDCAD', 'AUDUSD').\n3. Materias Primas: Si lees Gold, Oro, XAU -> devuelve 'XAUUSD'. Plata, Silver, XAG -> 'XAGUSD'. Oil, WTI, Crude -> 'USOIL'.\n4. Índices (CRÍTICO): \n   - Si lees US30, US30Cash, WS30, Dow Jones, DJI -> devuelve 'US30'\n   - Si lees NAS100, NDX, US100, Nasdaq -> devuelve 'NAS100'\n   - Si lees SP500, SPX, US500, S&P 500 -> devuelve 'SPX'\n   - Si lees IBEX 35, IBEX -> devuelve 'IBEX35'\n   - Para otros globales (DAX, UK100), devuelve el nombre sin espacios.\n5. Acciones y Europeas: Si lees claramente AAPL, TSLA, NVDA, devuelve el código. Especial Europeo: Si lees 'Repsol' o 'Repsol S.A.', devuelve OBLIGATORIAMENTE 'REP.MC'.\n\nSI y SÓLO SI revisaste cada rincón y NO hay NINGÚN texto en la imagen (solo velas), devuelve 'UNKNOWN'.\n\nResponde ÚNICAMENTE con el símbolo oficial final en MAYÚSCULAS. NI UNA SOLA LETRA EXTRA. NO des explicaciones." },
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
        } else {
          console.log(`❌ IA no pudo identificar el símbolo (Devolvió: ${detectedObj})`);
          return NextResponse.json({
            error: "UNKNOWN_SYMBOL",
            message: "No pudimos identificar el activo en la imagen. Por favor, escribe el símbolo manualmente arriba de la imagen."
          }, { status: 400 });
        }
      } catch (e) {
        console.error("⚠️ Error detectando símbolo:", e)
      }
    }

    // Si después de todo sigue sin haber símbolo (ej. fallo de red en detección auto)
    if (!activeSymbol) {
      return NextResponse.json({
        error: "UNKNOWN_SYMBOL",
        message: "No pudimos identificar el activo en la imagen. Por favor, escríbelo en el buscador arriba."
      }, { status: 400 });
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
        temperature: 0.3, // Temperatura baja para precisión analítica, pero permitiendo razonamiento
        response_format: { type: "json_object" }, // Forzar JSON estricto
        messages: [
          {
            role: "system",
            content: "Eres un analista técnico institucional experto. Tu objetivo es encontrar OPORTUNIDADES ASIMÉTRICAS de mercado (LONG o SHORT). Tienes aversión a dar respuestas neutrales. Siempre intentas encontrar una ventaja direccional basada en la acción del precio. Responde siempre en formato JSON válido."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analiza la imagen adjunta a fondo. Busca sutiles pistas direccionales (velas de rechazo, roturas falsas, estructura de mercado en temporalidades menores).

${marketInfoText}

INSTRUCCIONES DIRECTIVAS - CRÍTICO:
1. FUERZA DIRECCIONAL: Evita a toda costa el análisis "NEUTRO". Incluso en canales laterales, suele haber una operativa lógica (ej. comprar soporte = LONG, vender resistencia = SHORT). Busca patrones como banderas, cuñas, o divergencias.
2. Usa "NEUTRO" *ÚNICAMENTE* si el gráfico es un caos total sin liquidez o si no hay absolutamente ningún setup con R:R lógico (algo extremadamente raro). Si detectas consolidación, pregúntate hacia dónde es más probable el quiebre y da ese sesgo.
3. INSTRUCCIONES CLAVE DE PRECIO:
   - Analiza el eje Y de la imagen. SI el precio visual es MUY diferente (>5%) del dato real ($${marketData?.price}), IGNORA EL DATO REAL y usa los precios de la imagen (gráfico histórico).
   - SI coinciden, usa el PRECIO REAL ($${marketData?.price}) como tu ancla exacta para la "entrada".
   - Si es LONG/SHORT, la "entrada" debe estar pegada al cierre de la última vela (precio actual).
   - Los objetivos (Salida) y Stop Loss deben ser lógicos y visibles en la escala de la imagen.

FORMATO JSON REQUERIDO:
{
  "tipo_analisis": "LONG" | "SHORT" | "NEUTRO",
  "entrada": number (Precio de entrada actual),
  "salida": number (Objetivo técnico principal),
  "stop_loss": number (Nivel lógico de invalidación técnica),
  "confianza": "Alta" | "Media" | "Baja",
  "patron_detectado": string (Se específico: ej. "Bandera Alcista en Consolidación", "Doble Techo con Falsa Rotura"),
  "indicadores_clave": string[] (ej. ["Absorción en soporte", "Contracción de volumen previa a expansión"]),
  "comentario": string (Justificación rápida de por qué tomaste este sesgo direccional)
}
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
