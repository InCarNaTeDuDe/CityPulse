import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { TicketService } from '../services/TicketService.js';
import { createTicketSchema } from '../validators/schemas.js';

export class TicketController {
  private ticketService = new TicketService();

  getTickets = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tickets = await this.ticketService.getTickets();
      res.json(tickets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  createTicket = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      // Zod validation
      const validation = createTicketSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const newTicket = await this.ticketService.createTicket(req.user, validation.data);
      res.status(201).json(newTicket);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  buyTicket = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.params;

      const result = await this.ticketService.buyTicket(req.user, id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
