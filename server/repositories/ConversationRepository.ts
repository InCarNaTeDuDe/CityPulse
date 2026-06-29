import { AppDataSource } from '../db/index.js';
import { Conversation } from '../db/entities/Conversation.js';

export class ConversationRepository {
  private repo = AppDataSource.getRepository(Conversation);

  async findByUserId(userId: string): Promise<Conversation[]> {
    return await this.repo.findBy({ userId });
  }

  async findOneBy(id: string, userId: string): Promise<Conversation | null> {
    return await this.repo.findOneBy({ id, userId });
  }

  async save(convo: Conversation): Promise<Conversation> {
    return await this.repo.save(convo);
  }

  create(data: Partial<Conversation>): Conversation {
    return this.repo.create(data as any) as any as Conversation;
  }
}
