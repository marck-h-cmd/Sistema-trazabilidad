import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

async function handleRequest(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}/${path}${searchParams}`;

  // Copiar cabeceras recibidas de Next.js para enviarlas al backend
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Evitar desajustes del header host y content-length (se calcula solo)
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
      headers.set(key, value);
    }
  });

  try {
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    let body: any = undefined;

    if (isMutating) {
      try {
        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          body = JSON.stringify(await req.json());
        } else if (contentType.includes('multipart/form-data')) {
          // Si es un envío de archivos, se reenvía como formData
          body = await req.formData();
        } else {
          body = await req.text();
        }
      } catch {
        // En caso de que no haya cuerpo
      }
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    });

    const responseData = await response.text();

    // Copiar cabeceras de respuesta del backend de vuelta al cliente
    const resHeaders = new Headers();
    response.headers.forEach((value, key) => {
      // Ignorar cabeceras de compresión porque fetch o next las gestiona
      if (key.toLowerCase() !== 'content-encoding') {
        resHeaders.set(key, value);
      }
    });

    return new NextResponse(responseData, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    console.error(`Error en proxy a ${targetUrl}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_ERROR',
          message: error.message || 'Error al conectar con el servidor backend',
        },
      },
      { status: 502 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
