'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '@/lib/api/alerts.api';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Package, 
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export function NotificationsNav() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: activeAlerts } = useQuery({
    queryKey: ['active-alerts'],
    queryFn: () => alertsApi.getActive(),
    refetchInterval: 60000,
  });

  const alertCount = activeAlerts?.data?.data?.length || 0;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full dark:hover:bg-gray-800"
        >
          <Bell className="h-4 w-4 dark:text-gray-300" />
          {alertCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {alertCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="dark:text-gray-200">Notificaciones</span>
          {alertCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {alertCount} {alertCount === 1 ? 'activa' : 'activas'}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {alertCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="mb-2 h-8 w-8 text-success" />
              <p className="text-sm font-medium dark:text-gray-200">Todo en orden</p>
              <p className="text-xs text-muted-foreground dark:text-gray-500">
                No hay alertas activas
              </p>
            </div>
          ) : (
            <DropdownMenuGroup>
              {activeAlerts?.data?.data?.map((alert: any) => (
                <DropdownMenuItem
                  key={alert.id}
                  asChild
                  className="cursor-pointer dark:hover:bg-gray-800"
                >
                  <Link href={`/alertas/${alert.id}`} className="flex flex-col items-start gap-1 py-3">
                    <div className="flex items-center gap-2 w-full">
                      <AlertTriangle
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          alert.severidad === 'CRITICO' ? 'text-destructive' : 'text-warning'
                        )}
                      />
                      <span className="text-sm font-medium dark:text-gray-200 line-clamp-1">
                        {alert.titulo}
                      </span>
                      <Badge
                        variant={alert.severidad === 'CRITICO' ? 'destructive' : 'warning'}
                        className="ml-auto text-[10px]"
                      >
                        {alert.severidad}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground dark:text-gray-500 pl-6">
                      <Package className="h-3 w-3" />
                      <span className="font-mono">{alert.lote?.codigo}</span>
                      <span>•</span>
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(alert.fechaCreacion), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/alertas"
            className="flex cursor-pointer items-center justify-center text-sm text-primary hover:text-primary dark:text-primary dark:hover:text-primary"
          >
            Ver todas las alertas
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}