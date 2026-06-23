import { PrismaClient, RolUsuario, EstadoUsuario, CategoriaProducto } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar datos existentes (en orden correcto por FK)
  await prisma.notificacion.deleteMany();
  await prisma.configuracionSistema.deleteMany();
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

  // ============================================================
  // USUARIOS
  // ============================================================
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Roberto',
      apellido: 'Sánchez Mora',
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
      apellido: 'García Ruiz',
      rol: RolUsuario.CALIDAD,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0002',
      forzarCambioContrasena: false,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'recepcion@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Carlos',
      apellido: 'López Vega',
      rol: RolUsuario.RECEPCION,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0003',
      forzarCambioContrasena: false,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'produccion@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Ana',
      apellido: 'Martínez Díaz',
      rol: RolUsuario.PRODUCCION,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0004',
      forzarCambioContrasena: false,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'almacen@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Pedro',
      apellido: 'Rodríguez Fuentes',
      rol: RolUsuario.ALMACEN,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0005',
      forzarCambioContrasena: false,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'despacho@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Laura',
      apellido: 'Fernández Gil',
      rol: RolUsuario.DESPACHO,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0006',
      forzarCambioContrasena: false,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'inspector@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Jorge',
      apellido: 'Herrera Blanco',
      rol: RolUsuario.AUTORIDAD,
      estado: EstadoUsuario.ACTIVO,
      telefono: '555-0007',
      forzarCambioContrasena: false,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'calidad2@panaderia.com',
      contrasena: hashedPassword,
      nombre: 'Sofía',
      apellido: 'Torres Medina',
      rol: RolUsuario.CALIDAD,
      estado: EstadoUsuario.INACTIVO,
      telefono: '555-0008',
      forzarCambioContrasena: false,
    },
  });

  console.log('✅ Usuarios creados (8)');

  // ============================================================
  // PRODUCTOS
  // ============================================================
  const harinaTrigo = await prisma.producto.create({
    data: {
      sku: 'MP-001',
      nombre: 'Harina de Trigo T-55',
      descripcion: 'Harina de trigo blanco panificable, fuerza media, 25 kg.',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'kg',
      vidaUtilDias: 180,
      requiereCadenaFrio: false,
    },
  });

  const harinaIntegral = await prisma.producto.create({
    data: {
      sku: 'MP-002',
      nombre: 'Harina de Trigo Integral',
      descripcion: 'Harina integral de trigo completo, alta fibra.',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'kg',
      vidaUtilDias: 120,
      requiereCadenaFrio: false,
    },
  });

  const azucar = await prisma.producto.create({
    data: {
      sku: 'MP-003',
      nombre: 'Azúcar Blanco Refinado',
      descripcion: 'Azúcar blanco granulado de remolacha, calidad extra.',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'kg',
      vidaUtilDias: 365,
      requiereCadenaFrio: false,
    },
  });

  const huevos = await prisma.producto.create({
    data: {
      sku: 'MP-004',
      nombre: 'Huevos Frescos Cat. A',
      descripcion: 'Huevos frescos de gallina campera, categoría A, calibre L.',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'unidades',
      vidaUtilDias: 28,
      requiereCadenaFrio: true,
      temperaturaMinima: 0,
      temperaturaMaxima: 4,
    },
  });

  const levadura = await prisma.producto.create({
    data: {
      sku: 'MP-005',
      nombre: 'Levadura Fresca Prensada',
      descripcion: 'Levadura fresca de panadería de alta actividad, bloques de 500g.',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'kg',
      vidaUtilDias: 21,
      requiereCadenaFrio: true,
      temperaturaMinima: 2,
      temperaturaMaxima: 8,
    },
  });

  const aceite = await prisma.producto.create({
    data: {
      sku: 'MP-006',
      nombre: 'Aceite de Girasol Refinado',
      descripcion: 'Aceite vegetal de girasol refinado, apto panadería.',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'L',
      vidaUtilDias: 365,
      requiereCadenaFrio: false,
    },
  });

  const sal = await prisma.producto.create({
    data: {
      sku: 'MP-007',
      nombre: 'Sal Fina Yodada',
      descripcion: 'Sal fina yodada para panadería, sacos de 25 kg.',
      categoria: CategoriaProducto.MATERIA_PRIMA,
      unidadMedida: 'kg',
      vidaUtilDias: 730,
      requiereCadenaFrio: false,
    },
  });

  const panBlanco = await prisma.producto.create({
    data: {
      sku: 'PT-001',
      nombre: 'Pan Blanco 500g',
      descripcion: 'Pan blanco tradicional de miga esponjosa, 500 gramos.',
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

  const panIntegral = await prisma.producto.create({
    data: {
      sku: 'PT-002',
      nombre: 'Pan Integral 500g',
      descripcion: 'Pan integral de trigo 100%, alto en fibra, 500 gramos.',
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

  const panCenteno = await prisma.producto.create({
    data: {
      sku: 'PT-003',
      nombre: 'Pan de Centeno 400g',
      descripcion: 'Pan de centeno artesano, fermentación lenta 24h, 400 gramos.',
      categoria: CategoriaProducto.PRODUCTO_TERMINADO,
      unidadMedida: 'unidades',
      vidaUtilDias: 10,
      requiereCadenaFrio: false,
      configuracionLote: {
        prefijo: 'L',
        incluirFecha: true,
        incluirLinea: true,
        correlativoLongitud: 2,
      },
    },
  });

  const mediaLuna = await prisma.producto.create({
    data: {
      sku: 'PT-004',
      nombre: 'Medialuna Mantequilla x6',
      descripcion: 'Pack de 6 medialunas de mantequilla estilo francés.',
      categoria: CategoriaProducto.PRODUCTO_TERMINADO,
      unidadMedida: 'unidades',
      vidaUtilDias: 3,
      requiereCadenaFrio: false,
      configuracionLote: {
        prefijo: 'L',
        incluirFecha: true,
        incluirLinea: true,
        correlativoLongitud: 2,
      },
    },
  });

  const bolsaPlastico = await prisma.producto.create({
    data: {
      sku: 'ENV-001',
      nombre: 'Bolsa Polietileno 25x45cm',
      descripcion: 'Bolsa de polietileno transparente con cierre zip, apta alimentación.',
      categoria: CategoriaProducto.ENVASE,
      unidadMedida: 'unidades',
      vidaUtilDias: 1825,
      requiereCadenaFrio: false,
    },
  });

  const cajaCarton = await prisma.producto.create({
    data: {
      sku: 'ENV-002',
      nombre: 'Caja Cartón Corrugado 40x30x20',
      descripcion: 'Caja de cartón corrugado triple capa para expedición, precintable.',
      categoria: CategoriaProducto.ENVASE,
      unidadMedida: 'unidades',
      vidaUtilDias: 1825,
      requiereCadenaFrio: false,
    },
  });

  const masaPreferm = await prisma.producto.create({
    data: {
      sku: 'SI-001',
      nombre: 'Masa Madre Activa',
      descripcion: 'Prefermento de masa madre natural, activo y listo para usar.',
      categoria: CategoriaProducto.SEMIELABORADO,
      unidadMedida: 'kg',
      vidaUtilDias: 3,
      requiereCadenaFrio: true,
      temperaturaMinima: 4,
      temperaturaMaxima: 8,
    },
  });

  console.log('✅ Productos creados (14)');

  // ============================================================
  // PROVEEDORES
  // ============================================================
  const molinoSur = await prisma.proveedor.create({
    data: {
      codigo: 'PROV-001',
      nombre: 'Molinos del Sur S.A.',
      nif: 'A28001111',
      direccion: 'Polígono Industrial Norte, Nave 12, Calle Harina 123',
      ciudad: 'Madrid',
      pais: 'España',
      nombreContacto: 'Juan Pérez Ortega',
      emailContacto: 'compras@molinosdelsur.com',
      telefonoContacto: '911234567',
      utilizaCodigoBarras: true,
    },
  });

  const avicolaGranja = await prisma.proveedor.create({
    data: {
      codigo: 'PROV-002',
      nombre: 'Avícola La Granja S.L.',
      nif: 'B28002222',
      direccion: 'Carretera Nacional, km 45, Finca La Granja',
      ciudad: 'Toledo',
      pais: 'España',
      nombreContacto: 'Rosa Sánchez Blanco',
      emailContacto: 'pedidos@avicolalagranja.com',
      telefonoContacto: '925123456',
      utilizaCodigoBarras: true,
    },
  });

  await prisma.proveedor.create({
    data: {
      codigo: 'PROV-003',
      nombre: 'Azucarera Ibérica S.A.',
      nif: 'C28003333',
      direccion: 'Avenida de la Industria 88',
      ciudad: 'Valladolid',
      pais: 'España',
      nombreContacto: 'Miguel Torres Vela',
      emailContacto: 'ventas@azucareraiberica.com',
      telefonoContacto: '983456789',
      utilizaCodigoBarras: true,
    },
  });

  await prisma.proveedor.create({
    data: {
      codigo: 'PROV-004',
      nombre: 'LevaStar Biotecnología S.L.',
      nif: 'D28004444',
      direccion: 'Parque Tecnológico, Edificio Biotech 3',
      ciudad: 'Sevilla',
      pais: 'España',
      nombreContacto: 'Elena Ruiz Moreno',
      emailContacto: 'elena.ruiz@levastar.com',
      telefonoContacto: '954987654',
      utilizaCodigoBarras: false,
    },
  });

  await prisma.proveedor.create({
    data: {
      codigo: 'PROV-005',
      nombre: 'Envases y Embalajes Rápidos S.A.',
      nif: 'E28005555',
      direccion: 'Calle del Embalaje 77, Local 4',
      ciudad: 'Zaragoza',
      pais: 'España',
      nombreContacto: 'Fernando Lozano Gil',
      emailContacto: 'f.lozano@embalajerapidos.com',
      telefonoContacto: '976123456',
      utilizaCodigoBarras: true,
    },
  });

  console.log('✅ Proveedores creados (5)');

  // ============================================================
  // CLIENTES
  // ============================================================
  await prisma.cliente.create({
    data: {
      codigo: 'CLI-001',
      nombre: 'Bodega El Buen Sabor',
      tipo: 'BODEGA',
      nif: 'F28001001',
      direccion: 'Plaza Mayor 1, Bajo',
      ciudad: 'Madrid',
      pais: 'España',
      nombreContacto: 'Antonio Ruiz Castillo',
      emailContacto: 'pedidos@buensabor.com',
      telefonoContacto: '913456789',
      direccionEnvio: 'Plaza Mayor 1, Almacén Trasero, Madrid',
    },
  });

  await prisma.cliente.create({
    data: {
      codigo: 'CLI-002',
      nombre: 'Supermercados Fresh S.A.',
      tipo: 'SUPERMERCADO',
      nif: 'G28002002',
      direccion: 'Calle Comercial 50, Planta Baja',
      ciudad: 'Barcelona',
      pais: 'España',
      nombreContacto: 'Marta López Fontes',
      emailContacto: 'marta.lopez@superfresh.com',
      telefonoContacto: '934567890',
      direccionEnvio: 'Centro de Distribución Fresh, Zona Logística Norte, Barcelona',
    },
  });

  await prisma.cliente.create({
    data: {
      codigo: 'CLI-003',
      nombre: 'Restaurante La Tertulia',
      tipo: 'RESTAURANTE',
      nif: 'H28003003',
      direccion: 'Calle del Chef 23',
      ciudad: 'Valencia',
      pais: 'España',
      nombreContacto: 'Ramón Gutiérrez Mas',
      emailContacto: 'compras@latertulia.es',
      telefonoContacto: '963789012',
    },
  });

  await prisma.cliente.create({
    data: {
      codigo: 'CLI-004',
      nombre: 'Tienda Orgánica Verde',
      tipo: 'TIENDA',
      nif: 'I28004004',
      direccion: 'Avenida Ecológica 15',
      ciudad: 'Granada',
      pais: 'España',
      nombreContacto: 'Lucía Vidal Prada',
      emailContacto: 'lucia@tiendaverde.com',
      telefonoContacto: '958234567',
    },
  });

  await prisma.cliente.create({
    data: {
      codigo: 'CLI-005',
      nombre: 'Distribuidor Pan Express S.L.',
      tipo: 'DISTRIBUIDOR',
      nif: 'J28005005',
      direccion: 'Polígono Logístico Sur, Nave 8',
      ciudad: 'Sevilla',
      pais: 'España',
      nombreContacto: 'Ricardo Morales Cano',
      emailContacto: 'logistica@panexpress.com',
      telefonoContacto: '955678901',
      direccionEnvio: 'Polígono Logístico Sur, Nave 8, Sevilla',
    },
  });

  await prisma.cliente.create({
    data: {
      codigo: 'CLI-006',
      nombre: 'Hotel Gastronómico Las Torres',
      tipo: 'RESTAURANTE',
      nif: 'K28006006',
      direccion: 'Gran Vía 100, Planta Cocina',
      ciudad: 'Bilbao',
      pais: 'España',
      nombreContacto: 'Nerea Etxebarria Zubia',
      emailContacto: 'cocina@hotelastorres.com',
      telefonoContacto: '944345678',
    },
  });

  console.log('✅ Clientes creados (6)');

  // ============================================================
  // ALMACENES Y UBICACIONES
  // ============================================================
  const almacenPrincipal = await prisma.almacen.create({
    data: {
      codigo: 'ALM-001',
      nombre: 'Almacén Central',
      direccion: 'Polígono Industrial Norte, Calle Industria 100',
      tipo: 'PRINCIPAL',
    },
  });

  const almacenFrio = await prisma.almacen.create({
    data: {
      codigo: 'ALM-002',
      nombre: 'Cámara Frigorífica',
      direccion: 'Polígono Industrial Norte, Calle Industria 102',
      tipo: 'SECUNDARIO',
    },
  });

  const almacenExt = await prisma.almacen.create({
    data: {
      codigo: 'ALM-003',
      nombre: 'Almacén de Envases',
      direccion: 'Polígono Industrial Sur, Nave 5',
      tipo: 'SECUNDARIO',
    },
  });

  // Ubicaciones Almacén Central: Zonas A, B, C — 2 pasillos, 3 estanterías, 3 niveles
  for (const zona of ['A', 'B', 'C']) {
    for (const pasillo of ['01', '02']) {
      for (const estanteria of ['01', '02', '03']) {
        for (const nivel of ['01', '02', '03']) {
          const cc = `${zona}-P${pasillo}-E${estanteria}-N${nivel}`;
          await prisma.ubicacion.create({
            data: {
              almacenId: almacenPrincipal.id,
              zona,
              pasillo,
              estanteria,
              nivel,
              codigoBarras: `ALM001-${zona}${pasillo}${estanteria}${nivel}`,
              codigoCompleto: cc,
              capacidadMaxima: 1000,
              capacidadActual: 0,
            },
          });
        }
      }
    }
  }

  // Ubicaciones Cámara Frigorífica: Zona F — 2 pasillos, 2 estanterías, 2 niveles
  for (const pasillo of ['01', '02']) {
    for (const estanteria of ['01', '02']) {
      for (const nivel of ['01', '02']) {
        const cc = `F-P${pasillo}-E${estanteria}-N${nivel}`;
        await prisma.ubicacion.create({
          data: {
            almacenId: almacenFrio.id,
            zona: 'F',
            pasillo,
            estanteria,
            nivel,
            codigoBarras: `ALM002-F${pasillo}${estanteria}${nivel}`,
            codigoCompleto: cc,
            capacidadMaxima: 500,
            capacidadActual: 0,
          },
        });
      }
    }
  }

  // Ubicaciones Almacén Envases: Zona E — 1 pasillo, 2 estanterías, 3 niveles
  for (const estanteria of ['01', '02']) {
    for (const nivel of ['01', '02', '03']) {
      const cc = `E-P01-E${estanteria}-N${nivel}`;
      await prisma.ubicacion.create({
        data: {
          almacenId: almacenExt.id,
          zona: 'E',
          pasillo: '01',
          estanteria,
          nivel,
          codigoBarras: `ALM003-E01${estanteria}${nivel}`,
          codigoCompleto: cc,
          capacidadMaxima: 2000,
          capacidadActual: 0,
        },
      });
    }
  }

  console.log('✅ Almacenes y ubicaciones creados (3 almacenes, 66 ubicaciones)');

  // ============================================================
  // LÍNEAS DE PRODUCCIÓN
  // ============================================================
  const linea1 = await prisma.lineaProduccion.create({
    data: {
      codigo: 'L1',
      nombre: 'Línea 1 — Pan Blanco',
      descripcion: 'Línea principal de producción para pan blanco tradicional. Capacidad 2000 uds/turno.',
      codigoBarras: 'LINEA-L1-001',
    },
  });

  const linea2 = await prisma.lineaProduccion.create({
    data: {
      codigo: 'L2',
      nombre: 'Línea 2 — Pan Integral y Centeno',
      descripcion: 'Línea para variedades integrales y de centeno. Fermentación lenta controlada.',
      codigoBarras: 'LINEA-L2-001',
    },
  });

  const linea3 = await prisma.lineaProduccion.create({
    data: {
      codigo: 'L3',
      nombre: 'Línea 3 — Bollería y Pastelería',
      descripcion: 'Línea especializada en bollería dulce y salada. Horno de convección de alta precisión.',
      codigoBarras: 'LINEA-L3-001',
    },
  });

  const linea4 = await prisma.lineaProduccion.create({
    data: {
      codigo: 'L4',
      nombre: 'Línea 4 — Semielaborados',
      descripcion: 'Línea de producción de masas madre y prefementos para abastecer el resto de líneas.',
      codigoBarras: 'LINEA-L4-001',
    },
  });

  // Asignar productos a líneas
  await prisma.lineaProduccionProducto.create({
    data: { lineaProduccionId: linea1.id, productoId: panBlanco.id, esPorDefecto: true, tiempoProduccion: 120 },
  });
  await prisma.lineaProduccionProducto.create({
    data: { lineaProduccionId: linea2.id, productoId: panIntegral.id, esPorDefecto: true, tiempoProduccion: 150 },
  });
  await prisma.lineaProduccionProducto.create({
    data: { lineaProduccionId: linea2.id, productoId: panCenteno.id, esPorDefecto: false, tiempoProduccion: 180 },
  });
  await prisma.lineaProduccionProducto.create({
    data: { lineaProduccionId: linea3.id, productoId: mediaLuna.id, esPorDefecto: true, tiempoProduccion: 90 },
  });
  await prisma.lineaProduccionProducto.create({
    data: { lineaProduccionId: linea3.id, productoId: panBlanco.id, esPorDefecto: false, tiempoProduccion: 110 },
  });
  await prisma.lineaProduccionProducto.create({
    data: { lineaProduccionId: linea4.id, productoId: masaPreferm.id, esPorDefecto: true, tiempoProduccion: 1440 },
  });

  console.log('✅ Líneas de producción creadas (4 líneas, 6 asignaciones)');

  // ============================================================
  // CONFIGURACIÓN DEL SISTEMA
  // ============================================================
  await prisma.configuracionSistema.create({
    data: {
      clave: 'datos_empresa',
      valor: {
        nombre: 'Panadería Artesanal S.L.',
        direccion: 'Polígono Industrial Norte, Calle Industria 100, Madrid',
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
  console.log('');
  console.log('🎉 Seed completado exitosamente');
  console.log('');
  console.log('📋 Credenciales de acceso:');
  console.log('   👑 Admin:      admin@panaderia.com      / password123');
  console.log('   🔬 Calidad:    calidad@panaderia.com    / password123');
  console.log('   📦 Recepción:  recepcion@panaderia.com  / password123');
  console.log('   🏭 Producción: produccion@panaderia.com / password123');
  console.log('   🏠 Almacén:    almacen@panaderia.com    / password123');
  console.log('   🚚 Despacho:   despacho@panaderia.com   / password123');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });