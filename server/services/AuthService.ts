import { UserRepository } from '../repositories/UserRepository.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { User } from '../db/entities/User.js';

export class AuthService {
  private userRepo = new UserRepository();
  private notificationRepo = new NotificationRepository();

  async getOrCreateProfile(userId: string, name: string, email: string, avatar?: string): Promise<User> {
    await this.userRepo.seedUserIfMissing(userId, name, email);
    
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    let user: User | null = null;
    
    if (isUUID(userId)) {
      user = await this.userRepo.findById(userId);
    } else if (userId.startsWith('google_') && email) {
      user = await this.userRepo.findByEmail(email);
    } else if (userId.startsWith('phone_')) {
      const phoneNum = userId.replace('phone_', '');
      if (phoneNum) {
        user = await this.userRepo.findByPhone(phoneNum);
      }
    }
    
    if (!user) {
      throw new Error('User profiles initialization failed');
    }

    if (avatar && (!user.avatar || user.avatar.includes('unsplash.com'))) {
      user.avatar = avatar;
    }

    user.lastLogin = new Date();
    user = await this.userRepo.save(user);
    return user;
  }

  async topUpWallet(userId: string, name: string, email: string, amount: number): Promise<User> {
    const user = await this.getOrCreateProfile(userId, name, email);
    user.walletBalance += amount;
    const updated = await this.userRepo.save(user);

    // Write a system log/notification
    const notif = this.notificationRepo.create({
      id: `not_topup_${Date.now()}`,
      text: `💰 Successfully topped up ₹${amount} into your wallet.`,
      type: 'payment',
      timestamp: 'Just now',
      read: false,
      userId,
    });
    await this.notificationRepo.save(notif);

    return updated;
  }

  async updateAvatar(userId: string, name: string, email: string, imageUrl: string): Promise<User> {
    const user = await this.getOrCreateProfile(userId, name, email);
    user.avatar = imageUrl;
    const updated = await this.userRepo.save(user);

    const notif = this.notificationRepo.create({
      id: `not_avatar_${Date.now()}`,
      text: `👤 Profile picture uploaded and updated successfully!`,
      type: 'activity',
      timestamp: 'Just now',
      read: false,
      userId,
    });
    await this.notificationRepo.save(notif);

    return updated;
  }
}
