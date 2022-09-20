import { DataSource } from "typeorm";
import { Genre } from "../../entites/genre";
import { Movie } from "../../entites/movie";
import { Member } from "../../entites/member";
import { Subscription } from "../../entites/subscription";
import { User } from "../../entites/user";
import { Permission } from "../../entites/permission";
import subscription_service from "../../services/subscription_service";
import userController from "../controllers/user";
import movieController from "../controllers/movie";
import subscriptionController from "../controllers/subscriptions";

const connectToDB = async (): Promise<DataSource> => {
  const myDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "1234",
    database: "subscriptions",
    synchronize: true,
    logging: true,
    entities: [Genre, Movie, Member, Subscription, User, Permission],
    subscribers: [],
    migrations: [],
  });
  try {
    await myDataSource.initialize();
    console.log("Database connected");
  } catch (error) {
    console.log(error);
  }
  return myDataSource;
};

const initializeDB = async () => {
  const myDataSource = await connectToDB();
  await subscription_service.populateMemberTable(myDataSource);
  await subscription_service.populateGenresTable(myDataSource);
  await subscription_service.populateMoviesTable(myDataSource);
  await subscription_service.populatePermissionsTable(myDataSource);
  await userController.initializeRepository(myDataSource);
  await movieController.initializeRepository(myDataSource);
  await subscriptionController.initializeRepository(myDataSource);
  await subscription_service.createAdminIfNotExists(myDataSource);
};

// const myDataSource = connectToDB();
export default initializeDB;
