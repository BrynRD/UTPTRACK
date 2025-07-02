import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('Authorization');
    console.log('API Route - Authorization header:', authHeader);
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No se recibió el token de autenticación en la cabecera Authorization.' },
        { status: 401 }
      );
    }
    const response = await fetch('http://localhost:8080/api/reportes/guardados/guardar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: 'Error al guardar el reporte', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en API route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 