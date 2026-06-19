import PDFDocument from 'pdfkit';
import { formatDate } from '@utils/dateUtils';
import { StockReportDTO, ExpiryReportDTO, ShipmentReportDTO } from '@customTypes/report.types';

export class PDFService {
  async generateAlbaran(data: {
    codigo: string;
    fecha: string;
    cliente: {
      nombre: string;
      direccion: string;
      ciudad: string;
      nif: string;
    };
    items: {
      producto: string;
      lote: string;
      cantidad: number;
      unidad: string;
    }[];
    transportista?: string;
    matricula?: string;
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(22).font('Helvetica-Bold').text('ALBARÁN DE ENTREGA', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Nº Albarán: ${data.codigo}`);
      doc.text(`Fecha: ${data.fecha}`);
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('DATOS DEL CLIENTE');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Cliente: ${data.cliente.nombre}`);
      doc.text(`NIF: ${data.cliente.nif}`);
      doc.text(`Dirección: ${data.cliente.direccion}, ${data.cliente.ciudad}`);
      doc.moveDown();

      if (data.transportista) {
        doc.fontSize(12).font('Helvetica-Bold').text('DATOS DE TRANSPORTE');
        doc.fontSize(10).font('Helvetica');
        doc.text(`Transportista: ${data.transportista}`);
        if (data.matricula) doc.text(`Matrícula: ${data.matricula}`);
        doc.moveDown();
      }

      doc.fontSize(12).font('Helvetica-Bold').text('PRODUCTOS');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const tableHeaders = ['Producto', 'Lote', 'Cantidad', 'Unidad'];
      const columnWidths = [250, 120, 80, 80];
      let currentX = 50;

      doc.fontSize(9).font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        doc.text(header, currentX, tableTop, { width: columnWidths[i], align: 'left' });
        currentX += columnWidths[i];
      });

      doc.moveDown(0.5);
      const lineY = doc.y;
      doc.moveTo(50, lineY).lineTo(545, lineY).stroke();
      doc.moveDown(0.5);

      doc.fontSize(9).font('Helvetica');
      data.items.forEach((item) => {
        currentX = 50;
        const rowY = doc.y;

        doc.text(item.producto, currentX, rowY, { width: columnWidths[0] });
        currentX += columnWidths[0];
        doc.text(item.lote, currentX, rowY, { width: columnWidths[1] });
        currentX += columnWidths[1];
        doc.text(item.cantidad.toString(), currentX, rowY, { width: columnWidths[2], align: 'right' });
        currentX += columnWidths[2];
        doc.text(item.unidad, currentX, rowY, { width: columnWidths[3] });

        doc.moveDown(0.5);
      });

      doc.moveDown();
      const totalItems = data.items.length;
      const totalCantidad = data.items.reduce((sum, item) => sum + item.cantidad, 0);

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`Total items: ${totalItems} | Cantidad total: ${totalCantidad}`);

      doc.moveDown(2);
      doc.fontSize(8).font('Helvetica');
      doc.text('Documento generado por el Sistema de Trazabilidad Alimentaria', { align: 'center' });
      doc.text(`Generado el ${formatDate(new Date(), "dd/MM/yyyy 'a las' HH:mm")}`, { align: 'center' });

      doc.end();
    });
  }

  async generateCrisisReport(data: {
    alerta: {
      codigo: string;
      tipo: string;
      severidad: string;
      titulo: string;
      descripcion: string;
      fecha: string;
    };
    impacto: {
      totalLotesAfectados: number;
      totalClientesAfectados: number;
      cantidadPendienteAlmacen: number;
      cantidadTotalDistribuida: number;
      porcentajeRecuperable: number;
    };
  }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 50 });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).font('Helvetica-Bold').fillColor('#EF4444').text('INFORME DE CRISIS', { align: 'center' });
      doc.fillColor('#000000');
      doc.moveDown();

      doc.fontSize(14).text(data.alerta.titulo);
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Código de alerta: ${data.alerta.codigo}`);
      doc.text(`Tipo: ${data.alerta.tipo}`);
      doc.text(`Severidad: ${data.alerta.severidad}`);
      doc.text(`Fecha: ${data.alerta.fecha}`);
      doc.text(`Descripción: ${data.alerta.descripcion}`);
      doc.moveDown();

      doc.fontSize(14).font('Helvetica-Bold').text('ANÁLISIS DE IMPACTO');
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      doc.text(`Total lotes afectados: ${data.impacto.totalLotesAfectados}`);
      doc.text(`Total clientes afectados: ${data.impacto.totalClientesAfectados}`);
      doc.text(`Cantidad pendiente en almacén: ${data.impacto.cantidadPendienteAlmacen}`);
      doc.text(`Cantidad total distribuida: ${data.impacto.cantidadTotalDistribuida}`);
      doc.text(`Porcentaje recuperable: ${data.impacto.porcentajeRecuperable}%`);

      doc.moveDown(2);
      doc.fontSize(8);
      doc.text('Documento generado para presentar ante autoridades sanitarias', { align: 'center' });
      doc.text(`Generado el ${formatDate(new Date(), "dd/MM/yyyy 'a las' HH:mm")}`, { align: 'center' });

      doc.end();
    });
  }

  async exportStockReport(data: StockReportDTO[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          this.drawFooter(doc, i + 1, pages.count);
        }
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);

      this.drawHeader(doc, 'REPORTE DE CONTROL DE STOCK', 'Inventario y disponibilidad actual de productos');

      let totalProductos = data.length;
      let totalLotes = data.reduce((sum, p) => sum + p.lotes.length, 0);
      let totalCantidad = data.reduce((sum, p) => sum + p.cantidadTotal, 0);

      this.drawSummaryCards(doc, [
        { label: 'Total Productos', value: totalProductos.toString() },
        { label: 'Total Lotes', value: totalLotes.toString() },
        { label: 'Stock Total', value: `${totalCantidad.toLocaleString('es-ES')} unds` },
      ]);

      doc.moveDown(1.5);

      const headers = ['Código Lote', 'Producto', 'SKU', 'Categoría', 'Cant.', 'Ubicación', 'F. Caducidad'];
      const widths = [80, 115, 70, 75, 45, 60, 50];
      const aligns: ('left'|'center'|'right')[] = ['left', 'left', 'left', 'left', 'right', 'left', 'center'];

      const rows = data.flatMap((producto) =>
        producto.lotes.map((lote: any) => [
          lote.codigo,
          producto.producto,
          producto.sku,
          producto.categoria,
          lote.cantidad.toString(),
          lote.ubicacion,
          lote.fechaCaducidad ? formatDate(lote.fechaCaducidad) : 'N/A',
        ])
      );

      this.drawTable(doc, headers, widths, aligns, rows, doc.y);
      doc.end();
    });
  }

  async exportExpiryReport(data: ExpiryReportDTO): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          this.drawFooter(doc, i + 1, pages.count);
        }
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);

      this.drawHeader(doc, 'REPORTE DE CADUCIDAD DE LOTES', 'Control y seguimiento de fechas de vencimiento de productos');

      this.drawSummaryCards(doc, [
        { label: 'Total Lotes', value: data.resumen.totalLotes.toString() },
        { label: 'Lotes Vencidos', value: data.resumen.vencidos.toString() },
        { label: 'Críticos (7 días)', value: data.resumen.proximos7Dias.toString() },
        { label: 'Advertencia (30 días)', value: (data.resumen.proximos15Dias + data.resumen.proximos30Dias).toString() },
      ]);

      doc.moveDown(1.5);

      const headers = ['Código Lote', 'Producto', 'Cantidad', 'Fecha Caducidad', 'Días', 'Ubicación', 'Estado'];
      const widths = [90, 135, 45, 80, 50, 50, 45];
      const aligns: ('left'|'center'|'right')[] = ['left', 'left', 'right', 'center', 'right', 'left', 'center'];

      const rows = data.lotes.map((lote: any) => [
        lote.codigo,
        lote.producto,
        lote.cantidad.toString(),
        lote.fechaCaducidad ? formatDate(lote.fechaCaducidad) : '',
        lote.diasRestantes.toString(),
        lote.ubicacion,
        lote.alerta === 'rojo' ? 'CRÍTICO' : lote.alerta === 'amarillo' ? 'ATENCIÓN' : 'OK',
      ]);

      this.drawTable(doc, headers, widths, aligns, rows, doc.y);
      doc.end();
    });
  }

  async exportShipmentReport(data: ShipmentReportDTO): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          this.drawFooter(doc, i + 1, pages.count);
        }
        resolve(Buffer.concat(chunks));
      });
      doc.on('error', reject);

      this.drawHeader(doc, 'REPORTE DE EXPEDICIONES', 'Control y seguimiento de envíos y entregas a clientes');

      this.drawSummaryCards(doc, [
        { label: 'Total Envíos', value: data.resumen.totalExpediciones.toString() },
        { label: 'Entregadas', value: data.resumen.totalEntregadas.toString() },
        { label: 'En Tránsito', value: data.resumen.totalEnTransito.toString() },
        { label: 'Canceladas', value: data.resumen.totalCanceladas.toString() },
      ]);

      doc.moveDown(1.5);

      const headers = ['Código', 'Cliente', 'Fecha Envío', 'Estado', 'Items', 'Cant.', 'Transportista'];
      const widths = [80, 135, 70, 75, 35, 45, 55];
      const aligns: ('left'|'center'|'right')[] = ['left', 'left', 'left', 'left', 'right', 'right', 'left'];

      const rows = data.expediciones.map((exp: any) => [
        exp.codigo,
        exp.cliente,
        exp.fechaEnvio ? formatDate(exp.fechaEnvio) : '',
        exp.estado,
        exp.cantidadItems.toString(),
        exp.cantidadTotal.toString(),
        exp.transportista,
      ]);

      this.drawTable(doc, headers, widths, aligns, rows, doc.y);
      doc.end();
    });
  }

  // --- Helpers for Drawing ---

  private drawHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string) {
    doc.rect(0, 0, doc.page.width, 15);
    doc.fillColor('#F97316').fill();

    doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(16);
    doc.text('ALIMENTA TRAZABILIDAD', 50, 35);
    
    doc.fillColor('#64748B').font('Helvetica').fontSize(8);
    doc.text('SISTEMA DE GESTIÓN Y TRAZABILIDAD ALIMENTARIA', 50, 52);

    doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(20).text(title, 50, 75);
    doc.fillColor('#475569').font('Helvetica').fontSize(10).text(subtitle, 50, 98);

    const dateStr = formatDate(new Date(), "dd/MM/yyyy HH:mm");
    doc.fillColor('#475569').font('Helvetica').fontSize(9);
    doc.text(`Generado: ${dateStr}`, doc.page.width - 180, 35, { align: 'right', width: 130 });

    doc.rect(50, 115, 495, 2);
    doc.fillColor('#E2E8F0').fill();
    doc.y = 130;
  }

  private drawSummaryCards(doc: PDFKit.PDFDocument, cards: { label: string; value: string }[]) {
    const startY = doc.y;
    const totalWidth = 495;
    const count = cards.length;
    const gap = 15;
    const cardWidth = (totalWidth - (gap * (count - 1))) / count;
    const cardHeight = 50;

    cards.forEach((card, index) => {
      const x = 50 + index * (cardWidth + gap);
      
      doc.rect(x, startY, cardWidth, cardHeight);
      doc.fillColor('#F8FAFC').fill();

      doc.rect(x, startY, cardWidth, cardHeight);
      doc.strokeColor('#E2E8F0').lineWidth(1).stroke();
      
      doc.rect(x, startY, 4, cardHeight);
      doc.fillColor('#F97316').fill();

      doc.fillColor('#64748B').font('Helvetica-Bold').fontSize(7.5);
      doc.text(card.label.toUpperCase(), x + 10, startY + 12, { width: cardWidth - 16, lineBreak: false });
      
      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(11);
      doc.text(card.value, x + 10, startY + 28, { width: cardWidth - 16, lineBreak: false });
    });

    doc.y = startY + cardHeight + 10;
  }

  private drawTable(
    doc: PDFKit.PDFDocument,
    headers: string[],
    widths: number[],
    aligns: ('left' | 'center' | 'right')[],
    rows: any[][],
    startY: number
  ) {
    const pageHeight = doc.page.height;
    const bottomMargin = 70;
    const rowHeight = 22;
    const headerHeight = 25;

    let currentY = startY;

    const printHeaders = (y: number) => {
      doc.rect(50, y, 495, headerHeight);
      doc.fillColor('#1E293B').fill();
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9);

      let currentX = 50;
      headers.forEach((header, idx) => {
        doc.text(header, currentX, y + 7, {
          width: widths[idx],
          align: aligns[idx],
        });
        currentX += widths[idx];
      });
      return y + headerHeight;
    };

    currentY = printHeaders(currentY);

    doc.font('Helvetica').fontSize(9);
    rows.forEach((row, rowIndex) => {
      if (currentY + rowHeight > pageHeight - bottomMargin) {
        doc.addPage();
        currentY = printHeaders(50);
        doc.font('Helvetica').fontSize(9);
      }

      if (rowIndex % 2 === 0) {
        doc.rect(50, currentY, 495, rowHeight);
        doc.fillColor('#F8FAFC').fill();
      }

      doc.moveTo(50, currentY + rowHeight - 1).lineTo(545, currentY + rowHeight - 1).strokeColor('#E2E8F0').lineWidth(1).stroke();

      doc.fillColor('#334155');
      let currentX = 50;
      row.forEach((val, idx) => {
        const text = val === null || val === undefined ? '' : String(val);
        doc.text(text, currentX, currentY + 6, {
          width: widths[idx],
          align: aligns[idx],
        });
        currentX += widths[idx];
      });

      currentY += rowHeight;
    });

    doc.y = currentY;
  }

  private drawFooter(doc: PDFKit.PDFDocument, page: number, total: number) {
    doc.rect(50, doc.page.height - 60, 495, 1);
    doc.fillColor('#E2E8F0').fill();
    
    doc.fillColor('#94A3B8').font('Helvetica').fontSize(8);
    doc.text(
      'Documento confidencial - Generado por Sistema Alimenta Trazabilidad',
      50,
      doc.page.height - 48,
      { align: 'left', width: 300 }
    );
    
    doc.text(
      `Página ${page} de ${total}`,
      doc.page.width - 150,
      doc.page.height - 48,
      { align: 'right', width: 100 }
    );
  }
}