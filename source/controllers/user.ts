import { NextFunction, Request, Response } from "express";
import logging from "../config/logging";
import bcryptjs from "bcryptjs";
import { User } from "../../entites/user";
import { Permission } from "../../entites/permission";
import myDataSource from "../config/dbConnection";
import { DataSource, Repository } from "typeorm";
import signJWT from "../../functions/signJWT";

const NAMESPACE: string = "User";
let userRepository: Repository<User>;
let permissionRepository: Repository<Permission>;

const initializeRepository = (myDataSource: DataSource) => {
  userRepository = myDataSource.getRepository(User);
  permissionRepository = myDataSource.getRepository(Permission);
};

const validateToken = (req: Request, res: Response, next: NextFunction) => {
  logging.info(NAMESPACE, "Token validated, user authorized.");

  return res.status(200).json({
    message: "Token(s) validated",
  });
};

const register = (req: Request, res: Response, next: NextFunction) => {
  const { username, password, firstName, lastName, permissions } = req.body;

  bcryptjs.hash(password, 10, async (hashError, hash) => {
    if (hashError) {
      return res.status(401).json({
        message: hashError.message,
        error: hashError,
      });
    }
    try {
      const user: User = new User();
      const permissionArray: string[] = permissions;
      const permissionsOfUser: Permission[] = [];
      for (const permission of permissionArray) {
        const permissionFromDB = (await permissionRepository.findOne({
          where: { name: permission },
        })) as Permission;
        permissionsOfUser.push(permissionFromDB);
      }
      user.firstName = firstName;
      user.lastName = lastName;
      user.password = hash;
      user.userName = username;
      user.permission = permissionsOfUser;
      const userFromDB = (await userRepository.findOne({
        where: { userName: username },
      })) as User;
      if (!userFromDB) {
        const newUser: User = await userRepository.save(user);
        return res.status(200).send(newUser);
      } else {
        return res.status(500).send("username exists already in the system");
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  let { username, password } = req.body;

  const currentUser = (await userRepository.findOne({
    where: { userName: username },
  })) as User;
  if (!currentUser) {
    return res.status(400).send("user not found");
  }

  bcryptjs.compare(password, currentUser.password!, (error, result) => {
    if (error) {
      return res.status(401).json({
        message: "Password Mismatch",
      });
    } else if (result) {
      signJWT(currentUser, (_error, token) => {
        if (_error) {
          return res.status(401).json({
            message: "Unable to Sign JWT",
            error: _error,
          });
        } else if (token) {
          return res.status(200).json({
            message: "Auth Successful",
            token,
            user: currentUser,
          });
        }
      });
    }
  });
};

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allUsers: User[] = (await userRepository.find({
      relations: ["permission"],
    })) as User[];
    return res.status(200).send(allUsers);
  } catch (error) {
    return res.status(500).send(error);
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.body;
  const usernameLogin = res.locals.jwt.username;
  if (usernameLogin === "admin") {
    try {
      const userFromDB: User = (await userRepository.findOne({
        where: { userName: username },
      })) as User;
      if (userFromDB) {
        await userRepository.remove(userFromDB);
      } else {
        return res.status(400).send("user not found");
      }
      return res.status(200).send("user was deleted");
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    return res.status(200).send("this user is Unauthorized to do this action");
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id, username, firstName, lastName, permissions } = req.body;
  const usernameLogin = res.locals.jwt.username;
  if (usernameLogin === "admin") {
    try {
      const userToUpdate: User = (await userRepository.findOne({
        where: { id: id },
      })) as User;
      if (userToUpdate) {
        const permissionArray: string[] = permissions;
        const permissionsOfUser: Permission[] = [];
        for (const permission of permissionArray) {
          const permissionFromDB = (await permissionRepository.findOne({
            where: { name: permission },
          })) as Permission;
          permissionsOfUser.push(permissionFromDB);
        }
        userToUpdate.firstName = firstName;
        userToUpdate.lastName = lastName;
        userToUpdate.userName = username;
        userToUpdate.permission = permissionsOfUser;
        const updatedUser: User = await userRepository.save(userToUpdate);
        return res.status(200).send(updatedUser);
      } else {
        return res.status(400).send("user not found");
      }
    } catch (error) {
      return res.status(500).send(error);
    }
  } else {
    return res.status(200).send("this user is Unauthorized to do this action");
  }
};
export default {
  validateToken,
  register,
  login,
  getAllUsers,
  initializeRepository,
  deleteUser,
  updateUser,
};
