import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ChatService } from '../services/ChatService.js';
import { sendMessageSchema, startConversationSchema } from '../validators/schemas.js';

export class ChatController {
  private chatService = new ChatService();

  getConversations = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const conversations = await this.chatService.getConversations(req.user.id);
      res.json(conversations);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      const { id } = req.params;

      // Zod validation
      const validation = sendMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const updatedConvo = await this.chatService.sendMessage(req.user, id, validation.data.text);
      res.json(updatedConvo);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

  startConversation = async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

      // Zod validation
      const validation = startConversationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const convo = await this.chatService.startConversation(req.user, validation.data as any);
      res.json(convo);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
