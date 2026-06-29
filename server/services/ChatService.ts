import { ConversationRepository } from '../repositories/ConversationRepository.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { Conversation } from '../db/entities/Conversation.js';
import { User } from '../db/entities/User.js';

export class ChatService {
  private convoRepo = new ConversationRepository();
  private notificationRepo = new NotificationRepository();

  async getConversations(userId: string): Promise<Conversation[]> {
    return await this.convoRepo.findByUserId(userId);
  }

  async sendMessage(user: User, convoId: string, text: string): Promise<Conversation> {
    const conversation = await this.convoRepo.findOneBy(convoId, user.id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      text,
      time: 'Just now',
    };

    // Update own copy
    conversation.messages.push(newMsg);
    conversation.lastMessage = text;
    conversation.timestamp = 'Just now';
    conversation.unread = false;
    await this.convoRepo.save(conversation);

    // Sync partner's copy
    const partnerConvoId = convoId.endsWith('_seller') ? convoId.replace('_seller', '') : `${convoId}_seller`;
    const partnerConvo = await this.convoRepo.findOneBy(partnerConvoId, conversation.partnerId);
    
    if (partnerConvo) {
      partnerConvo.messages.push(newMsg);
      partnerConvo.lastMessage = text;
      partnerConvo.timestamp = 'Just now';
      partnerConvo.unread = true;
      await this.convoRepo.save(partnerConvo);

      // Push notification
      const chatNotif = this.notificationRepo.create({
        id: `not_msg_${Date.now()}`,
        text: `💬 ${user.name} sent a message: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
        type: 'chat',
        timestamp: 'Just now',
        read: false,
        userId: conversation.partnerId,
      });
      await this.notificationRepo.save(chatNotif);
    }

    return conversation;
  }

  async startConversation(
    user: User,
    data: { type: string; targetId: string; targetTitle: string; partnerId: string; partnerName: string; partnerAvatar: string; partnerRating: number }
  ): Promise<Conversation> {
    const convoId = `${data.type}_${data.targetId}_${user.id}`;
    let conversation = await this.convoRepo.findOneBy(convoId, user.id);

    if (!conversation) {
      // Create user copy
      conversation = this.convoRepo.create({
        id: convoId,
        type: data.type,
        targetId: data.targetId,
        targetTitle: data.targetTitle,
        partnerId: data.partnerId,
        partnerName: data.partnerName,
        partnerAvatar: data.partnerAvatar,
        partnerRating: Number(data.partnerRating || 4.8),
        lastMessage: `You started a connection about "${data.targetTitle}"`,
        timestamp: 'Just now',
        unread: false,
        userId: user.id,
        messages: [
          {
            id: `msg_start_${Date.now()}`,
            senderId: 'system',
            senderName: 'Escrow System',
            text: `👋 Chat started with ${data.partnerName}! Say hi and finalize your meetup.`,
            time: 'Just now',
            isSystem: true,
          }
        ]
      });
      await this.convoRepo.save(conversation);

      // Create partner copy
      const partnerConvo = this.convoRepo.create({
        id: convoId + '_seller',
        type: data.type,
        targetId: data.targetId,
        targetTitle: data.targetTitle,
        partnerId: user.id,
        partnerName: user.name,
        partnerAvatar: user.avatar,
        partnerRating: user.rating,
        lastMessage: `${user.name} started a connection about "${data.targetTitle}"`,
        timestamp: 'Just now',
        unread: true,
        userId: data.partnerId,
        messages: [
          {
            id: `msg_start_${Date.now()}`,
            senderId: 'system',
            senderName: 'Escrow System',
            text: `👋 Chat started with ${user.name}! Say hi and finalize your meetup.`,
            time: 'Just now',
            isSystem: true,
          }
        ]
      });
      await this.convoRepo.save(partnerConvo);
    }

    return conversation;
  }
}
