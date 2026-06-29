import { AppDataSource } from '../db/index.js';
import { Activity } from '../db/entities/Activity.js';

export class ActivityRepository {
  private repo = AppDataSource.getRepository(Activity);

  async findAll(): Promise<Activity[]> {
    return await this.repo.find();
  }

  async findById(id: string): Promise<Activity | null> {
    return await this.repo.findOneBy({ id });
  }

  async save(activity: Activity): Promise<Activity> {
    return await this.repo.save(activity);
  }

  create(data: Partial<Activity>): Activity {
    return this.repo.create(data as any) as any as Activity;
  }
}
