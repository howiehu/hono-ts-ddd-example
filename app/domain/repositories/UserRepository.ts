import type User from "../models/User.js";

export default interface UserRepository {
  findById(id: number): Promise<User | null>;
}
