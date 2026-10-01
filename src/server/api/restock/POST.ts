import type { Request, Response } from 'express';
import { createRestockAlert } from '../../restock';

export default async function handler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  await createRestockAlert(req, res);
}
