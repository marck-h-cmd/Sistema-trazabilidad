import PDFDocument from 'pdfkit';
import { formatDate } from '@utils/dateUtils';

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
}