'use client';

import { ReceptionForm } from '@/components/forms/reception-form';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/shared/mode-toggle';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuevaRecepcionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva Recepción"
        description="Registre la entrada de materia prima al sistema"
      >
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" asChild className="dark:border-gray-700">
            <Link href="/recepcion">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </PageHeader>

      <ReceptionForm />
    </div>
  );
}