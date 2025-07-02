import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    
    console.log('Test Auth - token received:', token);
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    // Verificar el token con el backend
    const response = await fetch('http://localhost:8080/api/auth/verificar-token', {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    return NextResponse.json({
      tokenReceived: !!token,
      tokenLength: token.length,
      backendResponse: data,
      backendStatus: response.status
    });
  } catch (error) {
    console.error('Test Auth - error:', error);
    return NextResponse.json({ error: 'Error testing auth' }, { status: 500 });
  }
} 