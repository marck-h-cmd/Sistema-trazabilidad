**Manual de Usuario del Software**

El Manual de Usuario es el documento que guía al usuario final en el uso correcto del sistema, explicando de manera práctica las funcionalidades disponibles y los procedimientos necesarios para operar el software.

1. Presentación

Descripción general del sistema y su propósito

- El Sistema de Trazabilidad Alimentaria es una aplicación web diseñada para gestionar la trazabilidad completa de materias primas y productos terminados en una panadería industrial. Permite registrar lotes, recepciones, procesos de producción, movimientos de inventario, expediciones, alertas y generación de reportes, así como ofrecer un portal público para la consulta de trazabilidad mediante códigos QR.
- Objetivo: facilitar el control de calidad, cumplimiento normativo (APPCC, ISO 22000, IFS, BRC) y ofrecer visibilidad en tiempo real sobre inventarios y lotes.

2. Requisitos del Sistema

2.1 Sistema operativo compatible

- Windows 10/11, macOS (versión reciente) o cualquier distribución Linux moderna para la ejecución local de contenedores o desarrollo.

2.2 Navegador web recomendado

- Google Chrome (última versión) o Microsoft Edge (Chromium). También compatible con Firefox y Safari, se recomienda mantener el navegador actualizado.

2.3 Requisitos de hardware

- Cliente (navegador): CPU moderna, 4 GB RAM mínimo (8 GB recomendado), conexión a Internet estable.
- Servidor (producción): conforme a la carga esperada — como referencia, para despliegues pequeños: 2 CPU, 4 GB RAM, PostgreSQL y Redis en instancias dedicadas o servicios gestionados.

3. Acceso al Sistema

3.1 Ingreso mediante usuario y contraseña

- Abra el navegador y acceda a la URL del sistema (ej. `https://su-dominio.com` o `http://localhost:3000` en desarrollo).
- En la pantalla de login introduzca su correo electrónico y contraseña y haga clic en "Iniciar sesión".
- Si las credenciales son correctas, accederá al panel principal según su rol.

3.2 Recuperación de contraseña

- En la pantalla de login, haga clic en "¿Olvidó su contraseña?".
- Introduzca su correo electrónico registrado y pulse "Enviar".
- Recibirá un correo con instrucciones y un enlace para restablecer la contraseña. Siga el enlace y establezca una nueva contraseña segura.

3.3 Cierre de sesión

- En cualquier pantalla, utilice la opción "Cerrar sesión" (generalmente disponible en el menú de usuario o en la esquina superior derecha). Tras cerrar sesión, será redirigido a la pantalla de login.

4. Menú Principal

Descripción de cada opción disponible en la interfaz principal

- Dashboard: resumen de KPIs, gráficos de producción, niveles de inventario y alertas recientes.
- Recepción: registrar y gestionar recepciones de materias primas; crear lotes asociados a proveedores.
- Producción: crear órdenes de producción, vincular materias primas a lotes terminados y registrar rendimientos.
- Almacén / Inventario: visualizar stock por ubicación, movimientos, ajustes y consultas FIFO.
- Expedición: preparar y validar expediciones, seleccionar lotes para salida y generar documentos de envío.
- Trazabilidad: buscar el historial de un lote, ver su recorrido desde recepción hasta expedición y generar trazabilidad en PDF/QR.
- Alertas: gestionar alertas de calidad, acciones correctivas y simulacros de auditoría.
- Reportes: generar reportes programados y ad-hoc (PDF, Excel, CSV).
- Configuración: parámetros del sistema, gestión de códigos, líneas de producción y opciones generales.
- Usuarios: panel para administrar usuarios y roles (solo para administradores).

5. Procedimientos Operativos

Explicación paso a paso de las funcionalidades

5.1 Registrar información

- Recepciones:
  1. Ir a "Recepción" → "Nueva recepción".
  2. Seleccionar proveedor, fecha y documentos adjuntos.
  3. Añadir items recepcionados con cantidad y lote/propuesta de código de lote.
  4. Guardar. El sistema crea los registros y lotes asociados.

- Productos / Materias primas:
  1. Ir a "Productos" → "Nuevo producto".
  2. Completar campos obligatorios (nombre, tipo, unidad de medida).
  3. Guardar para que esté disponible en recepciones y órdenes de producción.

5.2 Editar registros

- Localice el registro (ej. lote, recepción, producto) usando la lista o el buscador.
- Abra el registro y haga clic en "Editar".
- Modifique los campos necesarios y pulse "Guardar". Algunas entidades críticas pueden registrar auditoría de cambios.

5.3 Eliminar registros

- Sugerencia: el sistema controla la eliminación por dependencias. Antes de eliminar, verifique que no existan movimientos, producciones o expediciones vinculadas.
- Para eliminar: abra el registro, haga clic en "Eliminar" y confirme. Las eliminaciones pueden requerir permisos de administrador y dejar un rastro en el log de auditoría.

5.4 Consultar información

- Use los filtros en las pantallas de lista (por fecha, proveedor, estado, ubicación, línea de producción, código de lote).
- En la vista de trazabilidad, ingrese un código de lote o escanee el QR para ver el historial completo.

5.5 Generar reportes

- Ir a "Reportes" → seleccionar tipo de reporte (inventario, producciones, recepciones, trazabilidad).
- Configurar filtros y rango de fechas.
- Hacer clic en "Generar". El reporte se mostrará en pantalla y podrá descargarse.

5.6 Exportar datos

- Los listados y reportes permiten exportar en formatos: CSV, Excel (XLSX) y PDF.
- En la vista de lista o en el reporte generado, haga clic en "Exportar" y elija el formato.

6. Gestión de Usuarios

6.1 Creación de usuarios

- Sólo usuarios con permisos de administrador pueden crear nuevos usuarios.
- Ir a "Usuarios" → "Nuevo usuario".
- Completar datos (nombre, correo, rol) y asignar contraseña o solicitar restablecimiento por correo.

6.2 Asignación de roles

- El sistema incluye roles preconfigurados: ADMINISTRADOR, CALIDAD, RECEPCION, PRODUCCION, ALMACEN, DESPACHO, CLIENTE, AUTORIDAD.
- Al crear o editar un usuario, seleccione el rol que define las capacidades y accesos.

6.3 Modificación de permisos

- Para ajustes finos de permisos (si su instalación lo permite), vaya a "Configuración → Roles/Permisos" y edite las acciones permitidas por rol.
- Cambios en permisos afectan el acceso inmediatamente; haga pruebas en un usuario de prueba antes de aplicar en producción.

7. Solución de Problemas Frecuentes

Listado de errores comunes y posibles soluciones

- No puedo iniciar sesión:
  - Verifique usuario/contraseña. Use "Olvidó su contraseña" si es necesario.
  - Compruebe que el servidor esté en línea y que la URL sea la correcta.

- No se generan lotes al registrar recepción:
  - Revise que los campos obligatorios del proveedor y los items estén completos.
  - Compruebe logs del backend y que la conexión a la base de datos esté operativa.

- Reportes lentos o fallan al generar:
  - Asegúrese de que la base de datos tenga índices adecuados y que el servidor tenga recursos suficientes.
  - Para grandes volúmenes, use filtros y rangos de fechas más acotados.

- Exportación a Excel/CSV con campos vacíos:
  - Valide los mapeos de columnas en la configuración de reportes y que los datos existan en el rango solicitado.

- Problemas con escaneo de códigos (QR/Code128):
  - Verifique la calidad de impresión/visualización del código y que la cámara/lector esté configurado.
  - Asegúrese de que el formato del código sea compatible.

Si el problema persiste, capture el mensaje de error y contacte al soporte técnico.

8. Soporte Técnico

- En casos de incidencia o dudas puede contactar al equipo de soporte técnico:

- Correo electrónico: soporte@panaderia.com (o el correo configurado por la empresa)
- Teléfono: +34 900 000 000 (número de ejemplo — sustituir por el real de la empresa)
- Horario de atención: Lunes a Viernes 09:00–18:00

Información a proporcionar al solicitar soporte:

- Descripción breve del problema.
- Pasos para reproducir el error.
- Capturas de pantalla o logs relevantes (adjunte el archivo de log si es posible).
- Usuario afectado y rol.

Anexos y buenas prácticas

- Mantenga sus credenciales seguras y cambie contraseñas periódicamente.
- Antes de realizar cambios masivos en producción (eliminaciones, ajustes de permisos), haga una copia de seguridad de la base de datos.
- Para entornos con Docker, use `docker-compose.dev.yml` para desarrollo y pruebe cambios en un entorno de staging antes de producción.

Fin del Manual de Usuario.
