import { generateBarcode } from '@services/barcode.service';
import { generateQRCode } from '@services/qrcode.service';
import { prisma } from '@config/database';
import { ApiError } from '@utils/errors';
import { PrintLabelRequest, PrintLabelResponse, LabelData } from '@types/barcode.types';
import { formatDate } from '@utils/dateUtils';

export class LabelService {
  async generateLabels(request: PrintLabelRequest): Promise<PrintLabelResponse> {
    const lote = await prisma.lote.findUnique({
      where: { id: request.lotId },
      include: { producto: true },
    });

    if (!lote) {
      throw ApiError.notFound('Lote no encontrado');
    }

    const labelType = request.labelType || 'CODE_128';
    const quantity = request.quantity || 1;

    const labelData: LabelData = {
      productName: request.customData?.productName || lote.producto.nombre,
      lotCode: lote.codigo,
      productionDate: lote.fechaProduccion ? formatDate(lote.fechaProduccion) : undefined,
      expiryDate: lote.fechaCaducidad ? formatDate(lote.fechaCaducidad) : undefined,
      weight: request.customData?.weight,
      ingredients: request.customData?.ingredients,
      alergenos: request.customData?.alergenos,
      additionalInfo: request.customData?.additionalInfo,
    };

    if (labelType === 'CODE_128' || labelType === 'QR') {
      if (labelType === 'CODE_128') {
        labelData.barcode = lote.codigo;
      } else {
        const qr = await generateQRCode(lote.codigo);
        labelData.qrCode = qr.dataUrl;
      }
    }

    return {
      success: true,
      labelsGenerated: quantity,
      message: `${quantity} etiquetas generadas para lote ${lote.codigo}`,
    };
  }

  async getTemplates(productoId?: string) {
    const where: any = { activo: true };
    if (productoId) where.productoId = productoId;

    return prisma.plantillaEtiqueta.findMany({
      where,
      include: { producto: { select: { nombre: true } } },
    });
  }

  async createTemplate(data: {
    nombre: string;
    productoId: string;
    tipo: 'CODE_128' | 'QR' | 'AMBOS';
    anchoMm: number;
    altoMm: number;
    camposIncluidos: string[];
    plantillaHtml?: string;
  }) {
    return prisma.plantillaEtiqueta.create({ data });
  }

  async updateTemplate(id: string, data: any) {
    return prisma.plantillaEtiqueta.update({ where: { id }, data });
  }

  async deleteTemplate(id: string) {
    return prisma.plantillaEtiqueta.update({
      where: { id },
      data: { activo: false },
    });
  }
}