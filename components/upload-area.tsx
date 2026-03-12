
"use client"

import React, { useState, useCallback, useRef } from "react"
import { Upload, ImageIcon, X, BarChart3, AlertTriangle, CheckCircle2, Search, Coins, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
  es_historico?: boolean
  warnings?: string[]
}

const getCurrencySymbol = (sym: string | undefined): string => {
  if (!sym) return "$";
  const s = sym.toUpperCase();
  if (s.includes(".MC") || s.includes("EUR") || s.includes("IBEX") || s.includes("DAX") || s.includes("GER40") || s.includes(".MA")) return "€";
  if (s.includes("GBP") || s.includes("FTSE") || s.includes("UK100") || s.includes(".L")) return "£";
  if (s.includes("JPY")) return "¥";
  return "$";
}

const formatPrice = (price: number | string | undefined, symbol?: string): string => {
  if (price === undefined || price === null || isNaN(Number(price))) return "N/A";
  const numPrice = Number(price);
  let decimals = 2;

  if (numPrice < 5) decimals = 4;
  else if (symbol && (symbol.toUpperCase().includes(".MC") || symbol.toUpperCase().includes("EUR") || symbol.toUpperCase().includes("IBEX") || symbol.toUpperCase().includes("DAX"))) {
    decimals = 3;
  }

  return numPrice.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

const POPULAR_ASSETS = [
  // ÍNDICES FAMOSOS
  { symbol: "SPY", name: "S&P 500 (ETF)", category: "Índice" },
  { symbol: "QQQ", name: "Nasdaq 100", category: "Índice" },
  { symbol: "DIA", name: "Dow Jones 30", category: "Índice" },
  { symbol: "US30", name: "Wall Street 30", category: "Índice" },
  { symbol: "GER40", name: "DAX 40 (Alemania)", category: "Índice" },

  // ACCIONES FAMOSAS
  { symbol: "TSLA", name: "Tesla Inc.", category: "Acción" },
  { symbol: "NVDA", name: "Nvidia Corp.", category: "Acción" },
  { symbol: "AAPL", name: "Apple Inc.", category: "Acción" },
  { symbol: "MSFT", name: "Microsoft", category: "Acción" },
  { symbol: "AMZN", name: "Amazon", category: "Acción" },
  { symbol: "GOOGL", name: "Google", category: "Acción" },
  { symbol: "META", name: "Meta (Facebook)", category: "Acción" },
  { symbol: "NFLX", name: "Netflix", category: "Acción" },

  // FOREX & METALES
  { symbol: "XAUUSD", name: "Oro (Gold)", category: "Commodity" },
  { symbol: "WTI", name: "Petróleo (Crudo)", category: "Commodity" },
  { symbol: "EURUSD", name: "Euro / Dólar", category: "Forex" },
  { symbol: "GBPUSD", name: "Libra / Dólar", category: "Forex" },
  { symbol: "USDJPY", name: "Dólar / Yen", category: "Forex" },

  // CRYPTO TOP
  { symbol: "BTC", name: "Bitcoin", category: "Crypto" },
  { symbol: "ETH", name: "Ethereum", category: "Crypto" },
  { symbol: "SOL", name: "Solana", category: "Crypto" },
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
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
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
  const saveToHistory = (parsed: any) => {
    try {
      const historyRaw = localStorage.getItem("analysisHistory")
      let history = historyRaw ? JSON.parse(historyRaw) : []
      // Insertar al inicio y mantener máximo 4
      history.unshift({
        ...parsed,
        timestamp: Date.now()
      })
      if (history.length > 4) history = history.slice(0, 4)
      localStorage.setItem("analysisHistory", JSON.stringify(history))

      // Incrementar contador global
      const currentCount = localStorage.getItem("analysisCount")
      const newCount = currentCount ? parseInt(currentCount) + 1 : 1
      localStorage.setItem("analysisCount", newCount.toString())

      // Guardar ratio de LONG / SHORT para métricas reales
      if (parsed.tipo_analisis === "LONG") {
        const longs = localStorage.getItem("analysisLongs")
        localStorage.setItem("analysisLongs", longs ? (parseInt(longs) + 1).toString() : "1")
      } else if (parsed.tipo_analisis === "SHORT") {
        const shorts = localStorage.getItem("analysisShorts")
        localStorage.setItem("analysisShorts", shorts ? (parseInt(shorts) + 1).toString() : "1")
      }
    } catch (e) {
      console.warn("No se pudo guardar historial")
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedImage) return
    setIsAnalyzing(true)
    setStatusMessage(null)
    setAnalysisResult(null)
    setUserVote(null) // Resetear voto para el nuevo análisis
    localStorage.removeItem("lastAnalysisVote")

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: uploadedImage, symbol, tradingStyle }),
      })

      const data = await response.json()

      if (!response.ok && !data.error) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      console.log("✅ Resultado del análisis:", data)

      let parsed: AnalysisResult = data
      if (typeof data === "string" && data.includes("{")) {
        try {
          parsed = JSON.parse(data.match(/{[\s\S]*}/)?.[0] || "{}")
        } catch {
          parsed = { comentario: "No se pudo interpretar el JSON del modelo." }
        }
      }

      if (parsed.error) {
        if (parsed.error === "UNKNOWN_SYMBOL" || data.error === "UNKNOWN_SYMBOL") {
          setStatusMessage("❗ No pude identificar el activo automáticamente. Escribe el símbolo en el buscador de arriba.");
        } else {
          setStatusMessage(`❌ ${parsed.error || data.error}`);
        }
        setAnalysisResult(null);
      }
      else if (parsed.comentario) {
        setStatusMessage(`⚠️ ${parsed.comentario}`)
        setAnalysisResult(parsed)
        try {
          localStorage.setItem("lastAnalysisResult", JSON.stringify(parsed))
          saveToHistory(parsed)
          window.dispatchEvent(new Event("newAnalysisSaved"))
        } catch (e) {
          console.warn("No se pudo guardar en el caché local.")
        }
      }
      else {
        setStatusMessage("✅ Análisis completado con éxito.")
        setAnalysisResult(parsed)
        try {
          localStorage.setItem("lastAnalysisResult", JSON.stringify(parsed))
          saveToHistory(parsed)
          window.dispatchEvent(new Event("newAnalysisSaved"))
        } catch (e) {
          console.warn("No se pudo guardar en el caché local.")
        }
      }

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
    // No borramos de localStorage para que 'Último Análisis' sobreviva (Petición del usuario)
  }

  const handleSelectClick = () => fileInputRef.current?.click()

  // ⚡ Teclado: ENTER para analizar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && uploadedImage && !isAnalyzing) {
        handleAnalyze()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [uploadedImage, isAnalyzing, handleAnalyze])

  return (
    <div className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl border border-border shadow-lg">

      {/* Nuevo Fondo Premium - Degradado Profundo con Efecto de Luz */}
      <div className="absolute inset-0 bg-[#07070a]">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10">

        {/* Input de Símbolo (Nuevo) */}
        {!analysisResult && (
          <div className="mb-3 max-w-[220px] mx-auto">
            <Label htmlFor="symbol" className="text-white mb-1.5 block font-medium text-xs">
              Activo / Símbolo (Opcional)
            </Label>
            <div className="relative">
              <Coins className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                id="symbol"
                placeholder="Ej. BTC, AAPL"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-8 h-8 text-xs bg-background/50 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                autoComplete="off"
              />

              {/* Sugerencias de Autocompletado (Active Search) */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f172a]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto custom-scrollbar">
                  {symbol.length === 0 ? (
                    <div className="py-2">
                      <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-white/40 font-bold">💎 Top Activos</p>
                      {POPULAR_ASSETS.slice(0, 6).map((asset) => (
                        <div
                          key={asset.symbol}
                          className="px-3 py-2 hover:bg-white/5 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          onPointerDown={() => {
                            setSymbol(asset.symbol)
                            setShowSuggestions(false)
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{asset.symbol}</span>
                            <span className="text-white/40 text-[9px]">{asset.name}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-white/5 text-white/50 text-[8px] font-medium border border-white/5">
                            {asset.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {POPULAR_ASSETS.filter(
                        (asset) =>
                          asset.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
                          asset.name.toLowerCase().includes(symbol.toLowerCase()) ||
                          asset.category?.toLowerCase().includes(symbol.toLowerCase())
                      ).length > 0 ? (
                        POPULAR_ASSETS.filter(
                          (asset) =>
                            asset.symbol.toLowerCase().includes(symbol.toLowerCase()) ||
                            asset.name.toLowerCase().includes(symbol.toLowerCase()) ||
                            asset.category?.toLowerCase().includes(symbol.toLowerCase())
                        ).map((asset) => (
                          <div
                            key={asset.symbol}
                            className="px-3 py-2 hover:bg-primary/20 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                            onPointerDown={() => {
                              setSymbol(asset.symbol)
                              setShowSuggestions(false)
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-white group-hover:text-primary-foreground transition-colors">{asset.symbol}</span>
                              <span className="text-white/40 text-[9px] group-hover:text-white/70">{asset.name}</span>
                            </div>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-tighter border",
                              asset.category === "Índice" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                                asset.category === "Acción" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                  asset.category === "Crypto" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                                    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            )}>
                              {asset.category}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-[10px] text-white/30 text-center italic">
                          No se encontraron coincidencias
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="text-[9px] text-white/60 mt-1 ml-0.5 mb-2 leading-tight">
              Ayuda a la IA a buscar precios precisos.
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
              ? "border-primary bg-primary/10 scale-[1.02]"
              : "border-white/10 bg-white/[0.03] hover:border-primary/50 hover:bg-white/[0.07]",
            uploadedImage ? "p-3 sm:p-4" : "p-6 sm:p-8 md:p-12"
          )}
        >
          <AnimatePresence mode="wait">
            {!uploadedImage ? (
              // 🟢 Estado inicial
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">
                  Sube tu captura de inversión
                </h3>
                <p className="text-base text-muted-orange mb-6 max-w-md mx-auto">
                  Arrastra una imagen o haz clic para seleccionarla
                </p>
                <Button size="lg" onClick={handleSelectClick}>
                  <ImageIcon className="w-5 h-5 mr-2" /> Seleccionar imagen
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
                <p className="text-xs text-primary mt-4">Formatos soportados: JPG, PNG, WebP (máx. 10MB)</p>
              </motion.div>
            ) : (
              // 🟠 Imagen subida
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="relative rounded-xl overflow-hidden bg-muted">
                  <img
                    src={uploadedImage || undefined}
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
                    {/* 🚨 ALERTAS DEL SISTEMA (Validación Lógica) */}
                    {(analysisResult.es_historico || (analysisResult.warnings && analysisResult.warnings.length > 0)) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="border border-yellow-500/50 bg-yellow-900/60 backdrop-blur-sm shadow-xl rounded-xl p-4 mb-2"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5 drop-shadow-md" />
                          <div>
                            <h4 className="text-base font-bold text-yellow-300 drop-shadow-sm mb-1">
                              {analysisResult.es_historico ? "Modo Análisis Histórico" : "Advertencia de Lógica"}
                            </h4>
                            <div className="text-sm font-medium text-yellow-50 space-y-1.5 leading-relaxed">
                              {analysisResult.es_historico && (
                                <p>El precio en la imagen difiere del mercado real. Se asume que es un backtest o gráfico antiguo.</p>
                              )}
                              {analysisResult.warnings?.map((w, idx) => (
                                <p key={idx}>• {w}</p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

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
                        <span className={cn(
                          "text-[10px] font-bold border px-2 py-0.5 rounded-full flex items-center gap-1",
                          analysisResult.datos_mercado.source === "Polygon"
                            ? "bg-indigo-900/40 text-indigo-400 border-indigo-500/50"
                            : "bg-blue-900/30 text-blue-400 border-blue-800/50"
                        )}>
                          <span className="relative flex h-2 w-2">
                            <span className={cn(
                              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                              analysisResult.datos_mercado.source === "Polygon" ? "bg-indigo-400" : "bg-blue-400"
                            )}></span>
                            <span className={cn(
                              "relative inline-flex rounded-full h-2 w-2",
                              analysisResult.datos_mercado.source === "Polygon" ? "bg-indigo-500" : "bg-blue-500"
                            )}></span>
                          </span>
                          En Vivo • {analysisResult.datos_mercado.source === "Polygon" ? "Polygon PRO" : analysisResult.datos_mercado.source}
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
                              {getCurrencySymbol(analysisResult.datos_mercado.symbol)}{formatPrice(analysisResult.datos_mercado.price, analysisResult.datos_mercado.symbol)}
                            </p>
                            <p className="text-[9px] text-white/40 mt-1">
                              Actualizado: {new Date().toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right px-2 sm:px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-bold flex flex-col items-end justify-center min-w-0 sm:min-w-[100px]">
                          <span className="text-[9px] sm:text-[10px] text-white/50 font-normal mb-1 uppercase tracking-wider whitespace-nowrap">Rango Día ({getCurrencySymbol(analysisResult.datos_mercado.symbol)})</span>
                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5">
                            <span className="text-green-400 text-[10px] sm:text-xs flex items-center gap-1">
                              <span className="text-[8px] sm:text-[9px] opacity-70">H:</span>
                              {analysisResult.datos_mercado.high24h
                                ? formatPrice(analysisResult.datos_mercado.high24h, analysisResult.datos_mercado.symbol)
                                : "N/A"}
                            </span>
                            <span className="text-red-400 text-[10px] sm:text-xs flex items-center gap-1">
                              <span className="text-[8px] sm:text-[9px] opacity-70">L:</span>
                              {analysisResult.datos_mercado.low24h
                                ? formatPrice(analysisResult.datos_mercado.low24h, analysisResult.datos_mercado.symbol)
                                : "N/A"}
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
                      <div className="bg-blue-50 text-blue-800 rounded-lg p-2 text-center shadow-sm flex flex-col justify-center aura-entry">
                        <p className="text-xs font-medium">🎯 Entrada</p>
                        <p className="text-sm font-bold flex items-baseline justify-center">
                          {analysisResult.entrada ? (
                            <>
                              <span className="text-[0.65em] opacity-70 mr-1 font-semibold text-blue-900/60 uppercase">
                                {getCurrencySymbol(analysisResult.datos_mercado?.symbol)}
                              </span>
                              {formatPrice(analysisResult.entrada, analysisResult.datos_mercado?.symbol)}
                            </>
                          ) : "N/A"}
                        </p>
                      </div>
                      {/* TP Container Loop */}
                      <div className="flex flex-col gap-1">
                        <div className="bg-green-50/80 text-green-800 rounded-lg p-1.5 text-center shadow-sm flex items-center justify-between px-3 aura-tp">
                          <p className="text-[10px] font-medium">TP 1</p>
                          <p className="text-xs font-bold flex items-baseline">
                            {analysisResult.entrada && analysisResult.salida ? (
                              <>
                                <span className="text-[0.7em] opacity-70 mr-1 font-semibold text-green-900/60 uppercase">
                                  {getCurrencySymbol(analysisResult.datos_mercado?.symbol)}
                                </span>
                                {formatPrice(Number(analysisResult.entrada) + (Number(analysisResult.salida) - Number(analysisResult.entrada)) / 2, analysisResult.datos_mercado?.symbol)}
                              </>
                            ) : "N/A"}
                          </p>
                        </div>
                        <div className="bg-green-50 text-green-800 rounded-lg p-1.5 text-center shadow-sm flex items-center justify-between px-3 aura-tp">
                          <p className="text-[10px] font-medium">TP 2</p>
                          <p className="text-xs font-bold flex items-baseline">
                            {analysisResult.salida ? (
                              <>
                                <span className="text-[0.7em] opacity-70 mr-1 font-semibold text-green-900/60 uppercase">
                                  {getCurrencySymbol(analysisResult.datos_mercado?.symbol)}
                                </span>
                                {formatPrice(analysisResult.salida, analysisResult.datos_mercado?.symbol)}
                              </>
                            ) : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stop Loss */}
                    <div className="bg-red-50 text-red-800 rounded-lg p-2 text-center shadow-sm aura-sl">
                      <p className="text-xs font-medium">🛑 Stop Loss</p>
                      <p className="text-sm font-bold flex items-baseline justify-center">
                        {analysisResult.stop_loss ? (
                          <>
                            <span className="text-[0.65em] opacity-70 mr-1 font-semibold text-red-900/60 uppercase">
                              {getCurrencySymbol(analysisResult.datos_mercado?.symbol)}
                            </span>
                            {formatPrice(analysisResult.stop_loss, analysisResult.datos_mercado?.symbol)}
                          </>
                        ) : "N/A"}
                      </p>
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

                    {/* Feedback: Votación del Usuario */}
                    {/* Footer de Acciones (OK & Feedback) */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5 mt-4">
                      {/* Botón OK Centralizado/Principal */}
                      <div className="flex-1 flex justify-center sm:justify-start w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setUploadedImage(null);
                            setAnalysisResult(null);
                            setStatusMessage(null);
                            setUserVote(null);
                            setSymbol("");
                            // Forzamos "refresco" y dejar en cero sin borrar memoria del Right Widget
                          }}
                          className="w-full sm:w-auto px-8 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 group"
                        >
                          OK, Cerrar Análisis
                          <CheckCircle2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                        </button>
                      </div>

                      {/* Votación al extremo derecho */}
                      <div className="flex items-center shrink-0 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                        {!userVote ? (
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">¿Útil?</span>
                            <button
                              onClick={() => {
                                setUserVote("up")
                                localStorage.setItem("lastAnalysisVote", "up")
                                const currentUp = parseInt(localStorage.getItem("analysisUpvotes") || "0")
                                localStorage.setItem("analysisUpvotes", (currentUp + 1).toString())
                                window.dispatchEvent(new Event("newAnalysisSaved"))
                                fetch("https://script.google.com/macros/s/AKfycbxV04IAgtqn7317hMOx5Bqjs-BHGB7UjdGDNYDKHKoGkO2KLLzPEenK1_RtlfaCQEvi2A/exec", {
                                  method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    date: new Date().toLocaleString("es-ES", { timeZone: "America/New_York" }), vote: "UP",
                                    symbol: analysisResult?.datos_mercado?.symbol || "N/A", price: analysisResult?.entrada || "N/A", comment: "Voto Directo Web"
                                  })
                                })
                              }}
                              className="p-2 hover:bg-emerald-500/30 hover:text-emerald-400 text-white rounded-lg transition-all group shadow-md bg-white/10 border border-white/10"
                              title="Buen análisis"
                            >
                              <ThumbsUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => {
                                setUserVote("down")
                                localStorage.setItem("lastAnalysisVote", "down")
                                const currentDown = parseInt(localStorage.getItem("analysisDownvotes") || "0")
                                localStorage.setItem("analysisDownvotes", (currentDown + 1).toString())
                                window.dispatchEvent(new Event("newAnalysisSaved"))
                                fetch("https://script.google.com/macros/s/AKfycbxV04IAgtqn7317hMOx5Bqjs-BHGB7UjdGDNYDKHKoGkO2KLLzPEenK1_RtlfaCQEvi2A/exec", {
                                  method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    date: new Date().toLocaleString("es-ES", { timeZone: "America/New_York" }), vote: "DOWN",
                                    symbol: analysisResult?.datos_mercado?.symbol || "N/A", price: analysisResult?.entrada || "N/A", comment: "Voto Directo Web"
                                  })
                                })
                              }}
                              className="p-2 hover:bg-rose-500/30 hover:text-rose-400 text-white rounded-lg transition-all group shadow-md bg-white/10 border border-white/10"
                              title="Mal análisis"
                            >
                              <ThumbsDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        ) : (
                          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-[10px] text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>¡Gracias por tu feedback!</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
