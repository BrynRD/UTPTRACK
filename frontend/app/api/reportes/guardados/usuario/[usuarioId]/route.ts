import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ usuarioId: string }> }
) {
  try {
    const { usuarioId } = await params;
    let token = request.headers.get('Authorization');
    
    console.log('API Route - usuarioId:', usuarioId);
    console.log('API Route - token original:', token);
    
    // Asegurar que el token tenga el prefijo "Bearer"
    if (token && !token.startsWith('Bearer ')) {
      token = `Bearer ${token}`;
    }
    
    console.log('API Route - token final:', token);
    
    const response = await fetch(`http://localhost:8080/api/reportes/guardados/usuario/${usuarioId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token || '',
      },
    });

    console.log('API Route - response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.log('API Route - error data:', errorData);
      return NextResponse.json(
        { error: 'Error al obtener los reportes guardados', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('API Route - data received:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en API route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 