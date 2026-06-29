import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { AuthController } from '../controllers/AuthController.js';
import { ActivityController } from '../controllers/ActivityController.js';
import { TicketController } from '../controllers/TicketController.js';
import { ChatController } from '../controllers/ChatController.js';
import { NotificationController } from '../controllers/NotificationController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Controllers instantiation
const authController = new AuthController();
const activityController = new ActivityController();
const ticketController = new TicketController();
const chatController = new ChatController();
const notificationController = new NotificationController();

// 1. Auth Routes
router.get('/auth/me', requireAuth, authController.getMe);
router.post('/wallet/topup', requireAuth, authController.topUpWallet);
router.post('/auth/upload-avatar', requireAuth, upload.single('avatar'), authController.uploadAvatar);

// 2. Meetup Activities Routes
router.get('/activities', requireAuth, activityController.getActivities);
router.post('/activities', requireAuth, activityController.createActivity);
router.post('/activities/:id/join', requireAuth, activityController.joinActivity);

// 3. Ticket Swap Routes
router.get('/tickets', requireAuth, ticketController.getTickets);
router.post('/tickets', requireAuth, ticketController.createTicket);
router.post('/tickets/:id/buy', requireAuth, ticketController.buyTicket);

// 4. Secure Escrow Chat Inbox Routes
router.get('/conversations', requireAuth, chatController.getConversations);
router.post('/conversations/start', requireAuth, chatController.startConversation);
router.post('/conversations/:id/messages', requireAuth, chatController.sendMessage);

// 5. System Notifications Routes
router.get('/notifications', requireAuth, notificationController.getNotifications);
router.post('/notifications/read-all', requireAuth, notificationController.markAllAsRead);
router.post('/notifications/:id/read', requireAuth, notificationController.markAsRead);

export default router;
