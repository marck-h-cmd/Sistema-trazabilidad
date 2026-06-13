import ExcelJS from 'exceljs';
import { formatDate } from '@utils/dateUtils';

export class ExcelService {
  async generateWorkbook(
    sheets: {
      name: string;
      headers: string[];
      data: any[][];
    }[]
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Trazabilidad Alimentaria';

    for (const sheet of sheets) {
      const worksheet = workbook.addWorksheet(sheet.name);

      worksheet.columns = sheet.headers.map((header, index) => ({
        header,
        key: `col_${index}`,
        width: Math.max(header.length + 5, 15),
      }));

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF97316' },
      };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      for (const row of sheet.data) {
        worksheet.addRow(row);
      }

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.alignment = { vertical: 'middle' };

          if (rowNumber % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF5F5F5' },
            };
          }
        }
      });
    }

    return (await workbook.xlsx.writeBuffer()) as Buffer;
  }

  async exportStockReport(data: any[]): Promise<Buffer> {
    const headers = ['Código Lote', 'Producto', 'SKU', 'Categoría', 'Cantidad', 'Unidad', 'Ubicación', 'Estado', 'Días Restantes', 'Fecha Caducidad'];

    const rows = data.flatMap((producto) =>
      producto.lotes.map((lote: any) => [
        lote.codigo,
        producto.producto,
        producto.sku,
        producto.categoria,
        lote.cantidad,
        lote.unidad,
        lote.ubicacion,
        lote.estado,
        lote.diasRestantes,
        lote.fechaCaducidad ? formatDate(lote.fechaCaducidad) : '',
      ])
    );

    return this.generateWorkbook([{ name: 'Stock', headers, data: rows }]);
  }

  async exportExpiryReport(data: any): Promise<Buffer> {
    const headers = ['Código Lote', 'Producto', 'Cantidad', 'Fecha Caducidad', 'Días Restantes', 'Ubicación', 'Alerta'];

    const rows = data.lotes.map((lote: any) => [
      lote.codigo,
      lote.producto,
      lote.cantidad,
      lote.fechaCaducidad ? formatDate(lote.fechaCaducidad) : '',
      lote.diasRestantes,
      lote.ubicacion,
      lote.alerta === 'rojo' ? 'CRÍTICO' : lote.alerta === 'amarillo' ? 'ATENCIÓN' : 'OK',
    ]);

    const resumenHeaders = ['Indicador', 'Valor'];
    const resumenRows = [
      ['Total Lotes', data.resumen.totalLotes],
      ['Vencidos', data.resumen.vencidos],
      ['Próximos 7 días', data.resumen.proximos7Dias],
      ['Próximos 15 días', data.resumen.proximos15Dias],
      ['Próximos 30 días', data.resumen.proximos30Dias],
    ];

    return this.generateWorkbook([
      { name: 'Caducidades', headers, data: rows },
      { name: 'Resumen', headers: resumenHeaders, data: resumenRows },
    ]);
  }

  async exportShipmentReport(data: any): Promise<Buffer> {
    const headers = ['Código', 'Cliente', 'Fecha Envío', 'Estado', 'Items', 'Cantidad Total', 'Transportista'];

    const rows = data.expediciones.map((exp: any) => [
      exp.codigo,
      exp.cliente,
      exp.fechaEnvio ? formatDate(exp.fechaEnvio) : '',
      exp.estado,
      exp.cantidadItems,
      exp.cantidadTotal,
      exp.transportista,
    ]);

    const resumenHeaders = ['Indicador', 'Valor'];
    const resumenRows = [
      ['Total Expediciones', data.resumen.totalExpediciones],
      ['Entregadas', data.resumen.totalEntregadas],
      ['En Tránsito', data.resumen.totalEnTransito],
      ['Canceladas', data.resumen.totalCanceladas],
    ];

    return this.generateWorkbook([
      { name: 'Expediciones', headers, data: rows },
      { name: 'Resumen', headers: resumenHeaders, data: resumenRows },
    ]);
  }
}