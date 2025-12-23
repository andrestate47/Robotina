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
      
      <div className="text-center mb-6">
  <h3 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3 ">
    📈 Diagnóstico del Gráfico con IA
    <span className="text-xs font-semibold bg-white/15 text-white border border-white/30 px-2 py-1 rounded-full uppercase tracking-wide">
      Muy pronto disponible
    </span>
  </h3>
  <p className="text-sm text-white">
    Análisis generado automáticamente por nuestro modelo de inteligencia artificial
  </p>
</div>


      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 sm:p-6 bg-card/80 border border-border rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-foreground text-sm sm:text-base">Tendencia General</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">📊 Alcista</p>
          <p className="text-xs text-muted-foreground mt-1">Basada en el patrón detectado y volumen</p>
        </Card>

        <Card className="p-5 sm:p-6 bg-card/80 border border-border rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-5 h-5 text-accent" />
            <h4 className="font-semibold text-foreground text-sm sm:text-base">Nivel de Confianza IA</h4>
          </div>
          <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "78%" }}
              transition={{ duration: 1 }}
              className="absolute h-full bg-primary rounded-full"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">78% de seguridad en la predicción</p>
        </Card>

        <Card className="p-5 sm:p-6 bg-card/80 border border-border rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h4 className="font-semibold text-foreground text-sm sm:text-base">Volatilidad Estimada</h4>
          </div>
          <p className="text-2xl font-bold text-yellow-600">Media</p>
          <p className="text-xs text-muted-foreground mt-1">Basada en la amplitud de velas recientes</p>
        </Card>

        <Card className="p-5 sm:p-6 bg-card/80 border border-border rounded-xl shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-5 h-5 text-green-700" />
            <h4 className="font-semibold text-foreground text-sm sm:text-base">Recomendación IA</h4>
          </div>
          <p className="text-2xl font-bold text-green-700">Comprar</p>
          <p className="text-xs text-muted-foreground mt-1">Se detecta impulso alcista con soporte activo</p>
        </Card>
      </div>

      {/* Comentario IA */}
      
    </motion.div>
  )
}
