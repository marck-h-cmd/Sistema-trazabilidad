import { Request, Response } from 'express';
import { DashboardService } from '@services/dashboard.service';
import { asyncHandler, formatApiResponse } from '@utils/helpers';

const dashboardService = new DashboardService();

export class DashboardController {
  getKPIs = asyncHandler(async (req: Request, res: Response) => {
    const kpis = await dashboardService.getKPIs();
    res.json(formatApiResponse(kpis));
  });

  getActivity = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const activities = await dashboardService.getRecentActivity(limit);
    res.json(formatApiResponse(activities));
  });
}

export const dashboardController = new DashboardController();