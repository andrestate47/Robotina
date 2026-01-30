"use client"

import { motion } from "framer-motion"
import { Activity, Brain, TrendingUp, AlertTriangle, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function AnalysisResults() {
  const hasResults = true
  if (!hasResults) return null

  return (

    <motion.div


      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="
relative max-w-5xl mx-auto space-y-8 p-6 sm:p-8 rounded-2xl
bg-gradient-to-br
from-[#1c2032]
via-[#1c2032]
to-[#1c2032]
overflow-hidden
"
    >
      {/* Header */}

      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-white mb-1 flex items-center justify-center gap-2 ">
          📈 Diagnóstico del Gráfico con IA
          <span className="text-[9px] font-semibold bg-white/15 text-white border border-white/30 px-1.5 py-0 rounded-full uppercase tracking-wide">
            Muy pronto disponible
          </span>
        </h3>
        <p className="text-xs text-white">
          Análisis generado automáticamente por nuestro modelo de inteligencia artificial
        </p>
      </div>


      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3 bg-card/80 border border-border rounded-lg shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-foreground text-sm">Tendencia</h4>
          </div>
          <p className="text-lg font-bold text-green-600">📊 Alcista</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Basada en patrón y volumen</p>
        </Card>

        <Card className="p-3 bg-card/80 border border-border rounded-lg shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-accent" />
            <h4 className="font-semibold text-foreground text-sm">Confianza IA</h4>
          </div>
          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "78%" }}
              transition={{ duration: 1 }}
              className="absolute h-full bg-primary rounded-full"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">78% de seguridad</p>
        </Card>

        <Card className="p-3 bg-card/80 border border-border rounded-lg shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
            <h4 className="font-semibold text-foreground text-xs leading-tight">Volatilidad</h4>
          </div>
          <p className="text-lg font-bold text-yellow-600">Media</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Basada en velas recientes</p>
        </Card>

        <Card className="p-3 bg-card/80 border border-border rounded-lg shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-green-700 flex-shrink-0" />
            <h4 className="font-semibold text-foreground text-xs leading-tight">Recomendación</h4>
          </div>
          <p className="text-lg font-bold text-green-700">Comprar</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Impulso alcista con soporte</p>
        </Card>
      </div>

      {/* Comentario IA */}

    </motion.div>
  )
}
