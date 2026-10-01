import type { Request, Response } from 'express';
import { sweepRestockAlerts } from '../../../restock';

export default async function handler(req: Request, res: Response): Promise<void> {
  await sweepRestockAlerts(req, res);
}
