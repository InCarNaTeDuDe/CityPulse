import { AppDataSource } from '../db/index.js';
import { Ticket } from '../db/entities/Ticket.js';

export class TicketRepository {
  private repo = AppDataSource.getRepository(Ticket);

  async findAll(): Promise<Ticket[]> {
    return await this.repo.find();
  }

  async findById(id: string): Promise<Ticket | null> {
    return await this.repo.findOneBy({ id });
  }

  async save(ticket: Ticket): Promise<Ticket> {
    return await this.repo.save(ticket);
  }

  create(data: Partial<Ticket>): Ticket {
    return this.repo.create(data as any) as any as Ticket;
  }
}
