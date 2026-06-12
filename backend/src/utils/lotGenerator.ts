import { prisma } from '@config/database';
import { config } from '@config/app';
import { formatDateYYMMDD } from './dateUtils';
import { padNumber } from './stringUtils';

interface LotCodeConfig {
  prefix?: string;
  includeDate?: boolean;
  includeLine?: boolean;
  correlativeLength?: number;
}

export async function generateLotCode(
  lineCode?: string,
  lotConfig?: LotCodeConfig
): Promise<string> {
  const prefix = lotConfig?.prefix || config.lot.prefix;
  const includeDate = lotConfig?.includeDate ?? config.lot.includeDate;
  const includeLine = lotConfig?.includeLine ?? config.lot.includeLine;
  const correlativeLength = lotConfig?.correlativeLength || config.lot.correlativeLength;

  const today = new Date();
  const datePart = includeDate ? formatDateYYMMDD(today) : '';

  const linePart = includeLine && lineCode ? lineCode : '';

  const prefixSearch = `${prefix}${datePart}${linePart}`;

  const lastLot = await prisma.lote.findFirst({
    where: {
      codigo: {
        startsWith: prefixSearch,
      },
    },
    orderBy: {
      codigo: 'desc',
    },
  });

  let correlative = 1;

  if (lastLot) {
    const lastCode = lastLot.codigo;
    const lastCorrelative = lastCode.slice(-correlativeLength);
    correlative = parseInt(lastCorrelative, 10) + 1;
  }

  const correlativePart = padNumber(correlative, correlativeLength);

  return `${prefix}${datePart}${linePart}${correlativePart}`;
}

export async function generateReceptionCode(): Promise<string> {
  const today = new Date();
  const datePart = formatDateYYMMDD(today);

  const lastReception = await prisma.recepcion.findFirst({
    where: {
      codigo: {
        startsWith: `REC-${datePart}`,
      },
    },
    orderBy: {
      codigo: 'desc',
    },
  });

  let correlative = 1;

  if (lastReception) {
    const lastCorrelative = lastReception.codigo.slice(-3);
    correlative = parseInt(lastCorrelative, 10) + 1;
  }

  return `REC-${datePart}-${padNumber(correlative, 3)}`;
}

export async function generateShipmentCode(): Promise<string> {
  const today = new Date();
  const datePart = formatDateYYMMDD(today);

  const lastShipment = await prisma.expedicion.findFirst({
    where: {
      codigo: {
        startsWith: `EXP-${datePart}`,
      },
    },
    orderBy: {
      codigo: 'desc',
    },
  });

  let correlative = 1;

  if (lastShipment) {
    const lastCorrelative = lastShipment.codigo.slice(-3);
    correlative = parseInt(lastCorrelative, 10) + 1;
  }

  return `EXP-${datePart}-${padNumber(correlative, 3)}`;
}

export async function generateAlertCode(): Promise<string> {
  const today = new Date();
  const datePart = formatDateYYMMDD(today);

  const lastAlert = await prisma.alerta.findFirst({
    where: {
      codigo: {
        startsWith: `ALT-${datePart}`,
      },
    },
    orderBy: {
      codigo: 'desc',
    },
  });

  let correlative = 1;

  if (lastAlert) {
    const lastCorrelative = lastAlert.codigo.slice(-3);
    correlative = parseInt(lastCorrelative, 10) + 1;
  }

  return `ALT-${datePart}-${padNumber(correlative, 3)}`;
}