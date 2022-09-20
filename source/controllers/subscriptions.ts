import { NextFunction, Request, Response } from "express";
import { User } from "../../entites/user";
import { Permission } from "../../entites/permission";
import { Movie } from "../../entites/movie";
import { DataSource, Repository } from "typeorm";
import { Genre } from "../../entites/genre";
import { Subscription } from "../../entites/subscription";
import { Member } from "../../entites/member";

const NAMESPACE: string = "Movie";
let userRepository: Repository<User>;
let permissionRepository: Repository<Permission>;
let movieRepository: Repository<Movie>;
let genreRepository: Repository<Genre>;
let subscriptionRepository: Repository<Subscription>;
let memberRepository: Repository<Member>;

const initializeRepository = (myDataSource: DataSource) => {
  userRepository = myDataSource.getRepository(User);
  permissionRepository = myDataSource.getRepository(Permission);
  movieRepository = myDataSource.getRepository(Movie);
  genreRepository = myDataSource.getRepository(Genre);
  subscriptionRepository = myDataSource.getRepository(Subscription);
  memberRepository = myDataSource.getRepository(Member);
};

const addMember = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, city } = req.body;
  try {
    const usernameLogin = res.locals.jwt.username;
    const userFromDB: User = (await userRepository.findOne({
      where: { userName: usernameLogin },
      relations: ["permission"],
    })) as User;
    if (
      userFromDB.permission
        ?.map((permission) => permission.name)
        .includes("Create Subscriptions") ||
      usernameLogin === "admin"
    ) {
      const member = new Member();
      member.name = name;
      member.city = city;
      member.email = email;
      const newMember: Member = await memberRepository.save(member);
      return res.status(200).send(newMember);
    } else {
      return res
        .status(200)
        .send("this user is Unauthorized to do this action");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

const updateMember = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id, name, email, city } = req.body;
  try {
    const usernameLogin = res.locals.jwt.username;
    const userFromDB: User = (await userRepository.findOne({
      where: { userName: usernameLogin },
      relations: ["permission"],
    })) as User;
    if (
      userFromDB.permission
        ?.map((permission) => permission.name)
        .includes("Create Subscriptions") ||
      usernameLogin === "admin"
    ) {
      const memberToUpdate = (await memberRepository.findOne({
        where: { id: id },
      })) as Member;
      if (memberToUpdate) {
        memberToUpdate.name = name;
        memberToUpdate.city = city;
        memberToUpdate.email = email;
        const updatedMember: Member = await memberRepository.save(
          memberToUpdate
        );
        return res.status(200).send(updatedMember);
      } else {
        return res.status(400).send("member not found");
      }
    } else {
      return res
        .status(200)
        .send("this user is Unauthorized to do this action");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

export default {
  initializeRepository,
  addMember,
  updateMember,
};
