import { AppDataSource } from '../db/index.js';
import { NotificationItem } from '../db/entities/NotificationItem.js';

export class NotificationRepository {
  private repo = AppDataSource.getRepository(NotificationItem);

  async findByUserId(userId: string): Promise<NotificationItem[]> {
    return await this.repo.findBy({ userId });
  }

  async findOneBy(id: string, userId: string): Promise<NotificationItem | null> {
    return await this.repo.findOneBy({ id, userId });
  }

  async save(notif: NotificationItem): Promise<NotificationItem> {
    return await this.repo.save(notif);
  }

  async updateAllRead(userId: string): Promise<void> {
    await this.repo.update({ userId }, { read: true });
  }

  create(data: Partial<NotificationItem>): NotificationItem {
    return this.repo.create(data as any) as any as NotificationItem;
  }
}
