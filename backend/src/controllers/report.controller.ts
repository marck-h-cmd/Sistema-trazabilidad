import { Request, Response } from 'express';
import { ReportService } from '@services/report.service';
import { ExcelService } from '@services/excel.service';
import { PDFService } from '@services/pdf.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const reportService = new ReportService();
const excelService = new ExcelService();
const pdfService = new PDFService();

export class ReportController {
  stockReport = asyncHandler(async (req: Request, res: Response) => {
    const data = await reportService.generateStockReport(req.query as any);

    if (req.query.formato === 'excel') {
      const buffer = await excelService.exportStockReport(data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-stock.xlsx');
      return res.send(buffer);
    }

    res.json(formatApiResponse(data));
  });

  expiryReport = asyncHandler(async (req: Request, res: Response) => {
    const data = await reportService.generateExpiryReport(req.query as any);

    if (req.query.formato === 'excel') {
      const buffer = await excelService.exportExpiryReport(data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-caducidades.xlsx');
      return res.send(buffer);
    }

    res.json(formatApiResponse(data));
  });

  traceabilityReport = asyncHandler(async (req: Request, res: Response) => {
    const data = await reportService.generateTraceabilityReport(req.params.loteId);
    res.json(formatApiResponse(data));
  });

  shipmentReport = asyncHandler(async (req: Request, res: Response) => {
    const data = await reportService.generateShipmentReport(req.query as any);

    if (req.query.formato === 'excel') {
      const buffer = await excelService.exportShipmentReport(data);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=reporte-expediciones.xlsx');
      return res.send(buffer);
    }

    res.json(formatApiResponse(data));
  });
}

export const reportController = new ReportController();