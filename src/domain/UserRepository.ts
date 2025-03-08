import type IUserRepository from "./IUserRepository.js";
import User from "./User.js";
import Database from "./Database.js";
import { inject, injectable } from "inversify";
import { eq } from "drizzle-orm";

@injectable()
export default class UserRepository implements IUserRepository {
  constructor(@inject(Database) private readonly db: Database) {}

  async findUserById(id: number): Promise<User | null> {
    const data = await this.db.getInstance().query.usersTable.findFirst({
      where: (usersTable) => eq(usersTable.id, id),
    });
    return data ? new User(data.id, data.name, data.age, data.email) : null;
  }
}
