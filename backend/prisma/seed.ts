import {
  PrismaClient,
  RolUsuario,
  EstadoUsuario,
  CategoriaProducto,
  EstadoLote,
  TipoMovimiento,
  EstadoExpedicion,
  TipoAlerta,
  SeveridadAlerta,
  EstadoAlerta,
  TipoEtiqueta,
  FrecuenciaReporte,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function daysAgo(n: number, hour = 8): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
  return d;
}
function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min: number, max: number) { return parseFloat((Math.random() * (max - min) + min).toFixed(2)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  console.log('🌱 Iniciando seed masivo de datos...');

  // ─── LIMPIEZA ────────────────────────────────────────────────────────────────
  await prisma.notificacion.deleteMany();
  await prisma.simulacroAuditoria.deleteMany();
  await prisma.reporteProgramado.deleteMany();
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
  await prisma.recepcion.deleteMany();
  await prisma.ubicacion.deleteMany();
  await prisma.almacen.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.sesion.deleteMany();
  await prisma.registroAuditoria.deleteMany();
  await prisma.usuario.deleteMany();
  console.log('✅ Base de datos limpiada');

  const hashedPassword = await bcrypt.hash('password123', 12);

  // ─── USUARIOS ────────────────────────────────────────────────────────────────
  const admin = await prisma.usuario.create({ data: { email: 'admin@panaderia.com', contrasena: hashedPassword, nombre: 'Carlos', apellido: 'Mendoza', rol: RolUsuario.ADMINISTRADOR, estado: EstadoUsuario.ACTIVO, telefono: '+34 911 000 001', forzarCambioContrasena: false, configuracionEscaneo: { recepcion: 'opcional', produccion: 'opcional', almacen: 'opcional', expedicion: 'opcional' } } });
  const calidad = await prisma.usuario.create({ data: { email: 'calidad@panaderia.com', contrasena: hashedPassword, nombre: 'María', apellido: 'García', rol: RolUsuario.CALIDAD, estado: EstadoUsuario.ACTIVO, telefono: '+34 911 000 002', forzarCambioContrasena: false } });
  const recepcionUser = await prisma.usuario.create({ data: { email: 'recepcion@panaderia.com', contrasena: hashedPassword, nombre: 'Jorge', apellido: 'López', rol: RolUsuario.RECEPCION, estado: EstadoUsuario.ACTIVO, telefono: '+34 911 000 003', forzarCambioContrasena: false } });
  const produccionUser = await prisma.usuario.create({ data: { email: 'produccion@panaderia.com', contrasena: hashedPassword, nombre: 'Ana', apellido: 'Martínez', rol: RolUsuario.PRODUCCION, estado: EstadoUsuario.ACTIVO, telefono: '+34 911 000 004', forzarCambioContrasena: false } });
  const almacenUser = await prisma.usuario.create({ data: { email: 'almacen@panaderia.com', contrasena: hashedPassword, nombre: 'Pedro', apellido: 'Rodríguez', rol: RolUsuario.ALMACEN, estado: EstadoUsuario.ACTIVO, telefono: '+34 911 000 005', forzarCambioContrasena: false } });
  const despachoUser = await prisma.usuario.create({ data: { email: 'despacho@panaderia.com', contrasena: hashedPassword, nombre: 'Laura', apellido: 'Fernández', rol: RolUsuario.DESPACHO, estado: EstadoUsuario.ACTIVO, telefono: '+34 911 000 006', forzarCambioContrasena: false } });
  console.log('✅ Usuarios creados (6)');

  // ─── PROVEEDORES ─────────────────────────────────────────────────────────────
  const molino = await prisma.proveedor.create({ data: { codigo: 'PROV-001', nombre: 'Molinos del Sur S.A.', nif: 'A28000001', direccion: 'Polígono Industrial Molinar, Nave 5', ciudad: 'Madrid', pais: 'España', nombreContacto: 'Juan Pérez', emailContacto: 'juan@molinosdelsur.com', telefonoContacto: '+34 911 234 567', utilizaCodigoBarras: true } });
  const avicola = await prisma.proveedor.create({ data: { codigo: 'PROV-002', nombre: 'Avícola La Granja S.L.', nif: 'B28000002', direccion: 'Camino de la Granja km 3', ciudad: 'Toledo', pais: 'España', nombreContacto: 'Rosa Sánchez', emailContacto: 'rosa@avicolalagranja.com', telefonoContacto: '+34 925 123 456', utilizaCodigoBarras: true } });
  const aceitesProv = await prisma.proveedor.create({ data: { codigo: 'PROV-003', nombre: 'Aceites Andaluces S.L.', nif: 'C41000003', direccion: 'Avenida del Olivar 22', ciudad: 'Sevilla', pais: 'España', nombreContacto: 'Manuel Torres', emailContacto: 'manuel@aceitesan.com', telefonoContacto: '+34 954 654 321', utilizaCodigoBarras: false } });
  const lacteosProv = await prisma.proveedor.create({ data: { codigo: 'PROV-004', nombre: 'Lácteos del Norte S.A.', nif: 'D33000004', direccion: 'Calle Industria Láctea 8', ciudad: 'Oviedo', pais: 'España', nombreContacto: 'Beatriz Álvarez', emailContacto: 'beatriz@lacteosnorte.com', telefonoContacto: '+34 985 789 000', utilizaCodigoBarras: true } });
  const azucarProv = await prisma.proveedor.create({ data: { codigo: 'PROV-005', nombre: 'Azucarera Ibérica S.A.', nif: 'E47000005', direccion: 'Polígono Industrial Azucarero', ciudad: 'Valladolid', pais: 'España', nombreContacto: 'Fernando Blanco', emailContacto: 'fernando@azucariberica.com', telefonoContacto: '+34 983 456 789', utilizaCodigoBarras: true } });
  console.log('✅ Proveedores creados (5)');

  // ─── CLIENTES ────────────────────────────────────────────────────────────────
  const bodega1 = await prisma.cliente.create({ data: { codigo: 'CLI-001', nombre: 'Bodega El Buen Sabor', tipo: 'BODEGA', nif: 'E28001001', direccion: 'Plaza Mayor 1', ciudad: 'Madrid', pais: 'España', nombreContacto: 'Antonio Ruiz', emailContacto: 'antonio@buensabor.com', telefonoContacto: '+34 913 456 789', direccionEnvio: 'Plaza Mayor 1, 28012 Madrid' } });
  const superFresh = await prisma.cliente.create({ data: { codigo: 'CLI-002', nombre: 'Supermercados Fresh', tipo: 'SUPERMERCADO', nif: 'F28002002', direccion: 'Calle Comercial 50', ciudad: 'Barcelona', pais: 'España', nombreContacto: 'Marta López', emailContacto: 'marta@superfresh.com', telefonoContacto: '+34 934 567 890', direccionEnvio: 'Calle Comercial 50, 08001 Barcelona' } });
  const restaurante = await prisma.cliente.create({ data: { codigo: 'CLI-003', nombre: 'Restaurante La Baguette', tipo: 'RESTAURANTE', nif: 'G28003003', direccion: 'Calle Gourmet 15', ciudad: 'Valencia', pais: 'España', nombreContacto: 'Sofía Navarro', emailContacto: 'sofia@labaguette.com', telefonoContacto: '+34 963 111 222', direccionEnvio: 'Calle Gourmet 15, 46001 Valencia' } });
  const distribuidora = await prisma.cliente.create({ data: { codigo: 'CLI-004', nombre: 'Distribuidora Norte S.L.', tipo: 'DISTRIBUIDOR', nif: 'H28004004', direccion: 'Polígono Logístico 77', ciudad: 'Bilbao', pais: 'España', nombreContacto: 'Iñaki Etxeberria', emailContacto: 'inaki@distnorte.com', telefonoContacto: '+34 944 333 444', direccionEnvio: 'Polígono Logístico 77, 48004 Bilbao' } });
  const hotelChain = await prisma.cliente.create({ data: { codigo: 'CLI-005', nombre: 'Hoteles Premium S.A.', tipo: 'RESTAURANTE', nif: 'I28005005', direccion: 'Gran Vía 100', ciudad: 'Madrid', pais: 'España', nombreContacto: 'Lucía Castellano', emailContacto: 'lucia@hotelespremium.com', telefonoContacto: '+34 915 999 000', direccionEnvio: 'Gran Vía 100, 28013 Madrid' } });
  const cafeteria = await prisma.cliente.create({ data: { codigo: 'CLI-006', nombre: 'Cafeterías Sol & Mar', tipo: 'BODEGA', nif: 'J28006006', direccion: 'Rambla Catalunya 35', ciudad: 'Barcelona', pais: 'España', nombreContacto: 'Marc Puig', emailContacto: 'marc@solmar.com', telefonoContacto: '+34 932 777 888' } });
  console.log('✅ Clientes creados (6)');

  // ─── PRODUCTOS ───────────────────────────────────────────────────────────────
  const harinaTrigo = await prisma.producto.create({ data: { sku: 'MP-001', nombre: 'Harina de Trigo T55', descripcion: 'Harina de trigo panificable tipo 55', categoria: CategoriaProducto.MATERIA_PRIMA, unidadMedida: 'kg', vidaUtilDias: 180, requiereCadenaFrio: false } });
  const harinaIntegral = await prisma.producto.create({ data: { sku: 'MP-002', nombre: 'Harina Integral de Trigo', descripcion: 'Harina integral grano entero', categoria: CategoriaProducto.MATERIA_PRIMA, unidadMedida: 'kg', vidaUtilDias: 120, requiereCadenaFrio: false } });
  const harinaCenteno = await prisma.producto.create({ data: { sku: 'MP-003', nombre: 'Harina de Centeno', descripcion: 'Harina de centeno ecológica', categoria: CategoriaProducto.MATERIA_PRIMA, unidadMedida: 'kg', vidaUtilDias: 120, requiereCadenaFrio: false } });
  const azucar = await prisma.producto.create({ data: { sku: 'MP-004', nombre: 'Azúcar Blanca', descripcion: 'Azúcar de caña refinada', categoria: CategoriaProducto.MATERIA_PRIMA, unidadMedida: 'kg', vidaUtilDias: 730, requiereCadenaFrio: false } });
  const huevos = await prisma.producto.create({ data: { sku: 'MP-005', nombre: 'Huevos Camperos Cat. A', descripcion: 'Huevos camperos categoría A, calibre L', categoria: CategoriaProducto.MATERIA_PRIMA, unidadMedida: 'unidades', vidaUtilDias: 28, requiereCadenaFrio: true, temperaturaMinima: 0, temperaturaMaxima: 4 } });
  const levadura = await prisma.producto.create({ data: { sku: 'MP-006', nombre: 'Levadura Fresca', descripcion: 'Levadura fresca de panadería', categoria: CategoriaProducto.MATERIA_PRIMA, unidadMedida: 'kg', vidaUtilDias: 21, requiereCadenaFrio: true, temperaturaMinima: 2, temperaturaMaxima: 8 } });
  const aceite = await prisma.producto.create({ data: { sku: 'MP-007', nombre: 'Aceite de Oliva Virgen Extra', descripcion: 'AOVE primera prensada en frío', categoria: CategoriaProducto.MATERIA_PRIMA, unidadMedida: 'L', vidaUtilDias: 365, requiereCadenaFrio: false } });
  const mantequilla = await prisma.producto.create({ data: { sku: 'MP-008', nombre: 'Mantequilla sin sal', descripcion: 'Mantequilla para bollería', categoria: CategoriaProducto.MATERIA_PRIMA, unidadMedida: 'kg', vidaUtilDias: 60, requiereCadenaFrio: true, temperaturaMinima: 0, temperaturaMaxima: 6 } });
  const sal = await prisma.producto.create({ data: { sku: 'MP-009', nombre: 'Sal Marina Fina', descripcion: 'Sal marina refinada', categoria: CategoriaProducto.MATERIA_PRIMA, unidadMedida: 'kg', vidaUtilDias: 1825, requiereCadenaFrio: false } });
  const semillasSesamo = await prisma.producto.create({ data: { sku: 'MP-010', nombre: 'Semillas de Sésamo', descripcion: 'Sésamo tostado para decoración', categoria: CategoriaProducto.MATERIA_PRIMA, unidadMedida: 'kg', vidaUtilDias: 365, requiereCadenaFrio: false } });
  const bolsaPlastico = await prisma.producto.create({ data: { sku: 'ENV-001', nombre: 'Bolsa Plástico 500g', descripcion: 'Bolsa polipropileno sellada', categoria: CategoriaProducto.ENVASE, unidadMedida: 'unidades', vidaUtilDias: 1825, requiereCadenaFrio: false } });
  const bolsaGrande = await prisma.producto.create({ data: { sku: 'ENV-002', nombre: 'Bolsa Kraft 1kg', descripcion: 'Bolsa kraft biodegradable', categoria: CategoriaProducto.ENVASE, unidadMedida: 'unidades', vidaUtilDias: 1825, requiereCadenaFrio: false } });
  const panBlanco = await prisma.producto.create({ data: { sku: 'PT-001', nombre: 'Pan Blanco de Molde 500g', descripcion: 'Pan de molde blanco tradicional', categoria: CategoriaProducto.PRODUCTO_TERMINADO, unidadMedida: 'unidades', vidaUtilDias: 5, requiereCadenaFrio: false, configuracionLote: { prefijo: 'L', incluirFecha: true, incluirLinea: true, correlativoLongitud: 2 } } });
  const panIntegral = await prisma.producto.create({ data: { sku: 'PT-002', nombre: 'Pan Integral 500g', descripcion: 'Pan integral de trigo 100%', categoria: CategoriaProducto.PRODUCTO_TERMINADO, unidadMedida: 'unidades', vidaUtilDias: 7, requiereCadenaFrio: false, configuracionLote: { prefijo: 'L', incluirFecha: true, incluirLinea: true, correlativoLongitud: 2 } } });
  const panCenteno = await prisma.producto.create({ data: { sku: 'PT-003', nombre: 'Pan de Centeno 400g', descripcion: 'Pan de centeno artesanal', categoria: CategoriaProducto.PRODUCTO_TERMINADO, unidadMedida: 'unidades', vidaUtilDias: 10, requiereCadenaFrio: false, configuracionLote: { prefijo: 'L', incluirFecha: true, incluirLinea: true, correlativoLongitud: 2 } } });
  const panSesamo = await prisma.producto.create({ data: { sku: 'PT-004', nombre: 'Pan de Sésamo 500g', descripcion: 'Pan de trigo con semillas de sésamo', categoria: CategoriaProducto.PRODUCTO_TERMINADO, unidadMedida: 'unidades', vidaUtilDias: 5, requiereCadenaFrio: false, configuracionLote: { prefijo: 'L', incluirFecha: true, incluirLinea: true, correlativoLongitud: 2 } } });
  const croissant = await prisma.producto.create({ data: { sku: 'PT-005', nombre: 'Croissant Mantequilla 6u', descripcion: 'Pack 6 croissants artesanales', categoria: CategoriaProducto.PRODUCTO_TERMINADO, unidadMedida: 'unidades', vidaUtilDias: 3, requiereCadenaFrio: false, configuracionLote: { prefijo: 'L', incluirFecha: true, incluirLinea: true, correlativoLongitud: 2 } } });
  const magdalenas = await prisma.producto.create({ data: { sku: 'PT-006', nombre: 'Magdalenas Caseras 12u', descripcion: 'Magdalenas artesanales pack 12', categoria: CategoriaProducto.PRODUCTO_TERMINADO, unidadMedida: 'unidades', vidaUtilDias: 7, requiereCadenaFrio: false, configuracionLote: { prefijo: 'L', incluirFecha: true, incluirLinea: true, correlativoLongitud: 2 } } });
  const muffins = await prisma.producto.create({ data: { sku: 'PT-007', nombre: 'Muffins Chocolate 4u', descripcion: 'Pack 4 muffins de chocolate artesanales', categoria: CategoriaProducto.PRODUCTO_TERMINADO, unidadMedida: 'unidades', vidaUtilDias: 5, requiereCadenaFrio: false, configuracionLote: { prefijo: 'L', incluirFecha: true, incluirLinea: true, correlativoLongitud: 2 } } });
  console.log('✅ Productos creados (19)');

  // ─── ALMACENES Y UBICACIONES ─────────────────────────────────────────────────
  const almacenPrincipal = await prisma.almacen.create({ data: { codigo: 'ALM-001', nombre: 'Almacén Central', direccion: 'Calle Industria 100', tipo: 'PRINCIPAL' } });
  const almacenFrio = await prisma.almacen.create({ data: { codigo: 'ALM-002', nombre: 'Cámara Frigorífica', direccion: 'Calle Industria 100 – Módulo Frío', tipo: 'SECUNDARIO' } });
  const almacenExterno = await prisma.almacen.create({ data: { codigo: 'ALM-003', nombre: 'Almacén Externo LogisPark', direccion: 'Polígono LogisPark, Nave 12', tipo: 'EXTERNO' } });

  const ubisMap: Record<string, any> = {};
  for (const zona of ['A', 'B', 'C', 'D']) {
    for (const pasillo of ['01', '02', '03']) {
      for (const estanteria of ['01', '02', '03', '04']) {
        for (const nivel of ['01', '02', '03']) {
          const codigoCompleto = `ZONA-${zona}-PASILLO-${pasillo}-ESTANTERIA-${estanteria}-NIVEL-${nivel}`;
          ubisMap[codigoCompleto] = await prisma.ubicacion.create({ data: { almacenId: almacenPrincipal.id, zona, pasillo, estanteria, nivel, codigoBarras: `UBI-${zona}${pasillo}${estanteria}${nivel}`, codigoCompleto, capacidadMaxima: 1000, capacidadActual: 0 } });
        }
      }
    }
  }
  for (const zona of ['F']) {
    for (const estanteria of ['01', '02', '03']) {
      for (const nivel of ['01', '02']) {
        const codigoCompleto = `ZONA-${zona}-PASILLO-01-ESTANTERIA-${estanteria}-NIVEL-${nivel}`;
        ubisMap[codigoCompleto] = await prisma.ubicacion.create({ data: { almacenId: almacenFrio.id, zona, pasillo: '01', estanteria, nivel, codigoBarras: `UBI-F01${estanteria}${nivel}`, codigoCompleto, capacidadMaxima: 500, capacidadActual: 0 } });
      }
    }
  }

  const ubiA = ubisMap['ZONA-A-PASILLO-01-ESTANTERIA-01-NIVEL-01'];
  const ubiA2 = ubisMap['ZONA-A-PASILLO-01-ESTANTERIA-02-NIVEL-01'];
  const ubiA3 = ubisMap['ZONA-A-PASILLO-02-ESTANTERIA-01-NIVEL-01'];
  const ubiB = ubisMap['ZONA-B-PASILLO-01-ESTANTERIA-01-NIVEL-01'];
  const ubiB2 = ubisMap['ZONA-B-PASILLO-01-ESTANTERIA-02-NIVEL-01'];
  const ubiC = ubisMap['ZONA-C-PASILLO-01-ESTANTERIA-01-NIVEL-01'];
  const ubiC2 = ubisMap['ZONA-C-PASILLO-02-ESTANTERIA-01-NIVEL-01'];
  const ubiD = ubisMap['ZONA-D-PASILLO-01-ESTANTERIA-01-NIVEL-01'];
  const ubiFrio = ubisMap['ZONA-F-PASILLO-01-ESTANTERIA-01-NIVEL-01'];
  const ubiFrio2 = ubisMap['ZONA-F-PASILLO-01-ESTANTERIA-02-NIVEL-01'];
  const ubiFrio3 = ubisMap['ZONA-F-PASILLO-01-ESTANTERIA-03-NIVEL-01'];
  console.log('✅ Almacenes y ubicaciones creados');

  // ─── LÍNEAS DE PRODUCCIÓN ────────────────────────────────────────────────────
  const linea1 = await prisma.lineaProduccion.create({ data: { codigo: 'L1', nombre: 'Línea 1 – Pan Blanco', descripcion: 'Línea principal para pan blanco de molde', codigoBarras: 'LINEA-L1-001' } });
  const linea2 = await prisma.lineaProduccion.create({ data: { codigo: 'L2', nombre: 'Línea 2 – Pan Integral/Centeno', descripcion: 'Línea para panes integrales y especiales', codigoBarras: 'LINEA-L2-001' } });
  const linea3 = await prisma.lineaProduccion.create({ data: { codigo: 'L3', nombre: 'Línea 3 – Bollería Fina', descripcion: 'Línea para bollería y pastelería artesanal', codigoBarras: 'LINEA-L3-001' } });
  await prisma.lineaProduccionProducto.createMany({ data: [
    { lineaProduccionId: linea1.id, productoId: panBlanco.id, esPorDefecto: true, tiempoProduccion: 120 },
    { lineaProduccionId: linea1.id, productoId: panSesamo.id, esPorDefecto: false, tiempoProduccion: 130 },
    { lineaProduccionId: linea2.id, productoId: panIntegral.id, esPorDefecto: true, tiempoProduccion: 150 },
    { lineaProduccionId: linea2.id, productoId: panCenteno.id, esPorDefecto: false, tiempoProduccion: 160 },
    { lineaProduccionId: linea3.id, productoId: croissant.id, esPorDefecto: true, tiempoProduccion: 90 },
    { lineaProduccionId: linea3.id, productoId: magdalenas.id, esPorDefecto: false, tiempoProduccion: 60 },
    { lineaProduccionId: linea3.id, productoId: muffins.id, esPorDefecto: false, tiempoProduccion: 70 },
  ] });
  console.log('✅ Líneas de producción creadas (3)');

  // ─────────────────────────────────────────────────────────────────────────────
  // DATOS HISTÓRICOS: 30 días de operaciones
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('⏳ Generando 30 días de datos históricos...');

  // Contadores para códigos únicos
  let recCounter = 1;
  let loteCounter = 1;
  let prodCounter = 1;
  let expCounter = 1;
  let altCounter = 1;

  function recCode(day: number) { return `REC-2606${String(day).padStart(2,'0')}-${String(recCounter++).padStart(3,'0')}`; }
  function loteCode(lineaCod: string, day: number) { const d = daysAgo(day); const yy = String(d.getFullYear()).slice(2); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd2 = String(d.getDate()).padStart(2,'0'); return `L${yy}${mm}${dd2}${lineaCod}${String(loteCounter++).padStart(2,'0')}`; }
  function expCode(day: number) { return `EXP-2606${String(day).padStart(2,'0')}-${String(expCounter++).padStart(3,'0')}`; }
  function altCode(day: number) { return `ALT-2606${String(day).padStart(2,'0')}-${String(altCounter++).padStart(3,'0')}`; }

  // ─── STOCK BASE DE MATERIAS PRIMAS (3 recepciones grandes antiguas) ──────────
  // Recepción grande de harina (hace 28 días)
  const recHarina28 = await prisma.recepcion.create({ data: { codigo: recCode(28), proveedorId: molino.id, metodoEntrada: 'ESCANEO_CODIGO_BARRAS', fechaRecepcion: daysAgo(28), numeroAlbaran: 'ALB-MS-00820', recibidoPor: recepcionUser.id, estado: 'VERIFICADA' } });
  const loteHarina28 = await prisma.lote.create({ data: { codigo: loteCode('L1', 28), productoId: harinaTrigo.id, cantidad: 1500, cantidadInicial: 1500, unidadMedida: 'kg', fechaRecepcion: daysAgo(28), fechaCaducidad: daysFromNow(152), estado: EstadoLote.ACTIVO, almacenId: almacenPrincipal.id, ubicacionId: ubiA.id, recepcionId: recHarina28.id, numeroLoteProveedor: 'MS-H55-2604-01', creadoPor: recepcionUser.id } });
  const loteHarinaInt28 = await prisma.lote.create({ data: { codigo: loteCode('L2', 28), productoId: harinaIntegral.id, cantidad: 800, cantidadInicial: 800, unidadMedida: 'kg', fechaRecepcion: daysAgo(28), fechaCaducidad: daysFromNow(92), estado: EstadoLote.ACTIVO, almacenId: almacenPrincipal.id, ubicacionId: ubiA2.id, recepcionId: recHarina28.id, creadoPor: recepcionUser.id } });
  await prisma.materiaPrima.createMany({ data: [
    { loteId: loteHarina28.id, proveedorId: molino.id, codigoLoteProveedor: 'MS-H55-2604-01', cantidad: 1500, unidadMedida: 'kg', fechaRecepcion: daysAgo(28), fechaCaducidad: daysFromNow(152), temperaturaLlegada: 20.1, controlCalidadAprobado: true, creadoPor: recepcionUser.id },
    { loteId: loteHarinaInt28.id, proveedorId: molino.id, cantidad: 800, unidadMedida: 'kg', fechaRecepcion: daysAgo(28), fechaCaducidad: daysFromNow(92), temperaturaLlegada: 20.3, controlCalidadAprobado: true, creadoPor: recepcionUser.id },
  ] });

  const recInsumos25 = await prisma.recepcion.create({ data: { codigo: recCode(25), proveedorId: avicola.id, metodoEntrada: 'MANUAL', fechaRecepcion: daysAgo(25), numeroAlbaran: 'ALB-AVG-00540', recibidoPor: recepcionUser.id, estado: 'VERIFICADA' } });
  const loteHuevos25 = await prisma.lote.create({ data: { codigo: loteCode('F1', 25), productoId: huevos.id, cantidad: 3600, cantidadInicial: 3600, unidadMedida: 'unidades', fechaRecepcion: daysAgo(25), fechaCaducidad: daysFromNow(3), estado: EstadoLote.ACTIVO, almacenId: almacenFrio.id, ubicacionId: ubiFrio.id, recepcionId: recInsumos25.id, creadoPor: recepcionUser.id } });
  const loteLevadura25 = await prisma.lote.create({ data: { codigo: loteCode('F2', 25), productoId: levadura.id, cantidad: 120, cantidadInicial: 120, unidadMedida: 'kg', fechaRecepcion: daysAgo(25), fechaCaducidad: daysFromNow(-4), estado: EstadoLote.VENCIDO, almacenId: almacenFrio.id, ubicacionId: ubiFrio2.id, recepcionId: recInsumos25.id, creadoPor: recepcionUser.id } });
  await prisma.materiaPrima.createMany({ data: [
    { loteId: loteHuevos25.id, proveedorId: avicola.id, cantidad: 3600, unidadMedida: 'unidades', fechaRecepcion: daysAgo(25), fechaCaducidad: daysFromNow(3), temperaturaLlegada: 3.9, controlCalidadAprobado: true, creadoPor: recepcionUser.id },
    { loteId: loteLevadura25.id, proveedorId: avicola.id, cantidad: 120, unidadMedida: 'kg', fechaRecepcion: daysAgo(25), fechaCaducidad: daysFromNow(-4), temperaturaLlegada: 6.1, controlCalidadAprobado: true, creadoPor: recepcionUser.id },
  ] });

  // ─── 30 DÍAS DE RECEPCIONES PERIÓDICAS ──────────────────────────────────────
  // Recepciones cada ~5 días
  const recDays = [22, 18, 14, 10, 6, 3, 1, 0];
  const recepcionesCreadas: any[] = [recHarina28, recInsumos25];

  for (const day of recDays) {
    const isHoy = day === 0;
    const rec = await prisma.recepcion.create({
      data: { codigo: recCode(day), proveedorId: pick([molino, avicola, aceitesProv, lacteosProv, azucarProv]).id, metodoEntrada: pick(['MANUAL', 'ESCANEO_CODIGO_BARRAS']), fechaRecepcion: daysAgo(day, pick([7,8,9,10])), numeroAlbaran: `ALB-${2600 + day}-${randInt(100,999)}`, recibidoPor: recepcionUser.id, estado: isHoy ? 'COMPLETADA' : 'VERIFICADA', observaciones: isHoy ? 'Recepción del día en curso' : null }
    });
    recepcionesCreadas.push(rec);

    // Crear 1-3 lotes por recepción
    const nLotes = randInt(1, 3);
    const matPrimasLote = [harinaTrigo, harinaIntegral, harinaCenteno, azucar, huevos, aceite, mantequilla, sal, semillasSesamo];
    for (let i = 0; i < nLotes; i++) {
      const prod = pick(matPrimasLote);
      const qty = prod.unidadMedida === 'unidades' ? randInt(600, 2400) : randFloat(100, 600);
      const lote = await prisma.lote.create({
        data: { codigo: loteCode('A' + (i+1), day), productoId: prod.id, cantidad: qty, cantidadInicial: qty, unidadMedida: prod.unidadMedida, fechaRecepcion: daysAgo(day), fechaCaducidad: daysFromNow(prod.vidaUtilDias - day), estado: EstadoLote.ACTIVO, almacenId: prod.requiereCadenaFrio ? almacenFrio.id : almacenPrincipal.id, ubicacionId: prod.requiereCadenaFrio ? pick([ubiFrio, ubiFrio2, ubiFrio3]).id : pick([ubiA, ubiA2, ubiA3, ubiB, ubiB2]).id, recepcionId: rec.id, creadoPor: recepcionUser.id }
      });
      await prisma.materiaPrima.create({
        data: { loteId: lote.id, proveedorId: rec.proveedorId, cantidad: qty, unidadMedida: prod.unidadMedida, fechaRecepcion: daysAgo(day), fechaCaducidad: daysFromNow(prod.vidaUtilDias - day), temperaturaLlegada: prod.requiereCadenaFrio ? randFloat(2, 7) : randFloat(17, 22), controlCalidadAprobado: Math.random() > 0.05, creadoPor: recepcionUser.id }
      });
      await prisma.movimientoLote.create({
        data: { loteId: lote.id, tipo: TipoMovimiento.RECEPCION, ubicacionDestinoId: prod.requiereCadenaFrio ? ubiFrio.id : ubiA.id, cantidad: qty, unidadMedida: prod.unidadMedida, realizadoPor: recepcionUser.id, referenciaId: rec.id, referenciaTipo: 'RECEPCION' }
      });
    }
  }
  console.log(`✅ Recepciones creadas (${recepcionesCreadas.length + recDays.length})`);

  // ─── 30 DÍAS DE PRODUCCIONES ─────────────────────────────────────────────────
  // 2-4 producciones por día durante 30 días
  const productosPT = [
    { prod: panBlanco, linea: linea1, lineaCod: 'L1', mpProd: harinaTrigo, rendBase: 98, tamBase: 600, tHorno: 220, tCoccion: 35, hum: 65 },
    { prod: panIntegral, linea: linea2, lineaCod: 'L2', mpProd: harinaIntegral, rendBase: 97, tamBase: 400, tHorno: 210, tCoccion: 40, hum: 68 },
    { prod: panCenteno, linea: linea2, lineaCod: 'L2', mpProd: harinaCenteno, rendBase: 96, tamBase: 300, tHorno: 205, tCoccion: 45, hum: 70 },
    { prod: panSesamo, linea: linea1, lineaCod: 'L1', mpProd: harinaTrigo, rendBase: 97, tamBase: 350, tHorno: 215, tCoccion: 38, hum: 66 },
    { prod: croissant, linea: linea3, lineaCod: 'L3', mpProd: mantequilla, rendBase: 95, tamBase: 120, tHorno: 195, tCoccion: 25, hum: 60 },
    { prod: magdalenas, linea: linea3, lineaCod: 'L3', mpProd: mantequilla, rendBase: 98, tamBase: 200, tHorno: 180, tCoccion: 20, hum: 55 },
    { prod: muffins, linea: linea3, lineaCod: 'L3', mpProd: mantequilla, rendBase: 97, tamBase: 160, tHorno: 175, tCoccion: 22, hum: 58 },
  ];

  const lotesProducidos: any[] = [];

  for (let day = 30; day >= 0; day--) {
    const prodDia = randInt(2, 4);
    for (let p = 0; p < prodDia; p++) {
      const conf = pick(productosPT);
      const tamano = randInt(Math.round(conf.tamBase * 0.8), Math.round(conf.tamBase * 1.2));
      const rendimiento = randFloat(conf.rendBase - 3, conf.rendBase + 1);
      const isVencido = day > 10 && conf.prod.vidaUtilDias <= 7;
      const hora = pick([6, 8, 10, 14, 16]);

      const lotePT = await prisma.lote.create({
        data: {
          codigo: loteCode(conf.lineaCod, day),
          productoId: conf.prod.id,
          cantidad: isVencido ? 0 : tamano,
          cantidadInicial: tamano,
          unidadMedida: 'unidades',
          fechaProduccion: daysAgo(day, hora),
          fechaCaducidad: daysFromNow(conf.prod.vidaUtilDias - day),
          estado: isVencido ? EstadoLote.VENCIDO : EstadoLote.ACTIVO,
          almacenId: almacenPrincipal.id,
          ubicacionId: pick([ubiB, ubiB2, ubiC, ubiC2, ubiD]).id,
          creadoPor: produccionUser.id,
        }
      });

      const mpLote = await prisma.materiaPrima.create({
        data: {
          loteId: loteHarina28.id,
          proveedorId: molino.id,
          cantidad: tamano * 0.4,
          unidadMedida: 'kg',
          fechaRecepcion: daysAgo(28),
          fechaCaducidad: daysFromNow(152),
          creadoPor: produccionUser.id,
        }
      });

      const prod = await prisma.produccion.create({
        data: {
          loteId: lotePT.id,
          lineaProduccionId: conf.linea.id,
          temperaturaHorno: randFloat(conf.tHorno - 5, conf.tHorno + 5),
          tiempoCoccion: randInt(conf.tCoccion - 3, conf.tCoccion + 3),
          humedad: randFloat(conf.hum - 5, conf.hum + 5),
          tamanoLote: tamano,
          rendimiento,
          materiasPrimas: { connect: [{ id: mpLote.id }] },
          operarioId: produccionUser.id,
          fechaInicio: daysAgo(day, hora),
          fechaFin: daysAgo(day, hora + 2),
          etiquetasImpresas: Math.random() > 0.1,
          tipoEtiqueta: pick([TipoEtiqueta.CODE_128, TipoEtiqueta.QR, TipoEtiqueta.AMBOS]),
          cantidadEtiquetas: tamano,
          creadoPor: produccionUser.id,
        }
      });

      await prisma.movimientoLote.create({
        data: { loteId: lotePT.id, tipo: TipoMovimiento.PRODUCCION, ubicacionDestinoId: ubiB.id, cantidad: tamano, unidadMedida: 'unidades', realizadoPor: produccionUser.id, referenciaId: prod.id, referenciaTipo: 'PRODUCCION' }
      });

      lotesProducidos.push({ lote: lotePT, prod, conf, tamano, day });
    }
  }
  console.log(`✅ Producciones creadas (${lotesProducidos.length} lotes en 30 días)`);

  // ─── 30 DÍAS DE EXPEDICIONES ─────────────────────────────────────────────────
  // 1-3 expediciones por día (excepto los últimos 2 días parcial)
  const clientes = [bodega1, superFresh, restaurante, distribuidora, hotelChain, cafeteria];
  const expedicionesCreadas: any[] = [];
  let lotesExpedidosIds = new Set<string>();

  for (let day = 28; day >= 0; day--) {
    const numExp = randInt(1, 3);
    for (let e = 0; e < numExp; e++) {
      const cliente = pick(clientes);
      const isEntregada = day > 2;
      const isEnTransito = day === 2 || day === 1;
      const estado = isEntregada ? EstadoExpedicion.ENTREGADO : isEnTransito ? EstadoExpedicion.EN_TRANSITO : EstadoExpedicion.PREPARANDO;

      const exp = await prisma.expedicion.create({
        data: {
          codigo: expCode(day),
          clienteId: cliente.id,
          estado,
          empresaTransporte: pick(['TransRápido S.L.', 'Logística Express', 'Distribución Sur', 'FleetCargo S.A.', null]),
          matriculaVehiculo: pick(['1234-ABC', '5678-DEF', '9012-GHI', '3456-JKL', null]),
          nombreConductor: pick(['Marcos Díaz', 'Carmen Ruiz', 'Tomás Herrero', 'Elena Fuentes', null]),
          fechaPreparacion: daysAgo(day + 1, 14),
          fechaEnvio: isEntregada || isEnTransito ? daysAgo(day, 8) : null,
          fechaEntrega: isEntregada ? daysAgo(day, 16) : null,
          fechaPrevistaEntrega: daysFromNow(isEntregada ? -day : 1),
          preparadoPor: despachoUser.id,
        }
      });

      // Agregar 1-3 lotes a la expedición
      const candidatos = lotesProducidos.filter(l => !lotesExpedidosIds.has(l.lote.id) && l.lote.estado !== EstadoLote.VENCIDO && l.day >= day && l.day <= day + 5);
      const itemsAgregar = candidatos.slice(0, randInt(1, 3));

      for (const item of itemsAgregar) {
        const cantExp = Math.min(randInt(50, 200), item.tamano);
        await prisma.itemExpedicion.create({
          data: {
            expedicionId: exp.id,
            loteId: item.lote.id,
            cantidad: cantExp,
            unidadMedida: 'unidades',
            precioUnitario: randFloat(1.0, 4.5),
            precioTotal: parseFloat((cantExp * randFloat(1.0, 4.5)).toFixed(2)),
            verificado: isEntregada,
          }
        });

        if (isEntregada) {
          await prisma.movimientoLote.create({
            data: { loteId: item.lote.id, tipo: TipoMovimiento.EXPEDICION, ubicacionOrigenId: ubiB.id, cantidad: cantExp, unidadMedida: 'unidades', realizadoPor: despachoUser.id, referenciaId: exp.id, referenciaTipo: 'EXPEDICION' }
          });
          lotesExpedidosIds.add(item.lote.id);
        }
      }

      expedicionesCreadas.push(exp);
    }
  }
  console.log(`✅ Expediciones creadas (${expedicionesCreadas.length})`);

  // ─── MOVIMIENTOS INTERNOS DE ALMACÉN ─────────────────────────────────────────
  // 20 movimientos internos de reubicación
  for (let i = 0; i < 20; i++) {
    const lpEntry = pick(lotesProducidos);
    await prisma.movimientoLote.create({
      data: {
        loteId: lpEntry.lote.id,
        tipo: TipoMovimiento.MOVIMIENTO_INTERNO,
        ubicacionOrigenId: pick([ubiA, ubiB, ubiC]).id,
        ubicacionDestinoId: pick([ubiC2, ubiD]).id,
        cantidad: randInt(20, 100),
        unidadMedida: 'unidades',
        realizadoPor: almacenUser.id,
        observaciones: 'Reubicación para optimizar espacio',
        creadoEn: daysAgo(randInt(1, 15)),
      } as any
    });
  }
  console.log('✅ Movimientos internos creados (20)');

  // ─── ALERTAS (variadas) ──────────────────────────────────────────────────────
  const alertasData = [
    { day: 27, tipo: TipoAlerta.CALIDAD, sev: SeveridadAlerta.AVISO, estado: EstadoAlerta.RESUELTA, titulo: 'Variación de peso – Pan Blanco', desc: 'Control de peso detectó 8 unidades bajo el mínimo (470g vs 490g). Lote retirado y verificado.', resuelta: true },
    { day: 22, tipo: TipoAlerta.CONTAMINACION, sev: SeveridadAlerta.CRITICO, estado: EstadoAlerta.RESUELTA, titulo: 'Posible contaminación cruzada detectada', desc: 'Se detectaron trazas de frutos secos en línea 3 durante limpieza de cambio de turno.', resuelta: true },
    { day: 18, tipo: TipoAlerta.INCUMPLIMIENTO_ESPECIFICACIONES, sev: SeveridadAlerta.AVISO, estado: EstadoAlerta.RESUELTA, titulo: 'Temperatura horno fuera de rango', desc: 'Temperatura del horno L1 llegó a 235°C (máx 225°C) por 8 minutos.', resuelta: true },
    { day: 14, tipo: TipoAlerta.ETIQUETADO, sev: SeveridadAlerta.AVISO, estado: EstadoAlerta.RESUELTA, titulo: 'Error de fecha en etiquetas', desc: 'Lote L2 línea 2 con fecha de caducidad incorrecta impresa. 150 unidades corregidas.', resuelta: true },
    { day: 10, tipo: TipoAlerta.CALIDAD, sev: SeveridadAlerta.AVISO, estado: EstadoAlerta.CERRADA, titulo: 'Humedad alta en almacén A', desc: 'Sensor de humedad registró 85% HR en Zona A (máx 70%). Ventilación activada.', resuelta: true },
    { day: 7, tipo: TipoAlerta.CUERPO_EXTRANO, sev: SeveridadAlerta.CRITICO, estado: EstadoAlerta.INVESTIGANDO, titulo: 'Cuerpo extraño detectado – Croissant', desc: 'Control de calidad detectó un fragmento metálico en muestra de croissants. Lote bloqueado para investigación.', resuelta: false },
    { day: 5, tipo: TipoAlerta.INCUMPLIMIENTO_ESPECIFICACIONES, sev: SeveridadAlerta.CRITICO, estado: EstadoAlerta.INVESTIGANDO, titulo: 'Temperatura cámara frigorífica fuera de rango', desc: 'Cámara F registró 11.3°C durante 2 horas (máx 8°C). Levadura lote F2 posiblemente afectada.', resuelta: false },
    { day: 3, tipo: TipoAlerta.CALIDAD, sev: SeveridadAlerta.AVISO, estado: EstadoAlerta.ABIERTA, titulo: 'Caducidad próxima – Huevos Camperos', desc: 'Lote de huevos caduca en 3 días. Priorizar consumo en producción.', resuelta: false },
    { day: 2, tipo: TipoAlerta.OTRO, sev: SeveridadAlerta.AVISO, estado: EstadoAlerta.ABIERTA, titulo: 'Merma elevada en bollería', desc: 'Línea 3 registra 8.5% merma esta semana vs 3% objetivo. Revisar proceso.', resuelta: false },
    { day: 1, tipo: TipoAlerta.CALIDAD, sev: SeveridadAlerta.AVISO, estado: EstadoAlerta.ABIERTA, titulo: 'Stock mínimo harina integral', desc: 'Stock de harina integral por debajo del nivel mínimo (80kg < 100kg mínimo).', resuelta: false },
  ];

  const lpForAlerts = lotesProducidos.filter(l => l.lote.estado !== EstadoLote.VENCIDO);
  const alertasCreadas: any[] = [];
  for (const aData of alertasData) {
    const loteTarget = pick(lpForAlerts);
    const alerta = await prisma.alerta.create({
      data: {
        codigo: altCode(aData.day),
        loteId: loteTarget.lote.id,
        tipo: aData.tipo,
        severidad: aData.sev,
        estado: aData.estado,
        titulo: aData.titulo,
        descripcion: aData.desc,
        resolucion: aData.resuelta ? 'Incidencia investigada y resuelta conforme al protocolo de calidad.' : null,
        lotesAfectados: [loteTarget.lote.codigo],
        clientesAfectados: aData.resuelta ? [] : [pick(clientes).nombre],
        cantidadRetirada: aData.sev === SeveridadAlerta.CRITICO ? randFloat(10, 50) : randFloat(0, 20),
        cantidadRecuperada: aData.resuelta ? randFloat(400, 500) : 0,
        porcentajeRecuperacion: aData.resuelta ? randFloat(92, 99) : null,
        creadaPor: calidad.id,
        resueltaPor: aData.resuelta ? calidad.id : null,
        fechaCreacion: daysAgo(aData.day),
        fechaResolucion: aData.resuelta ? daysAgo(aData.day - 1) : null,
      }
    });
    alertasCreadas.push(alerta);

    // Notificaciones
    await prisma.notificacion.createMany({ data: [
      { alertaId: alerta.id, tipo: 'CORREO', destinatario: admin.email, asunto: `[${aData.sev}] ${aData.titulo}`, mensaje: aData.desc, enviada: true, fechaEnvio: daysAgo(aData.day) },
      { alertaId: alerta.id, tipo: 'SISTEMA', destinatario: calidad.email, asunto: aData.titulo, mensaje: aData.desc, enviada: Math.random() > 0.2, fechaEnvio: daysAgo(aData.day) },
    ] });
  }
  console.log(`✅ Alertas creadas (${alertasCreadas.length})`);

  // ─── SIMULACROS DE AUDITORÍA ─────────────────────────────────────────────────
  for (let i = 0; i < 3; i++) {
    const loteSimulacro = pick(lpForAlerts).lote;
    await prisma.simulacroAuditoria.create({
      data: {
        loteId: loteSimulacro.id,
        realizadoPor: calidad.id,
        tiempoIdentificarClientes: randInt(600, 1800),
        tiempoLocalizarStock: randInt(1800, 5400),
        tiempoGenerarReporte: randInt(300, 900),
        tiempoTotal: randInt(3600, 12600),
        tasaRecuperacion: randFloat(88, 99),
        clientesEncontrados: randInt(1, 4),
        stockLocalizado: randFloat(200, 600),
        aprobado: Math.random() > 0.3,
        objetivoTiempo: 14400,
        objetivoRecuperacion: 95,
        observaciones: pick(['Simulacro completado dentro de los tiempos objetivo.', 'Pequeñas demoras en localización de stock en almacén externo.', 'Excelente coordinación entre equipos. Tiempo récord.']),
        creadoEn: daysAgo(randInt(5, 25)) as any,
      } as any
    });
  }
  console.log('✅ Simulacros de auditoría creados (3)');

  // ─── REPORTES PROGRAMADOS ────────────────────────────────────────────────────
  await prisma.reporteProgramado.createMany({ data: [
    { nombre: 'Reporte Diario de Stock Crítico', tipo: 'STOCK', frecuencia: 'DIARIO', parametros: { umbralStock: 50, incluirVencidos: true }, destinatarios: ['admin@panaderia.com', 'almacen@panaderia.com'], activo: true, proximoEnvio: daysFromNow(1), creadoPor: admin.id },
    { nombre: 'Reporte Semanal de Producción', tipo: 'MOVIMIENTOS', frecuencia: 'SEMANAL', parametros: { diaEnvio: 'LUNES', hora: '08:00' }, destinatarios: ['admin@panaderia.com', 'produccion@panaderia.com'], activo: true, proximoEnvio: daysFromNow(7), creadoPor: admin.id },
    { nombre: 'Reporte Mensual de Trazabilidad y Auditoría', tipo: 'TRAZABILIDAD', frecuencia: 'MENSUAL', parametros: { diaEnvio: 1, incluirSimulacros: true }, destinatarios: ['admin@panaderia.com', 'calidad@panaderia.com'], activo: true, proximoEnvio: daysFromNow(30), creadoPor: admin.id },
    { nombre: 'Reporte Semanal de Alertas', tipo: 'AUDITORIA', frecuencia: 'SEMANAL', parametros: { incluirResueltas: false }, destinatarios: ['calidad@panaderia.com'], activo: true, proximoEnvio: daysFromNow(5), creadoPor: calidad.id },
    { nombre: 'Reporte Mensual de Caducidades', tipo: 'CADUCIDADES', frecuencia: 'MENSUAL', parametros: { diasAnticipacion: 7 }, destinatarios: ['admin@panaderia.com', 'almacen@panaderia.com'], activo: true, proximoEnvio: daysFromNow(30), creadoPor: admin.id },
  ] });
  console.log('✅ Reportes programados creados (5)');

  // ─── PLANTILLAS DE ETIQUETAS ─────────────────────────────────────────────────
  await prisma.plantillaEtiqueta.createMany({ data: [
    { nombre: 'Etiqueta Palet Pan Blanco', productoId: panBlanco.id, tipo: TipoEtiqueta.CODE_128, anchoMm: 100, altoMm: 60, camposIncluidos: ['nombre_producto', 'codigo_lote', 'fecha_produccion', 'fecha_caducidad', 'codigo_barras', 'peso_neto'] },
    { nombre: 'Etiqueta QR Consumidor Pan Integral', productoId: panIntegral.id, tipo: TipoEtiqueta.QR, anchoMm: 50, altoMm: 50, camposIncluidos: ['nombre_producto', 'codigo_lote', 'fecha_caducidad', 'qr_trazabilidad', 'ingredientes'] },
    { nombre: 'Etiqueta Bollería – Code y QR', productoId: croissant.id, tipo: TipoEtiqueta.AMBOS, anchoMm: 80, altoMm: 50, camposIncluidos: ['nombre_producto', 'codigo_lote', 'fecha_produccion', 'fecha_caducidad', 'codigo_barras', 'qr_trazabilidad'] },
    { nombre: 'Etiqueta Magdalenas', productoId: magdalenas.id, tipo: TipoEtiqueta.AMBOS, anchoMm: 80, altoMm: 50, camposIncluidos: ['nombre_producto', 'codigo_lote', 'fecha_caducidad', 'qr_trazabilidad', 'ingredientes', 'alergenos'] },
    { nombre: 'Etiqueta Pan de Centeno', productoId: panCenteno.id, tipo: TipoEtiqueta.QR, anchoMm: 50, altoMm: 50, camposIncluidos: ['nombre_producto', 'codigo_lote', 'fecha_caducidad', 'qr_trazabilidad'] },
  ] });
  console.log('✅ Plantillas de etiquetas creadas (5)');

  // ─── CONFIGURACIÓN DEL SISTEMA ───────────────────────────────────────────────
  await prisma.configuracionSistema.createMany({ data: [
    { clave: 'datos_empresa', valor: { nombre: 'Panadería Artesanal del Sol S.L.', direccion: 'Calle Industria 100, Polígono Norte', codigoPostal: '28001', ciudad: 'Madrid', pais: 'España', nif: 'B28000123', telefono: '+34 911 234 567', email: 'info@panaderia.com', web: 'https://panaderia.com' }, descripcion: 'Datos de la empresa para documentos y etiquetas' },
    { clave: 'formato_lote', valor: { prefijo: 'L', incluirFecha: true, incluirLinea: true, incluirTurno: false, correlativoLongitud: 2, separador: '' }, descripcion: 'Formato de generación de códigos de lote' },
    { clave: 'alertas_automaticas', valor: { activado: true, diasAntesCaducidad: 3, stockMinimoKg: 50, notificarEmail: true, notificarSistema: true }, descripcion: 'Configuración de alertas automáticas del sistema' },
    { clave: 'trazabilidad_publica', valor: { activada: true, mostrarIngredientes: true, mostrarProveedor: false, mostrarFechaProduccion: true, mostrarLinea: false }, descripcion: 'Configuración del portal QR público de trazabilidad' },
    { clave: 'fifo_obligatorio', valor: { activado: true, modulos: ['produccion', 'expedicion'] }, descripcion: 'Control FIFO obligatorio en módulos seleccionados' },
    { clave: 'kpis_dashboard', valor: { objetivoProduccionDiaria: 1500, objetivoExpedicionesDia: 5, umbralAlertasCriticas: 2, objetivoRendimiento: 97 }, descripcion: 'Objetivos KPI para el dashboard' },
  ] });
  console.log('✅ Configuración del sistema creada (6 claves)');

  // ─── RESUMEN FINAL ───────────────────────────────────────────────────────────
  const [totalLotes, totalProd, totalExp, totalAlerts] = await Promise.all([
    prisma.lote.count(),
    prisma.produccion.count(),
    prisma.expedicion.count(),
    prisma.alerta.count(),
  ]);

  console.log('\n🎉 Seed masivo completado!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 CREDENCIALES:');
  console.log('  admin@panaderia.com / produccion@panaderia.com / calidad@panaderia.com');
  console.log('  recepcion@panaderia.com / almacen@panaderia.com / despacho@panaderia.com');
  console.log('  Contraseña: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📦 TOTALES EN BD:`);
  console.log(`  • Lotes totales:      ${totalLotes}`);
  console.log(`  • Producciones:       ${totalProd}`);
  console.log(`  • Expediciones:       ${totalExp}`);
  console.log(`  • Alertas:            ${totalAlerts}`);
  console.log(`  • 30 días de historial de operaciones`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });