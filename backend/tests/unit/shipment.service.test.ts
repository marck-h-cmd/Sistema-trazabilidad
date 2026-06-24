import { ShipmentService } from '../../src/services/shipment.service';
import { ApiError } from '../../src/utils/errors';
import { prisma } from '../../src/config/database';
import { LotService } from '../../src/services/lot.service';

jest.mock('../../src/config/database', () => ({
  prisma: {
    cliente: { findUnique: jest.fn() },
    alerta: { count: jest.fn() },
    expedicion: { create: jest.fn() },
    itemExpedicion: { create: jest.fn() },
    lote: { update: jest.fn() },
    movimientoLote: { create: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock('../../src/services/lot.service', () => ({
  LotService: jest.fn(),
}));

jest.mock('../../src/repositories/shipment.repository', () => ({
  ShipmentRepository: jest.fn().mockImplementation(() => ({
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    getRecentShipments: jest.fn(),
    getShipmentsByClient: jest.fn(),
  })),
}));

jest.mock('../../src/utils/lotGenerator', () => ({
  generateShipmentCode: jest.fn().mockResolvedValue('EXP-TEST-001'),
}));

jest.mock('../../src/events/eventEmitter', () => ({
  appEvents: { emitEvent: jest.fn() },
  EVENT_TYPES: {
    SHIPMENT_CREATED: 'SHIPMENT_CREATED',
    SHIPMENT_DISPATCHED: 'SHIPMENT_DISPATCHED',
    SHIPMENT_DELIVERED: 'SHIPMENT_DELIVERED',
    SHIPMENT_CANCELLED: 'SHIPMENT_CANCELLED',
  },
}));

jest.mock('../../src/queues/email.queue', () => ({
  addEmailToQueue: jest.fn().mockResolvedValue(undefined),
}));

const mockPrisma = prisma as unknown as {
  cliente: { findUnique: jest.Mock };
  alerta: { count: jest.Mock };
  expedicion: { create: jest.Mock };
  itemExpedicion: { create: jest.Mock };
  lote: { update: jest.Mock };
  movimientoLote: { create: jest.Mock };
  $transaction: jest.Mock;
};
const MockedLotService = LotService as jest.MockedClass<typeof LotService>;

describe('ShipmentService business validations', () => {
  const mockFindById = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    MockedLotService.mockImplementation(() => ({ findById: mockFindById }) as any);
    mockFindById.mockReset();
    mockPrisma.cliente.findUnique.mockReset();
    mockPrisma.alerta.count.mockReset();
    mockPrisma.expedicion.create.mockReset();
    mockPrisma.itemExpedicion.create.mockReset();
    mockPrisma.lote.update.mockReset();
    mockPrisma.movimientoLote.create.mockReset();
    mockPrisma.$transaction.mockReset();
  });

  it('rejects lots whose expiry date has passed', async () => {
    const service = new ShipmentService();

    mockPrisma.cliente.findUnique.mockResolvedValue({
      id: 'cliente-1',
      nombre: 'Cliente Test',
      emailContacto: null,
    } as any);

    mockFindById.mockResolvedValue({
      id: 'lote-1',
      codigo: 'L-001',
      cantidad: 10,
      unidadMedida: 'kg',
      estado: 'ACTIVO',
      fechaCaducidad: new Date('2020-01-01T00:00:00.000Z'),
      ubicacionId: null,
      cantidadInicial: 10,
      productoId: 'producto-1',
    } as any);

    mockPrisma.alerta.count.mockResolvedValue(0);

    await expect(
      service.create({ clienteId: 'cliente-1', items: [{ loteId: 'lote-1', cantidad: 1 }] }, 'user-1')
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('caducado'),
    });
  });

  it('rejects lots with an active sanitary alert', async () => {
    const service = new ShipmentService();

    mockPrisma.cliente.findUnique.mockResolvedValue({
      id: 'cliente-1',
      nombre: 'Cliente Test',
      emailContacto: null,
    } as any);

    mockFindById.mockResolvedValue({
      id: 'lote-2',
      codigo: 'L-002',
      cantidad: 10,
      unidadMedida: 'kg',
      estado: 'ACTIVO',
      fechaCaducidad: new Date('2030-01-01T00:00:00.000Z'),
      ubicacionId: null,
      cantidadInicial: 10,
      productoId: 'producto-1',
    } as any);

    mockPrisma.alerta.count.mockResolvedValue(1);

    await expect(
      service.create({ clienteId: 'cliente-1', items: [{ loteId: 'lote-2', cantidad: 1 }] }, 'user-1')
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining('alerta sanitaria'),
    });
  });
});
