'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { SearchInput } from '@/components/shared/search-input';
import { NotificationsNav } from './notifications-nav';
import { UserNav } from './user-nav';
import { BreadcrumbNav } from './breadcrumb-nav';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { ModeToggle } from '@/components/shared/mode-toggle';
import { useUIStore } from '@/stores/ui.store';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user } = useAuth();
  const { toggleMobileMenu } = useUIStore();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 dark:bg-gray-900 dark:border-gray-800">
      {/* Botón menú móvil */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMobileMenu}
        className="md:hidden dark:hover:bg-gray-800"
      >
        <Menu className="h-5 w-5 dark:text-gray-300" />
      </Button>

      {/* Breadcrumb */}
      <BreadcrumbNav className="hidden md:flex" />

      {/* Búsqueda global */}
      <div className="ml-auto flex items-center gap-3">
        <SearchInput
          placeholder="Buscar lote, producto, proveedor..."
          className="hidden w-[300px] lg:flex"
        />

        {/* Toggle modo escaneo */}
        <ModeToggle />

        {/* Toggle tema oscuro */}
        <ThemeToggle />

        {/* Notificaciones */}
        <NotificationsNav />

        {/* Usuario */}
        <UserNav user={user} />
      </div>
    </header>
  );
}