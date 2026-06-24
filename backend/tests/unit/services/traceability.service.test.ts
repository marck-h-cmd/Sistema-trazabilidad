import { TraceabilityService } from '../../../src/services/traceability.service';
import { prisma } from '../../../src/config/database';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    lote: { findUnique: jest.fn(), findMany: jest.fn() },
    materiaPrima: { findMany: jest.fn() },
    itemExpedicion: { findMany: jest.fn(), findFirst: jest.fn() },
    movimientoLote: { findMany: jest.fn() },
    alerta: { count: jest.fn() },
    usuario: { findUnique: jest.fn() },
  },
}));

const mockPrisma = prisma as unknown as {
  lote: { findUnique: jest.Mock; findMany: jest.Mock };
  materiaPrima: { findMany: jest.Mock };
  itemExpedicion: { findMany: jest.Mock; findFirst: jest.Mock };
  movimientoLote: { findMany: jest.Mock };
  alerta: { count: jest.Mock };
  usuario: { findUnique: jest.Mock };
};

describe('TraceabilityService authorization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks a client from viewing lots that were not shipped to their client', async () => {
    const service = new TraceabilityService();

    mockPrisma.lote.findUnique.mockResolvedValue({
      id: 'lote-1',
      codigo: 'LOT-001',
      producto: { id: 'producto-1', nombre: 'Pan', sku: 'SKU-1', descripcion: 'Pan de prueba' },
      cantidad: 10,
      cantidadInicial: 10,
      unidadMedida: 'kg',
      fechaProduccion: null,
      fechaCaducidad: null,
      fechaRecepcion: null,
      estado: 'ACTIVO',
      ubicacion: null,
      metadatos: null,
      observaciones: null,
    });
    mockPrisma.usuario.findUnique.mockResolvedValue({ id: 'user-1', rol: 'CLIENTE', clienteId: 'cliente-1' });
    mockPrisma.materiaPrima.findMany.mockResolvedValue([]);
    mockPrisma.itemExpedicion.findMany.mockResolvedValue([]);
    mockPrisma.movimientoLote.findMany.mockResolvedValue([]);
    mockPrisma.alerta.count.mockResolvedValue(0);
    mockPrisma.itemExpedicion.findFirst.mockResolvedValue(null);

    await expect(
      service.getFullTraceability('LOT-001', { id: 'user-1', rol: 'CLIENTE' } as any)
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('permiso'),
    });
  });

  it('blocks an authority from viewing lots without active alerts', async () => {
    const service = new TraceabilityService();

    mockPrisma.lote.findUnique.mockResolvedValue({
      id: 'lote-2',
      codigo: 'LOT-002',
      producto: { id: 'producto-2', nombre: 'Bollo', sku: 'SKU-2', descripcion: 'Bollo de prueba' },
      cantidad: 5,
      cantidadInicial: 5,
      unidadMedida: 'kg',
      fechaProduccion: null,
      fechaCaducidad: null,
      fechaRecepcion: null,
      estado: 'ACTIVO',
      ubicacion: null,
      metadatos: null,
      observaciones: null,
    });
    mockPrisma.usuario.findUnique.mockResolvedValue({ id: 'user-2', rol: 'AUTORIDAD', clienteId: null });
    mockPrisma.materiaPrima.findMany.mockResolvedValue([]);
    mockPrisma.itemExpedicion.findMany.mockResolvedValue([]);
    mockPrisma.movimientoLote.findMany.mockResolvedValue([]);
    mockPrisma.alerta.count.mockResolvedValue(0);

    await expect(
      service.getFullTraceability('LOT-002', { id: 'user-2', rol: 'AUTORIDAD' } as any)
    ).rejects.toMatchObject({
      statusCode: 403,
      message: expect.stringContaining('permiso'),
    });
  });

  it('reuses access validation during a single full traceability request', async () => {
    const service = new TraceabilityService();

    mockPrisma.lote.findUnique.mockResolvedValue({
      id: 'lote-3',
      codigo: 'LOT-003',
      producto: { id: 'producto-3', nombre: 'Baguette', sku: 'SKU-3', descripcion: 'Baguette' },
      cantidad: 8,
      cantidadInicial: 8,
      unidadMedida: 'kg',
      fechaProduccion: null,
      fechaCaducidad: null,
      fechaRecepcion: null,
      estado: 'ACTIVO',
      ubicacion: null,
      metadatos: null,
      observaciones: null,
      lotePadreId: null,
    });
    mockPrisma.usuario.findUnique.mockResolvedValue({ id: 'user-3', rol: 'CLIENTE', clienteId: 'cliente-1' });
    mockPrisma.materiaPrima.findMany.mockResolvedValue([]);
    mockPrisma.itemExpedicion.findMany.mockResolvedValue([]);
    mockPrisma.movimientoLote.findMany.mockResolvedValue([]);
    mockPrisma.alerta.count.mockResolvedValue(0);
    mockPrisma.itemExpedicion.findFirst.mockResolvedValue({ id: 'item-1' });
    mockPrisma.lote.findMany.mockResolvedValue([]);

    await service.getFullTraceability('LOT-003', { id: 'user-3', rol: 'CLIENTE' } as any);

    expect(mockPrisma.usuario.findUnique).toHaveBeenCalledTimes(1);
  });
});
