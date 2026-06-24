import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportProductionsToPDF(productions: any[], filename = 'producciones.pdf') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFontSize(18);
  doc.text('Reporte de Producciones', 14, 20);

  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28);

  const rows = productions.map((p: any) => [
    p.lote?.codigo || 'N/A',
    p.lote?.producto?.nombre || 'N/A',
    p.lineaProduccion?.codigo || 'N/A',
    p.fechaInicio ? new Date(p.fechaInicio).toLocaleString() : 'N/A',
    p.rendimiento ? `${p.rendimiento.toFixed(1)}%` : 'N/A',
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Lote', 'Producto', 'Línea', 'Fecha Inicio', 'Rendimiento']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [234, 88, 12] },
  });

  doc.save(filename);
}

export function exportInventoryToPDF(lotes: any[], filename = 'inventario.pdf') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(18);
  doc.text('Reporte de Inventario', 14, 20);

  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28);

  const rows = lotes.map((l: any) => [
    l.codigo || 'N/A',
    l.producto?.nombre || 'N/A',
    l.producto?.sku || 'N/A',
    l.cantidad ?? 0,
    l.unidadMedida || '',
    l.estado || '',
    l.ubicacion?.codigoCompleto || 'Sin ubicación',
    l.fechaCaducidad ? new Date(l.fechaCaducidad).toLocaleDateString() : 'N/A',
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Código', 'Producto', 'SKU', 'Cantidad', 'Unidad', 'Estado', 'Ubicación', 'Caducidad']],
    body: rows,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  doc.save(filename);
}

export function exportMovementsToPDF(movements: any[], filename = 'movimientos.pdf') {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(18);
  doc.text('Reporte de Movimientos de Lotes', 14, 20);

  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28);

  const rows = movements.map((m: any) => [
    m.lote?.codigo || 'N/A',
    m.tipo || 'N/A',
    m.ubicacionOrigen?.codigoCompleto || 'N/A',
    m.ubicacionDestino?.codigoCompleto || 'N/A',
    `${m.cantidad ?? 0} ${m.unidadMedida || ''}`,
    m.creadoEn ? new Date(m.creadoEn).toLocaleString() : 'N/A',
  ]);

  autoTable(doc, {
    startY: 35,
    head: [['Lote', 'Tipo', 'Origen', 'Destino', 'Cantidad', 'Fecha']],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [147, 51, 234] },
  });

  doc.save(filename);
}

export function exportLabelToPDF(
  data: {
    productName: string;
    lotCode: string;
    productionDate?: string;
    expiryDate?: string;
    weight?: string;
    barcodeImage?: string;
    qrImage?: string;
  },
  filename = `etiqueta-${data.lotCode}.pdf`
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [100, 60] });

  doc.setFontSize(10);
  doc.text(data.productName, 5, 8);

  doc.setFontSize(8);
  doc.text(`Lote: ${data.lotCode}`, 5, 14);
  if (data.productionDate) doc.text(`Prod: ${data.productionDate}`, 5, 19);
  if (data.expiryDate) doc.text(`Cad: ${data.expiryDate}`, 5, 24);
  if (data.weight) doc.text(`Peso: ${data.weight}`, 5, 29);

  let x = 5;
  if (data.barcodeImage) {
    doc.addImage(data.barcodeImage, 'PNG', x, 33, 40, 18);
    x = 55;
  }
  if (data.qrImage) {
    doc.addImage(data.qrImage, 'PNG', x, 33, 20, 20);
  }

  doc.save(filename);
}
