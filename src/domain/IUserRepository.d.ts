import User from "./User.ts";

export default interface IUserRepository {
  findUserById(id: number): Promise<User | null>;
}
