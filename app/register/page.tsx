"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BorderBeam } from "@/components/magicui/border-beam";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const router = useRouter();

    // Mouse tracking state for the interactive glow
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setErrorMsg(error.message);
            setIsLoading(false);
        } else {
            setSuccessMsg("¡Cuenta creada con éxito! Ya puedes iniciar sesión.");
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        }
    };

    // Background floating particles representing "growth" and "money"
    const [particles, setParticles] = useState<Array<{ id: number, size: number, x: number, y: number, duration: number, delay: number }>>([]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Solo generar partículas si NO es móvil por rendimiento
        if (window.innerWidth >= 768) {
            setParticles(
                Array.from({ length: 20 }).map((_, i) => ({
                    id: i,
                    size: Math.random() * 60 + 20,
                    x: Math.random() * 100,
                    y: Math.random() * 100,
                    duration: Math.random() * 20 + 10,
                    delay: Math.random() * 5,
                }))
            );
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div
            className="h-screen w-screen bg-[#020617] text-slate-100 flex items-center justify-center relative overflow-hidden selection:bg-emerald-500/30"
            onMouseMove={handleMouseMove}
        >

            {/* --- Premium Animated Background --- */}
            {/* Background that follows the mouse */}
            {/* Background that follows the mouse - HIDDEN ON MOBILE */}
            <motion.div
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-60 hidden md:block"
                animate={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(6, 182, 212, 0.15), transparent 80%)`,
                }}
                transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
            />

            {/* Deep gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#020617] to-[#020617]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-900/20 via-[#020617] to-[#020617]" />

            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

            {/* Floating Growth Orbs/Bars */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full mix-blend-screen filter blur-[40px] opacity-30"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        background: p.id % 2 === 0 ? "linear-gradient(to top right, #10b981, #34d399)" : "linear-gradient(to top right, #06b6d4, #22d3ee)",
                    }}
                    animate={{
                        y: ["0%", "-150%"],
                        x: ["0%", p.id % 2 === 0 ? "20%" : "-20%"],
                        scale: [1, 1.5, 0.8],
                        opacity: [0, 0.4, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear",
                    }}
                />
            ))}

            {/* Login Card Container */}
            <motion.div
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md px-6"
            >
                {/* Glow behind card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-50 z-0"></div>

                <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
                    {/* Border Beam Magic UI Effect - Reactivado y optimizado para móviles */}
                    <BorderBeam 
                        size={isMobile ? 180 : 250} 
                        duration={isMobile ? 25 : 12} 
                        delay={9} 
                        borderWidth={isMobile ? 1.2 : 1.5}
                    />

                    {/* Subtle animated border top */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

                    {/* Logo / Title */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-emerald-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-3"
                        >
                            <TrendingUp className="w-7 h-7 text-white" />
                        </motion.div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Crear Cuenta
                        </h2>
                        <p className="text-slate-400 text-sm mt-2 text-center text-balance">
                            Regístrate y comienza a tomar decisiones de inversión inteligentes.
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        {errorMsg && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {successMsg && (
                            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{successMsg}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Email Input */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium"
                                    placeholder="Correo electrónico"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all font-medium"
                                    placeholder="Contraseña (Mínimo 6 caracteres)"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || successMsg !== ""}
                            className="relative w-full group overflow-hidden bg-gradient-to-r from-cyan-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white font-semibold rounded-xl py-3 px-4 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="relative z-10">Registrarse</span>
                                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-slate-400 text-sm">
                        ¿Ya tienes cuenta?{" "}
                        <Link href="/login" className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors">
                            Inicia sesión aquí
                        </Link>
                    </p>

                    <div className="mt-5 pt-5 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-cyan-500/70" />
                        <span>Registro y acceso sumamente seguro</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
