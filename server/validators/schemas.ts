import { z } from 'zod';

export const walletTopUpSchema = z.object({
  amount: z.number().positive('Top-up amount must be positive'),
});

export const createActivitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  peopleNeeded: z.coerce.number().int().positive('Must require at least 1 person'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
});

export const createTicketSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  category: z.string().min(1, 'Category is required'),
  originalPrice: z.coerce.number().positive('Original price must be positive'),
  sellingPrice: z.coerce.number().positive('Selling price must be positive'),
  quantity: z.coerce.number().int().positive('Quantity must be at least 1'),
  location: z.string().min(1, 'Location is required'),
});

export const sendMessageSchema = z.object({
  text: z.string().min(1, 'Message text cannot be empty'),
});

export const startConversationSchema = z.object({
  type: z.string().min(1, 'Conversation type is required'),
  targetId: z.string().min(1, 'Target ID is required'),
  targetTitle: z.string().min(1, 'Target Title is required'),
  partnerId: z.string().min(1, 'Partner ID is required'),
  partnerName: z.string().min(1, 'Partner Name is required'),
  partnerAvatar: z.string().optional(),
  partnerRating: z.coerce.number().optional(),
});
