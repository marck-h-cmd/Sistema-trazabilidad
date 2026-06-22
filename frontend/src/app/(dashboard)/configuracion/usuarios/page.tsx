'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/users.api';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/tables/data-table';
import { EmptyState } from '@/components/shared/empty-state';
import { UserForm } from '@/components/forms/user-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  Users, 
  Plus, 
  Search, 
  RefreshCw,
  Filter,
  Pencil,
  Trash2,
  User,
  Shield,
} from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import { ROLE_LABELS, ROLE_COLORS } from '@/constants/roles';
import { cn } from '@/lib/utils';

const columns = [
  {
    key: 'nombre',
    header: 'Usuario',
    cell: (row: any) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
          <span className="text-sm font-bold text-primary">
            {row.nombre?.charAt(0)}{row.apellido?.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-medium dark:text-gray-200">{row.nombre} {row.apellido}</p>
          <p className="text-xs text-muted-foreground dark:text-gray-400">{row.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'rol',
    header: 'Rol',
    cell: (row: any) => (
      <Badge className={cn('text-xs', ROLE_COLORS[row.rol] || '')}>
        {ROLE_LABELS[row.rol] || row.rol}
      </Badge>
    ),
  },
  {
    key: 'estado',
    header: 'Estado',
    cell: (row: any) => (
      <Badge variant={row.estado === 'ACTIVO' ? 'success' : row.estado === 'BLOQUEADO' ? 'destructive' : 'outline'} className="text-xs">
        {row.estado === 'ACTIVO' ? 'Activo' : row.estado === 'BLOQUEADO' ? 'Bloqueado' : 'Inactivo'}
      </Badge>
    ),
  },
  {
    key: 'ultimoInicioSesion',
    header: 'Último Acceso',
    cell: (row: any) => (
      <span className="text-sm text-muted-foreground dark:text-gray-400">
        {row.ultimoInicioSesion ? formatDate(row.ultimoInicioSesion) : 'Nunca'}
      </span>
    ),
  },
  {
    key: 'acciones',
    header: 'Acciones',
    cell: (row: any, _idx: number, onEdit: any, onDelete: any) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onEdit(row); }}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); onDelete(row); }} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function UsuariosConfigPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', 'config', page, debouncedSearch, rolFilter],
    queryFn: () =>
      usersApi.getAll({
        page,
        limit: 10,
        search: debouncedSearch,
        rol: rolFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Usuario desactivado', variant: 'success' });
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.response?.data?.error?.message, variant: 'destructive' });
    },
  });

  const users = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: any) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gestione los usuarios del sistema y sus permisos"
      >
        <Button onClick={() => { setSelectedUser(null); setShowForm(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </PageHeader>

      {/* Filtros */}
      <Card className="dark:border-gray-800 dark:bg-gray-900">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <Select value={rolFilter} onValueChange={(v) => { setRolFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px] dark:border-gray-700">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="ADMINISTRADOR">Administrador</SelectItem>
                <SelectItem value="CALIDAD">Calidad</SelectItem>
                <SelectItem value="RECEPCION">Recepción</SelectItem>
                <SelectItem value="PRODUCCION">Producción</SelectItem>
                <SelectItem value="ALMACEN">Almacén</SelectItem>
                <SelectItem value="DESPACHO">Despacho</SelectItem>
                <SelectItem value="CLIENTE">Cliente</SelectItem>
                <SelectItem value="AUTORIDAD">Autoridad</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => refetch()} className="dark:border-gray-700">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      {isLoading ? (
        <Card className="dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="Error al cargar usuarios"
          action={{ label: 'Reintentar', onClick: () => refetch() }}
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No hay usuarios"
          description={search ? `Sin resultados para "${search}"` : 'Cree el primer usuario'}
          action={{ label: 'Nuevo Usuario', onClick: () => { setSelectedUser(null); setShowForm(true); } }}
        />
      ) : (
        <DataTable
          columns={columns as any}
          data={users}
          page={page}
          totalPages={pagination?.totalPages || 1}
          onPageChange={setPage}
          extraActions={{ onEdit: handleEdit, onDelete: handleDelete }}
        />
      )}

      {/* Modal formulario */}
      {showForm && (
        <UserForm
          open={showForm}
          onClose={handleCloseForm}
          user={selectedUser}
        />
      )}

      {/* Confirmación eliminar */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Desactivar Usuario"
        description={`¿Está seguro de desactivar a ${userToDelete?.nombre} ${userToDelete?.apellido}?`}
        confirmLabel="Desactivar"
        variant="destructive"
        onConfirm={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}