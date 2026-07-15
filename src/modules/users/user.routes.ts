import { Router } from "../../core/Router.js";
import { UserController } from "./UserController.js";
import { UserRepository } from "./UserRepository.js";
import { UserService } from "./UserService.js";

export function registerUserRoutes(router: Router): void {
  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  router.get("/users", userController.getUsers);
  router.get("/users/:id", userController.getUserById);
  router.post("/users", userController.createUser);
  router.patch("/users/:id", userController.updateUser);
  router.delete("/users/:id", userController.deleteUser);
}