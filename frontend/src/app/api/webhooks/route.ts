import { NextRequest, NextResponse } from 'next/server';

/**
 * Handler de Webhooks del Frontend de Next.js.
 * Recibe webhooks del exterior o del propio backend y los procesa de forma segura.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Webhook recibido en Next.js:', body);

    // Si tuviésemos un endpoint en el backend, podríamos reenviarlo aquí:
    // const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    // await fetch(`${BACKEND_URL}/webhooks`, { method: 'POST', body: JSON.stringify(body), ... });

    return NextResponse.json({
      success: true,
      message: 'Webhook recibido y registrado en frontend',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error al procesar webhook:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'WEBHOOK_ERROR',
          message: error.message || 'Error al procesar el cuerpo del webhook',
        },
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint activo (Use método POST)',
    timestamp: new Date().toISOString(),
  });
}
