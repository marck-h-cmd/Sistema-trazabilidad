'use client';

import { AlertForm } from '@/components/forms/alert-form';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuevaAlertaPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva Alerta"
        description="Registre una alerta sanitaria o de calidad"
      >
        <Button variant="outline" asChild className="dark:border-gray-700">
          <Link href="/alertas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </PageHeader>

      <div className="max-w-2xl">
        <AlertForm />
      </div>
    </div>
  );
}