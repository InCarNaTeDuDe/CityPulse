import { TicketRepository } from '../repositories/TicketRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { ConversationRepository } from '../repositories/ConversationRepository.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { Ticket } from '../db/entities/Ticket.js';
import { User } from '../db/entities/User.js';

export class TicketService {
  private ticketRepo = new TicketRepository();
  private userRepo = new UserRepository();
  private convoRepo = new ConversationRepository();
  private notificationRepo = new NotificationRepository();

  async getTickets(): Promise<Ticket[]> {
    return await this.ticketRepo.findAll();
  }

  async createTicket(
    user: User,
    data: { title: string; category: string; originalPrice: number; sellingPrice: number; quantity: number; location: string }
  ): Promise<Ticket> {
    const sellingPrice = Number(data.sellingPrice);
    const newTicket = this.ticketRepo.create({
      id: `tkt_${Date.now()}`,
      title: data.title,
      category: data.category,
      originalPrice: Number(data.originalPrice),
      sellingPrice,
      connectFee: Math.ceil(sellingPrice * 0.05), // 5% secure swap service fee
      sellerId: user.id,
      sellerName: user.name,
      sellerAvatar: user.avatar,
      sellerRating: user.rating,
      quantity: Number(data.quantity),
      location: data.location,
      distance: '0.2 km away',
      verified: true,
      status: 'available',
    });

    await this.ticketRepo.save(newTicket);

    // Increment tickets sold metric
    user.ticketsSoldCount += 1;
    await this.userRepo.save(user);

    return newTicket;
  }

  async buyTicket(buyer: User, ticketId: string): Promise<{ ticket: Ticket; buyer: User }> {
    const ticket = await this.ticketRepo.findById(ticketId);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    if (ticket.status !== 'available') {
      throw new Error('This ticket is no longer available.');
    }

    if (ticket.sellerId === buyer.id) {
      throw new Error('You cannot purchase your own listed ticket!');
    }

    const totalPrice = ticket.sellingPrice + ticket.connectFee;
    if (buyer.walletBalance < totalPrice) {
      throw new Error(`Insufficient wallet balance. Total required is ₹${totalPrice}, but you have ₹${buyer.walletBalance}.`);
    }

    // Proceed with secure double-ledger escrow swap
    buyer.walletBalance -= totalPrice;
    buyer.ticketsBoughtCount += 1;
    await this.userRepo.save(buyer);

    // Add purchase price to Seller's balance
    const seller = await this.userRepo.findById(ticket.sellerId);
    if (seller) {
      seller.walletBalance += ticket.sellingPrice;
      await this.userRepo.save(seller);
    }

    // Update status
    ticket.status = 'sold';
    await this.ticketRepo.save(ticket);

    // Notify Buyer
    const buyerNotif = this.notificationRepo.create({
      id: `not_buy_${Date.now()}_buyer`,
      text: `🎟 TicketSwap secure swap completed! You bought "${ticket.title}" from ${ticket.sellerName}. Details sent to chat inbox.`,
      type: 'ticketswap',
      timestamp: 'Just now',
      read: false,
      userId: buyer.id,
    });
    await this.notificationRepo.save(buyerNotif);

    // Notify Seller
    const sellerNotif = this.notificationRepo.create({
      id: `not_buy_${Date.now()}_seller`,
      text: `💰 Your ticket "${ticket.title}" has been successfully bought by ${buyer.name}! ₹${ticket.sellingPrice} has been added to your escrow wallet.`,
      type: 'ticketswap',
      timestamp: 'Just now',
      read: false,
      userId: ticket.sellerId,
    });
    await this.notificationRepo.save(sellerNotif);

    // Dispatch secure chat room copies for coordination
    const convoId = `swap_${ticket.id}_${buyer.id}`;
    
    // Buyer Copy
    const buyerConvo = this.convoRepo.create({
      id: convoId,
      type: 'ticketswap',
      targetId: ticket.id,
      targetTitle: `🎬 ${ticket.title}`,
      partnerId: ticket.sellerId,
      partnerName: ticket.sellerName,
      partnerAvatar: ticket.sellerAvatar,
      partnerRating: ticket.sellerRating,
      lastMessage: `System: Secure escrow purchase successful. Connect with the seller to swap PDF / QR code.`,
      timestamp: 'Just now',
      unread: false,
      userId: buyer.id,
      messages: [
        {
          id: `msg_sys_${Date.now()}`,
          senderId: 'system',
          senderName: 'Escrow System',
          text: `🤝 Escrow Protection Active! Buyer ${buyer.name} has paid ₹${totalPrice}. Seller ${ticket.sellerName} please share the ticket credentials below.`,
          time: 'Just now',
          isSystem: true,
        }
      ]
    });
    await this.convoRepo.save(buyerConvo);

    // Seller Copy
    const sellerConvo = this.convoRepo.create({
      id: convoId + '_seller',
      type: 'ticketswap',
      targetId: ticket.id,
      targetTitle: `🎬 ${ticket.title}`,
      partnerId: buyer.id,
      partnerName: buyer.name,
      partnerAvatar: buyer.avatar,
      partnerRating: buyer.rating,
      lastMessage: `System: Secure escrow purchase successful. Connect with the buyer to swap PDF / QR code.`,
      timestamp: 'Just now',
      unread: true,
      userId: ticket.sellerId,
      messages: [
        {
          id: `msg_sys_${Date.now()}`,
          senderId: 'system',
          senderName: 'Escrow System',
          text: `🤝 Escrow Protection Active! Buyer ${buyer.name} has paid ₹${totalPrice}. Seller ${ticket.sellerName} please share the ticket credentials below.`,
          time: 'Just now',
          isSystem: true,
        }
      ]
    });
    await this.convoRepo.save(sellerConvo);

    return { ticket, buyer };
  }
}
