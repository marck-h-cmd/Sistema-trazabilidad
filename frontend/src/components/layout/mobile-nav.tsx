'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { MAIN_NAVIGATION } from '@/constants/navigation';
import { useUIStore } from '@/stores/ui.store';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Wheat } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { mobileMenuOpen, toggleMobileMenu } = useUIStore();

  const filteredNav = MAIN_NAVIGATION.filter(
    (item) => !item.roles || item.roles.includes(user?.rol || '')
  );

  if (!mobileMenuOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50 md:hidden dark:bg-black/70"
        onClick={toggleMobileMenu}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl md:hidden dark:bg-gray-900">
        <div className="flex h-16 items-center justify-between border-b px-4 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={toggleMobileMenu}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wheat className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary">Trazabilidad</span>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleMobileMenu}
            className="dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5 dark:text-gray-300" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {filteredNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMobileMenu}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold dark:bg-primary/20 dark:text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                  {item.name}
                </Link>
              );
            })}
          </div>

          <Separator className="my-4 dark:bg-gray-700" />

          <Link
            href="/perfil"
            onClick={toggleMobileMenu}
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
              <span className="text-sm font-bold text-primary">
                {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-medium dark:text-gray-200">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-muted-foreground dark:text-gray-500">{user?.email}</p>
            </div>
          </Link>
        </ScrollArea>
      </div>
    </>
  );
}