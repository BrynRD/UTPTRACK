// app/api/auth/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 });
        }

        // Extrae el token del encabezado
        const token = authHeader.substring(7);

        // Envía la solicitud al backend para verificar el token
        const backendUrl = process.env.BACKEND_URL || "http://localhost:8080";
        const response = await fetch(`${backendUrl}/api/auth/verificar-token`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Token inválido o expirado" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error("Error al verificar token:", error);
        return NextResponse.json(
            { error: "Error al verificar la autenticación" },
            { status: 500 }
        );
    }
}