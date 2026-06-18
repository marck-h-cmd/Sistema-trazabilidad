import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Ingrese un email válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const registerSchema = z.object({
  email: z.string().email('Ingrese un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  rol: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es obligatoria'),
    newPassword: z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional(),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  apellido: z.string().min(1, 'El apellido es obligatorio'),
  rol: z.string().min(1, 'Seleccione un rol'),
  telefono: z.string().optional(),
});

export const productSchema = z.object({
  sku: z.string().min(1, 'El SKU es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  categoria: z.string().min(1, 'Seleccione una categoría'),
  unidadMedida: z.string().min(1, 'Seleccione una unidad'),
  vidaUtilDias: z.coerce.number().int().min(1, 'Mínimo 1 día'),
  requiereCadenaFrio: z.boolean().default(false),
  temperaturaMinima: z.coerce.number().optional(),
  temperaturaMaxima: z.coerce.number().optional(),
});

export const supplierSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  nif: z.string().min(1, 'El NIF es obligatorio'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
  ciudad: z.string().min(1, 'La ciudad es obligatoria'),
  pais: z.string().min(1, 'El país es obligatorio'),
  nombreContacto: z.string().min(1, 'El nombre de contacto es obligatorio'),
  emailContacto: z.string().email('Email inválido'),
  telefonoContacto: z.string().optional(),
  utilizaCodigoBarras: z.boolean().default(true),
});

export const customerSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  tipo: z.string().min(1, 'Seleccione un tipo'),
  nif: z.string().min(1, 'El NIF es obligatorio'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
  ciudad: z.string().min(1, 'La ciudad es obligatoria'),
  pais: z.string().min(1, 'El país es obligatorio'),
  nombreContacto: z.string().min(1, 'El nombre de contacto es obligatorio'),
  emailContacto: z.string().email('Email inválido'),
  telefonoContacto: z.string().optional(),
  direccionEnvio: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type SupplierFormData = z.infer<typeof supplierSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;