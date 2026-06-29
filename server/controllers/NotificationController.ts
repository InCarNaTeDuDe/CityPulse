import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/NotificationService.js';

export class NotificationController {
  private notificationService = new NotificationService();

  getNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const notifications = await this.notificationService.getNotifications(req.user.id);
      res.json(notifications);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  markAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.params;

      const success = await this.notificationService.markAsRead(req.user.id, id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      await this.notificationService.markAllAsRead(req.user.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
