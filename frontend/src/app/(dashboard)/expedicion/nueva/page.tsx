'use client';

import { ShipmentForm } from '@/components/forms/shipment-form';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/shared/mode-toggle';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NuevaExpedicionPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nueva Expedición"
        description="Prepare un envío para un cliente"
      >
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="outline" asChild className="dark:border-gray-700">
            <Link href="/expedicion">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </PageHeader>

      <ShipmentForm />
    </div>
  );
}