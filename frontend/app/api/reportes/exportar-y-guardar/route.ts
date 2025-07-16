import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'No se recibió el token de autenticación en la cabecera Authorization.' },
        { status: 401 }
      );
    }

    // Extraer parámetros del FormData
    const type = formData.get('type') as string;
    const carrera = formData.get('carrera') as string;
    const fechaInicio = formData.get('fechaInicio') as string;
    const fechaFin = formData.get('fechaFin') as string;
    const estado = formData.get('estado') as string;
    const sede = formData.get('sede') as string;
    const formato = formData.get('formato') as string;

    // Construir URL con parámetros
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('formato', formato);
    
    if (carrera && carrera !== 'all') {
      params.append('carrera', carrera);
    }
    if (fechaInicio) {
      params.append('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params.append('fechaFin', fechaFin);
    }
    if (estado && estado !== 'all') {
      params.append('estado', estado);
    }
    if (sede && sede !== 'all') {
      params.append('sede', sede);
    }

    console.log('Parámetros enviados al backend:', params.toString());

    const response = await fetch(`http://localhost:8080/api/reportes/exportar?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: 'Error al exportar el reporte', details: errorData },
        { status: response.status }
      );
    }

    // Si el backend devuelve el archivo directamente
    if (response.headers.get('content-type')?.includes('application/pdf') || 
        response.headers.get('content-type')?.includes('application/vnd.openxmlformats')) {
      
      const buffer = await response.arrayBuffer();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const extension = formato === 'pdf' ? 'pdf' : 'xlsx';
      const filename = `reporte-${type}-${timestamp}.${extension}`;
      
      // Simular guardado del archivo y devolver URL
      return NextResponse.json({
        success: true,
        urlArchivo: `/exports/${filename}`,
        message: 'Reporte exportado correctamente'
      });
    }

    // Si el backend devuelve JSON con información del archivo
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error en API route exportar-y-guardar:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
