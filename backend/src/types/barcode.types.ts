export interface BarcodeConfig {
  type: 'code128' | 'ean13' | 'ean8' | 'upc' | 'qr';
  scale?: number;
  height?: number;
  width?: number;
  background?: string;
  color?: string;
  includeText?: boolean;
  textPosition?: 'top' | 'bottom' | 'none';
}

export interface GeneratedBarcode {
  image: Buffer;
  format: string;
  code: string;
  mimeType: string;
}

export interface QRConfig {
  size?: number;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export interface GeneratedQR {
  image: Buffer;
  dataUrl: string;
  code: string;
  url: string;
  size: number;
}

export interface LabelData {
  productName: string;
  lotCode: string;
  productionDate?: string;
  expiryDate?: string;
  barcode?: string;
  qrCode?: string;
  weight?: string;
  ingredients?: string;
  alergenos?: string;
  additionalInfo?: string[];
}

export interface LabelTemplate {
  id?: string;
  nombre: string;
  productoId: string;
  tipo: 'CODE_128' | 'QR' | 'AMBOS';
  anchoMm: number;
  altoMm: number;
  camposIncluidos: string[];
  plantillaHtml?: string;
  activo?: boolean;
}

export interface PrintLabelRequest {
  templateId?: string;
  lotId: string;
  quantity: number;
  labelType?: 'CODE_128' | 'QR';
  customData?: Record<string, string>;
}

export interface PrintLabelResponse {
  success: boolean;
  labelsGenerated: number;
  downloadUrl?: string;
  message?: string;
}