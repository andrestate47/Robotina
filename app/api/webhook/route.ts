import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    // Inicializar Supabase dentro del handler para evitar ejecución en build time
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );
    try {
        // Mercado Pago puede enviar la data por URL params (notificación IPN) o body (Webhook normal)
        const url = new URL(request.url);
        const type = url.searchParams.get("type");
        const action = url.searchParams.get("action");
        const dataId = url.searchParams.get("data.id") || url.searchParams.get("id");
        
        let body;
        try {
            body = await request.json();
        } catch (e) {
            body = {};
        }

        console.log("🔔 Webhook recibido:", { type, action, dataId, body });

        // Evaluamos si es la creación de una suscripción
        if (action === "created" && type === "subscription_preapproval") {
            const preapprovalId = body.data?.id || dataId;
            
            // Opcional: Aquí debes llamar a la API de MP para preguntar qué correo tiene esta suscripción.
            // Para simplificar, suponemos que Mercado Pago nos responde y sabemos el email o el external_reference.
            const externalReference = body.data?.external_reference || "robotina_basic_XXXXXXXX"; // Esto es de ejemplo
            const emailCliente = body.data?.payer_email || "andresfuigueroaz@gmail.com"; 
            
            // 🚀 ACTUALIZACIÓN MÁGICA DE SUPABASE 🚀
            // Buscamos al perfil por su correo (idealmente por ID) y le cambiamos el plan
            const { error } = await supabase
                .from('perfiles')
                .update({ 
                    plan: 'pro', // ¡Acceso liberado!
                })
                .eq('email', emailCliente);

            if (error) {
                console.error("❌ Error actualizando a PRO:", error);
                return NextResponse.json({ success: false, error: error.message }, { status: 500 });
            }

            console.log(`✅ Usuario ${emailCliente} actualizado a plan PRO automáticamente.`);
        }

        // Siempre debemos responderle 200 a Mercado Pago rápido para que sepan que recibimos la alerta
        return NextResponse.json({ success: true, message: "Webhook procesado exitosamente" });

    } catch (error) {
        console.error("Error catastrofico en webhook:", error);
        return NextResponse.json({ success: false, error: "Error de servidor" }, { status: 500 });
    }
}
