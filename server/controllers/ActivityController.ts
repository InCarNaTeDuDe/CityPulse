import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ActivityService } from '../services/ActivityService.js';
import { createActivitySchema } from '../validators/schemas.js';

export class ActivityController {
  private activityService = new ActivityService();

  getActivities = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // If user is logged in, pass user to mark isJoined, else pass null
      const activities = await this.activityService.getActivities(req.user || null);
      res.json(activities);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  createActivity = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      // Zod validation
      const validation = createActivitySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const newActivity = await this.activityService.createActivity(req.user, validation.data);
      res.status(201).json({ ...newActivity, isJoined: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  joinActivity = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.params;

      const result = await this.activityService.toggleJoinActivity(req.user, id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
