import { UploadArea } from "@/components/upload-area"
import { AnalysisResults } from "@/components/analysis-results"
import { TrendingUp, BarChart3, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-100">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">InvestAnalyzer</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Análisis
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Historial
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Ayuda
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 sm:mb-4 text-balance">
            Analiza tus inversiones con IA
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground text-pretty px-2">
            Sube capturas de pantalla de tus inversiones y obtén análisis detallados, recomendaciones y métricas clave
            en segundos.
          </p>
        </div>

        {/* Features */}
        

        {/* Sección explicativa premium */}
{/* Sección explicativa premium */}
{/* Sección explicativa premium con fondo verde/rojo y 3D lateral */}
<section className="relative w-full py-20 md:py-28 cyber-gradient overflow-hidden rounded-3xl border border-cyan-800/40 shadow-[0_0_25px_rgba(0,255,180,0.15)]">

  <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 md:px-10 gap-10 relative z-10">
    {/* Texto principal */}
    <div className="flex-1 text-center md:text-left space-y-4">
      <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
        Tu gráfico, <span className="text-primary">nuestra inteligencia.</span>
      </h2>
      <p className="text-base md:text-lg text-muted-foreground max-w-xl">
        Convierte una simple captura en una decisión inteligente.  
        Nuestra IA analiza patrones, tendencias y niveles de riesgo para ofrecerte una{" "}
        <span className="font-semibold text-foreground">recomendación precisa en segundos.</span>
      </p>
      <p className="text-base md:text-lg text-muted-foreground">
        Ideal para traders que quieren mejorar su lectura del mercado y tomar decisiones más seguras.
      </p>
      <p className="mt-4 text-base md:text-lg font-semibold text-primary flex items-center justify-center md:justify-start gap-2">
        💬 <span>Sube tu gráfico y deja que la IA te guíe.</span>
      </p>
      {/* Etiqueta "Muy pronto disponible" */}
      <div className="inline-block bg-yellow-50 border border-yellow-300 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full mt-3">
        🚧 Muy pronto disponible
      </div>
    </div>

    {/* Imagen 3D lateral */}
    <div className="flex-1 flex justify-center md:justify-end">
      <div className="relative w-[250px] md:w-[350px] lg:w-[420px]">
        <img
          src="/fondo-financiero-3d.png"
          alt="Panel IA Trading"
          className="w-full h-auto object-contain drop-shadow-2xl"
          style={{
            filter: "contrast(1.15) brightness(1.05)",
          }}
        />
        {/* Efecto de brillo y profundidad */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-black/10 rounded-2xl mix-blend-overlay pointer-events-none" />
      </div>
    </div>
  </div>

  {/* Gradiente de fondo rojo-verde más sutil */}
  <div className="absolute inset-0 bg-gradient-to-r from-green-200/10 via-transparent to-red-200/10 pointer-events-none" />
</section>





        {/* Upload Area */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <UploadArea />
        </div>

        {/* Analysis Results */}
        <AnalysisResults />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 sm:mt-16 md:mt-20">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>© 2025 InvestAnalyzer. Análisis de inversiones con inteligencia artificial.</p>
        </div>
      </footer>
    </div>
  )
}
