import { PrismaClient, RolUsuario, EstadoUsuario, CategoriaProducto, EstadoLote } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar datos existentes
  await prisma.notificacion.deleteMany();
  await prisma.alerta.deleteMany();
  await prisma.itemExpedicion.deleteMany();
  await prisma.expedicion.deleteMany();
  await prisma.movimientoLote.deleteMany();
  await prisma.materiaPrima.deleteMany();
  await prisma.produccion.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.lote.deleteMany();
  await prisma.plantillaEtiqueta.deleteMany();
  await prisma.lineaProduccionProducto.deleteMany();
  await prisma.lineaProduccion.deleteMany();
  await prisma.ubicacion.deleteMany();
  await prisma.almacen.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.sesion.deleteMany();
  await prisma.registroAuditoria.deleteMany();
  await prisma.usuario.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 12);

  // Crear usuarios
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Admin',
      apellido: 'Sistema',
      rol: RolUsuario.ADMINISTRADOR,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0001',
      forzarCambioContrasena: false,
      configuracionEscaneo: {
        recepcion: 'opcional',
        produccion: 'opcional',
        almacen: 'opcional',
        expedicion: 'opcional',
      },
    },
  });

  const calidad = await prisma.usuario.create({
    data: {
      email: 'calidad@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'María',
      apellido: 'García',
      rol: RolUsuario.CALIDAD,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0002',
      forzarCambioContrasena: false,
    },
  });

  const recepcion = await prisma.usuario.create({
    data: {
      email: 'recepcion@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Carlos',
      apellido: 'López',
      rol: RolUsuario.RECEPCION,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0003',
      forzarCambioContrasena: true,
    },
  });

  const produccion = await prisma.usuario.create({
    data: {
      email: 'produccion@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Ana',
      apellido: 'Martínez',
      rol: RolUsuario.PRODUCCION,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0004',
      forzarCambioContrasena: true,
    },
  });

  const almacen = await prisma.usuario.create({
    data: {
      email: 'almacen@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Pedro',
      apellido: 'Rodríguez',
      rol: RolUsuario.ALMACEN,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0005',
      forzarCambioContrasena: true,
    },
  });

  const despacho = await prisma.usuario.create({
    data: {
      email: 'despacho@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Laura',
      apellido: 'Fernández',
      rol: RolUsuario.DESPACHO,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0006',
      forzarCambioContrasena: true,
    },
  });

  console.log('✅ Usuarios creados');

  // Crear productos
  const harinaTrigo = await prisma.producto.create({
    data: {
      sku: 'MP-001',
      nombre: 'Harina de Trigo',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'kg',
      vidaUtilDias: 180,
      requiereCadenaFrio: false,
    },
  });

  const azucar = await prisma.producto.create({
    data: {
      sku: 'MP-002',
      nombre: 'Azúcar',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'kg',
      vidaUtilDias: 365,
      requiereCadenaFrio: false,
    },
  });

  const huevos = await prisma.producto.create({
    data: {
      sku: 'MP-003',
      nombre: 'Huevos',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'unidades',
      vidaUtilDias: 30,
      requiereCadenaFrio: true,
      temperaturaMinima: 0,
      temperaturaMaxima: 4,
    },
  });

  const levadura = await prisma.producto.create({
    data: {
      sku: 'MP-004',
      nombre: 'Levadura',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'kg',
      vidaUtilDias: 30,
      requiereCadenaFrio: true,
      temperaturaMinima: 2,
      temperaturaMaxima: 8,
    },
  });

  const aceite = await prisma.producto.create({
    data: {
      sku: 'MP-005',
      nombre: 'Aceite Vegetal',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'L',
      vidaUtilDias: 365,
      requiereCadenaFrio: false,
    },
  });

  const panIntegral = await prisma.producto.create({
    data: {
      sku: 'PT-001',
      nombre: 'Pan Integral 500g',
      descripcion: 'Pan integral de trigo 100%, 500 gramos',
      categoria: CategoriaProducto.PRODUCTO_TERMINADO,
      unidadMedida: 'unidades',
      vidaUtilDias: 7,
      requiereCadenaFrio: false,
      configuracionLote: {
        prefijo: 'L',
        incluirFecha: true,
        incluirLinea: true,
        correlativoLongitud: 2,
      },
    },
  });

  const panBlanco = await prisma.producto.create({
    data: {
      sku: 'PT-002',
      nombre: 'Pan Blanco 500g',
      descripcion: 'Pan blanco tradicional, 500 gramos',
      categoria: CategoriaProducto.PRODUCTO_TERMINADO,
      unidadMedida: 'unidades',
      vidaUtilDias: 5,
      requiereCadenaFrio: false,
      configuracionLote: {
        prefijo: 'L',
        incluirFecha: true,
        incluirLinea: true,
        correlativoLongitud: 2,
      },
    },
  });

  console.log('✅ Productos creados');

  // Crear proveedores
  const molino = await prisma.proveedor.create({
    data: {
      codigo: 'PROV-001',
      nombre: 'Molinos del Sur S.A.',
      nif: 'A28000001',
      direccion: 'Calle Harina 123',
      ciudad: 'Madrid',
      pais: 'España',
      nombreContacto: 'Juan Pérez',
      emailContacto: 'juan@molinosdelsur.com',
      telefonoContacto: '911234567',
      utilizaCodigoBarras: true,
    },
  });

  const avicola = await prisma.proveedor.create({
    data: {
      codigo: 'PROV-002',
      nombre: 'Avícola La Granja S.L.',
      nif: 'B28000002',
      direccion: 'Avenida Huevos 456',
      ciudad: 'Toledo',
      pais: 'España',
      nombreContacto: 'Rosa Sánchez',
      emailContacto: 'rosa@avicolalagranja.com',
      telefonoContacto: '925123456',
      utilizaCodigoBarras: true,
    },
  });

  console.log('✅ Proveedores creados');

  // Crear clientes
  const bodega1 = await prisma.cliente.create({
    data: {
      codigo: 'CLI-001',
      nombre: 'Bodega El Buen Sabor',
      tipo: 'BODEGA',
      nif: 'C28000001',
      direccion: 'Plaza Mayor 1',
      ciudad: 'Madrid',
      pais: 'España',
      nombreContacto: 'Antonio Ruiz',
      emailContacto: 'antonio@buensabor.com',
      telefonoContacto: '913456789',
    },
  });

  const super1 = await prisma.cliente.create({
    data: {
      codigo: 'CLI-002',
      nombre: 'Supermercados Fresh',
      tipo: 'SUPERMERCADO',
      nif: 'D28000002',
      direccion: 'Calle Comercial 50',
      ciudad: 'Barcelona',
      pais: 'España',
      nombreContacto: 'Marta López',
      emailContacto: 'marta@superfresh.com',
      telefonoContacto: '934567890',
    },
  });

  console.log('✅ Clientes creados');

  // Crear almacén
  const almacenPrincipal = await prisma.almacen.create({
    data: {
      codigo: 'ALM-001',
      nombre: 'Almacén Central',
      direccion: 'Calle Industria 100',
      tipo: 'PRINCIPAL',
    },
  });

  // Crear ubicaciones
  const zonas = ['A', 'B', 'C'];
  const pasillos = ['01', '02'];
  const estanterias = ['01', '02', '03'];
  const niveles = ['01', '02', '03'];

  for (const zona of zonas) {
    for (const pasillo of pasillos) {
      for (const estanteria of estanterias) {
        for (const nivel of niveles) {
          const codigoCompleto = `ZONA-${zona}-PASILLO-${pasillo}-ESTANTERIA-${estanteria}-NIVEL-${nivel}`;
          await prisma.ubicacion.create({
            data: {
              almacenId: almacenPrincipal.id,
              zona,
              pasillo,
              estanteria,
              nivel,
              codigoBarras: `UBI-${zona}${pasillo}${estanteria}${nivel}`,
              codigoCompleto,
              capacidadMaxima: 1000,
              capacidadActual: 0,
            },
          });
        }
      }
    }
  }

  console.log('✅ Almacén y ubicaciones creados');

  // Crear líneas de producción
  const linea1 = await prisma.lineaProduccion.create({
    data: {
      codigo: 'L1',
      nombre: 'Línea de Producción 1 - Pan Blanco',
      descripcion: 'Línea principal para pan blanco',
      codigoBarras: 'LINEA-L1-001',
    },
  });

  const linea2 = await prisma.lineaProduccion.create({
    data: {
      codigo: 'L2',
      nombre: 'Línea de Producción 2 - Pan Integral',
      descripcion: 'Línea para pan integral y especialidades',
      codigoBarras: 'LINEA-L2-001',
    },
  });

  const linea3 = await prisma.lineaProduccion.create({
    data: {
      codigo: 'L3',
      nombre: 'Línea de Producción 3 - Bollería',
      descripcion: 'Línea para bollería y pastelería',
      codigoBarras: 'LINEA-L3-001',
    },
  });

  // Asignar productos a líneas
  await prisma.lineaProduccionProducto.create({
    data: {
      lineaProduccionId: linea1.id,
      productoId: panBlanco.id,
      esPorDefecto: true,
      tiempoProduccion: 120,
    },
  });

  await prisma.lineaProduccionProducto.create({
    data: {
      lineaProduccionId: linea2.id,
      productoId: panIntegral.id,
      esPorDefecto: true,
      tiempoProduccion: 150,
    },
  });

  console.log('✅ Líneas de producción creadas');

  // Crear configuración del sistema
  await prisma.configuracionSistema.create({
    data: {
      clave: 'datos_empresa',
      valor: {
        nombre: 'Panadería Artesanal S.L.',
        direccion: 'Calle Industria 100, Madrid',
        nif: 'B28000123',
        telefono: '911234567',
        email: 'info@panaderia.com',
      },
      descripcion: 'Datos de la empresa para albaranes y etiquetas',
    },
  });

  await prisma.configuracionSistema.create({
    data: {
      clave: 'formato_lote',
      valor: {
        prefijo: 'L',
        incluirFecha: true,
        incluirLinea: true,
        incluirTurno: false,
        correlativoLongitud: 2,
        separador: '',
      },
      descripcion: 'Formato de generación de códigos de lote',
    },
  });

  console.log('✅ Configuración del sistema creada');
  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });