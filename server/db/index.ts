import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
import { Activity } from "./entities/Activity.js";
import { Ticket } from "./entities/Ticket.js";
import { Conversation } from "./entities/Conversation.js";
import { NotificationItem } from "./entities/NotificationItem.js";
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "",
  synchronize: true,
  logging: false,
  entities: [User, Activity, Ticket, Conversation, NotificationItem],
  ssl: { rejectUnauthorized: false },
} as any);

export async function initializeDatabase() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log(`TypeORM Data Source has been initialized using PostgreSQL!`);
    await seedInitialData();
  }
}

async function seedInitialData() {
  const activityRepo = AppDataSource.getRepository(Activity);
  const ticketRepo = AppDataSource.getRepository(Ticket);

  // Clear existing to ensure we don't have multiple records
  await activityRepo.clear();
  await ticketRepo.clear();

  console.log("Clean slate: 0 initial activities and tickets.");
}

export async function seedUserIfMissing(
  userId: string,
  name: string,
  email: string,
) {
  const userRepo = AppDataSource.getRepository(User);

  const isUUID = (str: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  let exists: User | null = null;
  if (isUUID(userId)) {
    exists = await userRepo.findOneBy({ id: userId });
  } else if (userId.startsWith("google_")) {
    if (email) {
      exists = await userRepo.findOneBy({ email });
    }
  } else if (userId.startsWith("phone_")) {
    const phoneNum = userId.replace("phone_", "");
    if (phoneNum) {
      exists = await userRepo.findOneBy({ phone: phoneNum });
    }
  }

  if (!exists) {
    let phone: string | undefined = undefined;
    if (userId.startsWith("phone_")) {
      phone = userId.replace("phone_", "");
    }
    const userToCreate: Partial<User> = {
      name,
      email: email && email !== "guest@example.com" ? email : undefined,
      phone,
      activitiesJoinedCount: 0,
      ticketsSoldCount: 0,
      ticketsBoughtCount: 0,
      identityVerified: true,
      walletBalance: 500,
    };

    if (isUUID(userId)) {
      userToCreate.id = userId;
    }

    const freshUser = userRepo.create(userToCreate as any);
    await userRepo.save(freshUser);
    console.log(`Seeded fresh user with clean slate: ${name} (${email})`);
  }
}
