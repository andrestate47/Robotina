import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { planId, planName, price, userEmail, userId } = body;

        // Validamos que haya un token de acceso configurado
        if (!process.env.MP_ACCESS_TOKEN) {
            console.warn("Mercado Pago no está configurado. Faltan credenciales.");
            // Si no hay token, podemos devolver un flow de éxito simulado o error
            return NextResponse.json({ 
                success: false, 
                message: "No se configuró MP_ACCESS_TOKEN", 
                init_point: null 
            }, { status: 400 });
        }

        // Inicializar cliente
        const client = new MercadoPagoConfig({ 
            accessToken: process.env.MP_ACCESS_TOKEN 
        });
        const preApproval = new PreApproval(client);

        // Crear una suscripción mensual. En Mercado Pago esto se llama preApproval.
        const response = await preApproval.create({
            body: {
                reason: `Suscripción - Plan ${planName}`,
                // Usamos el userId único enviado desde el frontend
                external_reference: userId ? `${userId}_${planId}` : `unknown_${planId}_${Date.now()}`,
                // Correo verídico del usuario logueado en la PC
                payer_email: userEmail || "andresfuigueroaz@gmail.com",
                auto_recurring: {
                    frequency: 1,
                    frequency_type: "months",
                    transaction_amount: Number(price),
                    currency_id: "PEN", // O la moneda correspondiente (USD, PEN, COP, etc)
                },
                back_url: "http://localhost:3000/pricing?status=success",
                status: "pending"
            }
        });

        // Retornamos el link de inicio de pago (init_point) de Mercado Pago
        return NextResponse.json({ 
            success: true, 
            init_point: response.init_point 
        });

    } catch (error) {
        console.error("Error al crear la suscripción en MP:", error);
        return NextResponse.json({ success: false, error: "Error de servidor" }, { status: 500 });
    }
}
