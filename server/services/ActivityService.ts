import { ActivityRepository } from '../repositories/ActivityRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { NotificationRepository } from '../repositories/NotificationRepository.js';
import { Activity } from '../db/entities/Activity.js';
import { User } from '../db/entities/User.js';

export class ActivityService {
  private activityRepo = new ActivityRepository();
  private userRepo = new UserRepository();
  private notificationRepo = new NotificationRepository();

  async getActivities(user: User | null): Promise<any[]> {
    const activities = await this.activityRepo.findAll();
    return activities.map((act) => {
      const isJoined = user ? act.joinedUsers.some((u) => u.id === user.id) : false;
      return { ...act, isJoined };
    });
  }

  async createActivity(
    user: User,
    data: { title: string; category: string; description: string; peopleNeeded: number; time: string; location: string }
  ): Promise<Activity> {
    const newActivity = this.activityRepo.create({
      id: `act_${Date.now()}`,
      title: data.title,
      category: data.category,
      description: data.description,
      creatorId: user.id,
      creatorName: user.name,
      creatorAvatar: user.avatar,
      creatorRating: user.rating,
      peopleJoined: 1,
      peopleNeeded: Number(data.peopleNeeded),
      joinedUsers: [{ id: user.id, name: user.name, avatar: user.avatar }],
      time: data.time,
      location: data.location,
      distance: '0.1 km away',
    });

    await this.activityRepo.save(newActivity);

    // Update user stats
    user.activitiesJoinedCount += 1;
    await this.userRepo.save(user);

    return newActivity;
  }

  async toggleJoinActivity(user: User, activityId: string): Promise<any> {
    const activity = await this.activityRepo.findById(activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    const isAlreadyJoined = activity.joinedUsers.some((u) => u.id === user.id);

    if (isAlreadyJoined) {
      // Leave
      if (activity.creatorId === user.id) {
        throw new Error('As creator, you cannot leave your own meetup post.');
      }
      activity.joinedUsers = activity.joinedUsers.filter((u) => u.id !== user.id);
      activity.peopleJoined = Math.max(1, activity.peopleJoined - 1);
      user.activitiesJoinedCount = Math.max(0, user.activitiesJoinedCount - 1);
    } else {
      // Join
      if (activity.peopleJoined >= activity.peopleNeeded) {
        throw new Error('This activity is already full!');
      }
      activity.joinedUsers.push({ id: user.id, name: user.name, avatar: user.avatar });
      activity.peopleJoined += 1;
      user.activitiesJoinedCount += 1;

      // Notify host/creator
      const joinNotif = this.notificationRepo.create({
        id: `not_join_${Date.now()}`,
        text: `👥 ${user.name} joined your meetup activity "${activity.title}".`,
        type: 'daymate',
        timestamp: 'Just now',
        read: false,
        userId: activity.creatorId,
      });
      await this.notificationRepo.save(joinNotif);
    }

    await this.activityRepo.save(activity);
    await this.userRepo.save(user);

    return { ...activity, isJoined: !isAlreadyJoined };
  }
}
