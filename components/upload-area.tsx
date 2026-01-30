
"use client"

import React, { useState, useCallback, useRef } from "react"
import { Upload, ImageIcon, X, BarChart3, AlertTriangle, CheckCircle2, Search, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface AnalysisResult {
  rendimiento?: string
  valorTotal?: string
  nivelRiesgo?: string
  diversificacion?: string
  volatilidad?: string
  beta?: string
  ratioSharpe?: string
  comentario?: string
  error?: string
  patron_detectado?: string
  tipo_analisis?: string
  confianza?: string
  entrada?: string
  salida?: string
  stop_loss?: string
  indicadores_clave?: string[]
  datos_mercado?: {
    symbol: string
    price: number
    change24h: number
    high24h?: number
    low24h?: number
    source: string
  }
}

const POPULAR_ASSETS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "XRP", name: "Ripple" },
  { symbol: "BNB", name: "Binance Coin" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "MATIC", name: "Polygon" },
  { symbol: "LTC", name: "Litecoin" },
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft" },
  { symbol: "GOOGL", name: "Alphabet (Google)" },
  { symbol: "AMZN", name: "Amazon" },
  { symbol: "TSLA", name: "Tesla" },
  { symbol: "NVDA", name: "Nvidia" },
  { symbol: "META", name: "Meta (Facebook)" },
  { symbol: "NFLX", name: "Netflix" },
  { symbol: "EURUSD", name: "Euro / US Dollar" },
  { symbol: "GBPUSD", name: "GBP / US Dollar" },
  { symbol: "USDJPY", name: "US Dollar / JPY" },
  { symbol: "XAUUSD", name: "Gold Spot / US Dollar" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF" },
  { symbol: "QQQ", name: "Invesco QQQ Trust" },
]

export function UploadArea() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [symbol, setSymbol] = useState("")
  const [tradingStyle, setTradingStyle] = useState("intraday")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🧲 Drag & Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }, [])

  // 📂 Input manual
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setUploadedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }, [])

  // 📋 Paste from clipboard
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files.length) {
        const file = e.clipboardData.files[0]
        if (file && file.type.startsWith("image/")) {
          e.preventDefault()
          const reader = new FileReader()
          reader.onload = (e) => setUploadedImage(e.target?.result as string)
          reader.readAsDataURL(file)
        }
      }
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [])

  // 🚀 Enviar imagen al backend
  const handleAnalyze = async () => {
    if (!uploadedImage) return
    setIsAnalyzing(true)
    setStatusMessage(null)
    setAnalysisResult(null)

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: uploadedImage, symbol, tradingStyle }),
      })

      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`)

      const data = await response.json()
      console.log("✅ Resultado del análisis:", data)

      let parsed: AnalysisResult = data
      if (typeof data === "string" && data.includes("{")) {
        try {
          parsed = JSON.parse(data.match(/{[\s\S]*}/)?.[0] || "{}")
        } catch {
          parsed = { comentario: "No se pudo interpretar el JSON del modelo." }
        }
      }

      if (parsed.error) setStatusMessage(`❌ ${parsed.error}`)
      else if (parsed.comentario) setStatusMessage(`⚠️ ${parsed.comentario}`)
      else setStatusMessage("✅ Análisis completado con éxito.")

      setAnalysisResult(parsed)
    } catch (error) {
      console.error("❌ Error analizando la imagen:", error)
      setStatusMessage("Error inesperado al procesar la imagen.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRemove = () => {
    setUploadedImage(null)
    setAnalysisResult(null)
    setStatusMessage(null)
  }

  const handleSelectClick = () => fileInputRef.current?.click()

  return (
    <div className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl border border-border shadow-lg">

      {/* Fondo con imagen */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg-trading-v2.png')" }}
      ></div>

      {/* Overlay suave */}
      {/* Overlay tipo cristal */}
      <div className="absolute inset-0 bg-[#0B2239]/55 backdrop-blur-sm"></div>

      {/* Contenido principal */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10">

        {/* Input de Símbolo (Nuevo) */}
        {!analysisResult && (
          <div className="mb-6 max-w-sm mx-auto">
            <Label htmlFor="symbol" className="text-white mb-2 block font-medium">
              Activo / Símbolo (Opcional)
            </Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="symbol"
                placeholder="Ej. BTC, AAPL, EURUSD"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-9 bg-background/50 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                autoComplete="off"
              />

              {/* Sugerencias de Autocompletado */}
              {showSuggestions && symbol.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f172a] border border-white/10 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                  {POPULAR_ASSETS.filter(
                    (asset) =>
                      asset.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
                      asset.name.toLowerCase().includes(symbol.toLowerCase())
                  ).length > 0 ? (
                    POPULAR_ASSETS.filter(
                      (asset) =>
                        asset.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
                        asset.name.toLowerCase().includes(symbol.toLowerCase())
                    ).map((asset) => (
                      <div
                        key={asset.symbol}
                        className="px-4 py-2 hover:bg-primary/20 cursor-pointer flex items-center justify-between text-sm transition-colors"
                        onPointerDown={() => {
                          setSymbol(asset.symbol)
                          setShowSuggestions(false)
                        }}
                      >
                        <span className="font-bold text-white">{asset.symbol}</span>
                        <span className="text-white/50 text-xs">{asset.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-xs text-white/30 text-center">
                      Sin coincidencias
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-[10px] text-white/60 mt-1.5 ml-1 mb-4">
              Ayuda a la IA a buscar precios precisos en tiempo real.
            </p>

            {/* Selector de Estilo de Trading */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "scalping", label: "Scalping", sub: "Mins" },
                { id: "intraday", label: "Intraday", sub: "Horas" },
                { id: "swing", label: "Swing", sub: "Días" }
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => setTradingStyle(style.id)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-2 text-center transition-all",
                    tradingStyle === style.id
                      ? "bg-primary/40 border-primary text-white font-bold shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <p className="text-xs font-bold">{style.label}</p>
                  <p className="text-[9px] opacity-70">{style.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-2xl transition-all duration-300",
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border bg-card hover:border-primary/50 hover:bg-muted/30",
            uploadedImage ? "p-3 sm:p-4" : "p-6 sm:p-8 md:p-12"
          )}
        >
          {!uploadedImage ? (
            // 🟢 Estado inicial
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Sube tu captura de inversión</h3>
              <p className="text-base text-muted-orange mb-6 max-w-md mx-auto">
                Arrastra una imagen o haz clic para seleccionarla
              </p>
              <Button size="lg" onClick={handleSelectClick}>
                <ImageIcon className="w-5 h-5 mr-2" /> Seleccionar imagen
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
              <p className="text-xs text-primary mt-4">Formatos soportados: JPG, PNG, WebP (máx. 10MB)</p>
            </div>
          ) : (
            // 🟠 Imagen subida
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-muted">
                <img
                  src={uploadedImage}
                  alt="Captura de inversión"
                  className="w-full h-auto max-h-[500px] object-contain transition-opacity duration-500"
                />
                <button
                  onClick={handleRemove}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-destructive/90 hover:bg-destructive text-destructive-foreground flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto sm:min-w-[200px]"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5 mr-2" /> Analizar inversión
                    </>
                  )}
                </Button>
              </div>

              {/* 📡 Estado del análisis */}


              {/* 📡 Estado del análisis */}
              {statusMessage && !analysisResult && (
                <div className="mt-4 p-3 rounded-lg bg-card/60 border border-white/10 text-center animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-sm font-medium text-white/80">{statusMessage}</p>
                </div>
              )}

              {/* 🟢 Resultados */}
              {analysisResult && !analysisResult.error && (
                <motion.div
                  className="mt-4 p-4 rounded-lg bg-muted/40 border border-border space-y-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <motion.div
                      whileInView={{
                        rotate: [0, -15, 10, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut"
                      }}
                    >
                      <Search className="w-5 h-5 text-primary" />
                    </motion.div>
                    Lector de Gráficas
                    {analysisResult.datos_mercado && (
                      <span className="text-[10px] font-normal bg-blue-900/30 text-blue-400 border border-blue-800/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        En Vivo • {analysisResult.datos_mercado.source}
                      </span>
                    )}
                  </h3>

                  {/* 📊 Datos de Mercado en Tiempo Real (Si existen) */}
                  {analysisResult.datos_mercado && (
                    <div className="bg-[#0f172a] border border-blue-500/20 rounded-lg p-3 flex items-center justify-between shadow-sm z-20 relative">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Coins className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                            {analysisResult.datos_mercado.symbol}
                          </p>
                          <p className="text-lg font-bold text-white leading-none">
                            ${analysisResult.datos_mercado.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-bold flex flex-col items-end justify-center min-w-[100px]">
                        <span className="text-[10px] text-white/50 font-normal mb-1 uppercase tracking-wider">Rango Día ($)</span>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-green-400 text-xs flex items-center gap-1">
                            <span className="text-[9px] opacity-70">H:</span>
                            {analysisResult.datos_mercado.high24h ? analysisResult.datos_mercado.high24h.toLocaleString() : "N/A"}
                          </span>
                          <span className="text-red-400 text-xs flex items-center gap-1">
                            <span className="text-[9px] opacity-70">L:</span>
                            {analysisResult.datos_mercado.low24h ? analysisResult.datos_mercado.low24h.toLocaleString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fila 1: Patrón y (Tipo + Confianza) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Patrón detectado */}
                    <div className="bg-card/60 border p-2 rounded-lg flex flex-col justify-center">
                      <p className="text-xs text-muted-foreground">📉 Patrón detectado</p>
                      <p className="text-sm font-semibold text-foreground">
                        {analysisResult.patron_detectado || "—"}
                      </p>
                    </div>

                    {/* Tipo de análisis y confianza */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-card/60 border p-2 rounded-lg text-center flex flex-col items-center justify-center">
                        <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1 justify-center">
                          {analysisResult.tipo_analisis === "LONG" ? (
                            <motion.span
                              animate={{ y: [0, -3, 0], scale: [1, 1.1, 1] }}
                              transition={{ duration: 3, ease: "easeInOut" }}
                              className="text-base inline-block"
                            >
                              🐂
                            </motion.span>
                          ) : analysisResult.tipo_analisis === "SHORT" ? (
                            <motion.span
                              animate={{ y: [0, 3, 0], scale: [1, 1.1, 1] }}
                              transition={{ duration: 3, ease: "easeInOut" }}
                              className="text-base inline-block"
                            >
                              🐻
                            </motion.span>
                          ) : (
                            "📊"
                          )}
                          Tipo
                        </p>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            analysisResult.tipo_analisis === "LONG"
                              ? "text-green-600"
                              : analysisResult.tipo_analisis === "SHORT"
                                ? "text-red-600"
                                : "text-foreground"
                          )}
                        >
                          {analysisResult.tipo_analisis || "—"}
                        </p>
                      </div>

                      <div className="bg-card/60 border p-2 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">🎯 Confianza</p>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            analysisResult.confianza === "Alta"
                              ? "text-green-600"
                              : analysisResult.confianza === "Media"
                                ? "text-yellow-600"
                                : "text-red-600"
                          )}
                        >
                          {analysisResult.confianza || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Entrada / TP */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 text-blue-800 rounded-lg p-2 text-center shadow-sm flex flex-col justify-center">
                      <p className="text-xs font-medium">🎯 Entrada</p>
                      <p className="text-sm font-bold">{analysisResult.entrada ? `$${analysisResult.entrada}` : "N/A"}</p>
                    </div>
                    {/* TP Container Loop */}
                    <div className="flex flex-col gap-1">
                      <div className="bg-green-50/80 text-green-800 rounded-lg p-1.5 text-center shadow-sm flex items-center justify-between px-3">
                        <p className="text-[10px] font-medium">TP 1</p>
                        <p className="text-xs font-bold">
                          {analysisResult.entrada && analysisResult.salida
                            ? `$${(Number(analysisResult.entrada) + (Number(analysisResult.salida) - Number(analysisResult.entrada)) / 2).toFixed(2)}`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="bg-green-50 text-green-800 rounded-lg p-1.5 text-center shadow-sm flex items-center justify-between px-3">
                        <p className="text-[10px] font-medium">TP 2</p>
                        <p className="text-xs font-bold">{analysisResult.salida ? `$${analysisResult.salida}` : "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stop Loss */}
                  <div className="bg-red-50 text-red-800 rounded-lg p-2 text-center shadow-sm">
                    <p className="text-xs font-medium">🛑 Stop Loss</p>
                    <p className="text-sm font-bold">{analysisResult.stop_loss ? `$${analysisResult.stop_loss}` : "N/A"}</p>
                  </div>

                  {/* Indicadores clave */}
                  <div className="bg-card border p-2 rounded-lg space-y-2">
                    <p className="text-xs text-muted-foreground">🧩 Indicadores clave</p>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(analysisResult.indicadores_clave) &&
                        analysisResult.indicadores_clave.length > 0 ? (
                        analysisResult.indicadores_clave.map((ind, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                          >
                            {ind}
                          </span>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">Sin indicadores detectados</p>
                      )}
                    </div>
                  </div>

                  {/* Comentario */}
                  {analysisResult.comentario && (
                    <div className="border border-white/10 bg-slate-950/60 p-3 rounded-xl shadow-inner">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-4 bg-amber-400 rounded-full"></div>
                        <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">Comentario del Analista</p>
                      </div>
                      <p className="text-sm text-gray-200 leading-relaxed font-light tracking-wide">{analysisResult.comentario}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
