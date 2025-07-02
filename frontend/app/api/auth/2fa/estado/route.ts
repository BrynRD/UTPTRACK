// app/api/auth/2fa/estado/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Devolver un formato consistente con el resto de respuestas
            return NextResponse.json({ activado: false, mensaje: "No autenticado" }, { status: 401 });
        }

        const token = authHeader.substring(7);
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";

        // Añadimos console.log para depuración
        console.log("Enviando solicitud al backend con token:", token ? "Token presente" : "Token ausente");

        const response = await fetch(`${backendUrl}/api/auth/2fa/estado`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        // Si obtenemos un 403 o 401, probablemente el token es inválido o expiró
        if (response.status === 403 || response.status === 401) {
            console.log("Respuesta de autenticación fallida:", response.status);
            return NextResponse.json({
                activado: false,
                mensaje: "Sesión expirada o inválida"
            }, { status: 401 });
        }

        if (!response.ok) {
            console.log("Error en respuesta del backend:", response.status);
            return NextResponse.json({
                activado: false,
                mensaje: "Error al obtener estado de 2FA"
            }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Error al consultar estado 2FA:", error);
        return NextResponse.json({
            activado: false,
            mensaje: "Error de conexión al servidor"
        }, { status: 500 });
    }
}