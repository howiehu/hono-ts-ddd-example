import User from "../../models/User.js";
import type UserRepository from "../UserRepository.js";
import { type Drizzle } from "../../infrastructure/database/drizzle.js";
import { inject, injectable } from "inversify";
import { eq } from "drizzle-orm";

@injectable()
export default class UserRepositoryDB implements UserRepository {
  constructor(@inject(Symbol.for("Drizzle")) private readonly db: Drizzle) {}

  async findById(id: number): Promise<User | null> {
    const data = await this.db.query.usersTable.findFirst({
      where: (usersTable) => eq(usersTable.id, id),
    });
    return data ? new User(data.id, data.name, data.age, data.email) : null;
  }
}
