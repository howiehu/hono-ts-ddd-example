import { Container } from "inversify";
import { db } from "./domain/infrastructure/database/drizzle.js";
import type { Drizzle } from "./domain/infrastructure/database/drizzle.js";
import UserRepositoryDB from "./domain/repositories/impl/UserRepositoryDB.js";
import type UserRepository from "./domain/repositories/UserRepository.js";


export function createDIContainer(options?: {testDb?: Drizzle}): Container {
  const container = new Container();
  
  registerInfrastructure(container, options);
  
  registerRepositories(container);
  
  return container;
}

const diContainer: Container = createDIContainer();

export default diContainer;

function registerInfrastructure(container: Container, options?: {testDb?: Drizzle}) {
  container.bind<Drizzle>(Symbol.for("Drizzle")).toConstantValue(options?.testDb || db);
}

function registerRepositories(container: Container) {
  container.bind<UserRepository>(Symbol.for("UserRepository")).to(UserRepositoryDB).inSingletonScope();
}

