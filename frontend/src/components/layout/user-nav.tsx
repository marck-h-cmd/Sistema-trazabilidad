'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  Key,
  HelpCircle,
} from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles';
import type { AuthUser } from '@/types/auth.types';

interface UserNavProps {
  user: AuthUser | null;
}

export function UserNav({ user }: UserNavProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const initials = `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();
  const roleLabel = ROLE_LABELS[user.rol] || user.rol;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-muted dark:hover:bg-gray-800">
          <Avatar className="h-8 w-8 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start text-sm lg:flex">
            <span className="font-medium dark:text-gray-200">{user.nombre} {user.apellido}</span>
            <span className="text-xs text-muted-foreground dark:text-gray-400">
              {roleLabel}
            </span>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block dark:text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none dark:text-gray-200">{user.nombre} {user.apellido}</p>
            <p className="text-xs leading-none text-muted-foreground dark:text-gray-400">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/perfil" className="flex cursor-pointer items-center dark:hover:bg-gray-800">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/perfil" className="flex cursor-pointer items-center dark:hover:bg-gray-800">
              <Key className="mr-2 h-4 w-4" />
              Cambiar Contraseña
            </Link>
          </DropdownMenuItem>
          {user.rol === 'ADMINISTRADOR' && (
            <DropdownMenuItem asChild>
              <Link href="/configuracion" className="flex cursor-pointer items-center dark:hover:bg-gray-800">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/trazabilidad" className="flex cursor-pointer items-center dark:hover:bg-gray-800">
              <Shield className="mr-2 h-4 w-4" />
              Auditoría
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="#" className="flex cursor-pointer items-center dark:hover:bg-gray-800">
              <HelpCircle className="mr-2 h-4 w-4" />
              Ayuda
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex cursor-pointer items-center text-destructive focus:text-destructive dark:text-red-400 dark:focus:text-red-300 dark:hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}