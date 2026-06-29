import { AppDataSource, seedUserIfMissing } from '../db/index.js';
import { User } from '../db/entities/User.js';

export class UserRepository {
  private repo = AppDataSource.getRepository(User);

  async findById(id: string): Promise<User | null> {
    const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
    if (!isUUID(id)) {
      return null;
    }
    return await this.repo.findOneBy({ id });
  }

  async save(user: User): Promise<User> {
    return await this.repo.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repo.findOneBy({ email });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.repo.findOneBy({ phone });
  }

  async seedUserIfMissing(id: string, name: string, email: string): Promise<void> {
    await seedUserIfMissing(id, name, email);
  }
}
