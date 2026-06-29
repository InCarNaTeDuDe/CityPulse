import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { NotificationItem } from '../db/entities/NotificationItem.js';

export class NotificationService {
  private notificationRepo = new NotificationRepository();

  async getNotifications(userId: string): Promise<NotificationItem[]> {
    return await this.notificationRepo.findByUserId(userId);
  }

  async markAsRead(userId: string, id: string): Promise<boolean> {
    const notif = await this.notificationRepo.findOneBy(id, userId);
    if (notif) {
      notif.read = true;
      await this.notificationRepo.save(notif);
      return true;
    }
    return false;
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.updateAllRead(userId);
  }
}
