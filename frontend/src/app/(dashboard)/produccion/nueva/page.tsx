'use client';

import { ProductionForm } from '@/components/forms/production-form';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/shared/mode-toggle';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuevaProduccionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva Producción"
        description="Registre una nueva orden de producción y genere un lote"
      >
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" asChild className="dark:border-gray-700">
            <Link href="/produccion">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </PageHeader>

      <ProductionForm />
    </div>
  );
}