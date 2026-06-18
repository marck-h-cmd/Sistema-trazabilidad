'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { MAIN_NAVIGATION, CONFIG_NAVIGATION } from '@/constants/navigation';
import { useUIStore } from '@/stores/ui.store';
import { 
  ChevronLeft, 
  ChevronRight, 
  Wheat,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { sidebarVariant, toggleSidebar } = useUIStore();
  const sidebarCollapsed = sidebarVariant === 'collapsed';

  const filteredMainNav = MAIN_NAVIGATION.filter(
    (item) => !item.roles || item.roles.includes(user?.rol || '')
  );

  const filteredConfigNav = CONFIG_NAVIGATION.filter(
    (item) => !item.roles || item.roles.includes(user?.rol || '')
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'hidden md:flex flex-col border-r bg-white transition-all duration-300 ease-in-out dark:bg-gray-900 dark:border-gray-800',
          sidebarCollapsed ? 'w-[72px]' : 'w-[280px]'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex h-16 items-center border-b px-4 dark:border-gray-800',
          sidebarCollapsed ? 'justify-center' : 'justify-between'
        )}>
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Wheat className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-primary dark:text-primary">Trazabilidad</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <Link href="/dashboard" className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wheat className="h-5 w-5 text-white" />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className={cn(
              'h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-gray-800 dark:hover:text-gray-200',
              sidebarCollapsed && 'absolute -right-3 z-50 rounded-full border bg-white shadow-md dark:bg-gray-900 dark:border-gray-700'
            )}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          {/* Navegación Principal */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-500">
                Principal
              </h2>
            )}
            {filteredMainNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
                        sidebarCollapsed && 'justify-center px-2'
                      )}
                    >
                      <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary dark:text-primary')} />
                      {!sidebarCollapsed && <span>{item.name}</span>}
                      {isActive && !sidebarCollapsed && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                      )}
                    </Link>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right" className="font-medium dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
                      {item.name}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>

          {/* Configuración */}
          {filteredConfigNav.length > 0 && (
            <>
              <Separator className="my-4 dark:bg-gray-700" />
              <div className="space-y-1">
                {!sidebarCollapsed && (
                  <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground dark:text-gray-500">
                    Configuración
                  </h2>
                )}
                {filteredConfigNav.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  return (
                    <Tooltip key={item.href} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                            isActive
                              ? 'bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
                            sidebarCollapsed && 'justify-center px-2'
                          )}
                        >
                          <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary dark:text-primary')} />
                          {!sidebarCollapsed && <span>{item.name}</span>}
                        </Link>
                      </TooltipTrigger>
                      {sidebarCollapsed && (
                        <TooltipContent side="right" className="font-medium dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
                          {item.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  );
                })}
              </div>
            </>
          )}
        </ScrollArea>

        {/* Footer del sidebar */}
        {!sidebarCollapsed && (
          <div className="border-t p-4 dark:border-gray-800">
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2 dark:bg-gray-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                <Wheat className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-xs font-medium dark:text-gray-200">Panadería Artesanal</p>
                <p className="text-xs text-muted-foreground dark:text-gray-500">Sistema Activo</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}