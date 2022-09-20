import externalDA, { MemberAPI, MovieAPI } from "../dataAccess/externalDA";
import { DataSource, Repository } from "typeorm";
import { Member } from "../entites/member";
import { Movie } from "../entites/movie";
import { Genre } from "../entites/genre";
import { Subscription } from "../entites/subscription";
import { Permission } from "../entites/permission";
import { User } from "../entites/user";
import myDataSource from "../source/config/dbConnection";
import bcryptjs from "bcryptjs";

import dotenv from "dotenv";

dotenv.config();

let memberRepository: Repository<Member>;
let permissionRepository: Repository<Permission>;
let movieRepository: Repository<Movie>;
let genreRepository: Repository<Genre>;
let subscriptionRepository: Repository<Subscription>;
let userRepository: Repository<User>;

const populateMemberTable = async (myDataSource: DataSource): Promise<void> => {
  memberRepository = myDataSource.getRepository(Member);
  try {
    let membersArray = await externalDA.getMembers();
    Promise.all(
      membersArray.map((member) =>
        memberRepository
          .createQueryBuilder()
          .insert()
          .into(Member)
          .values({
            name: member.name,
            email: member.email,
            city: member.address.city,
          })
          .orIgnore()
          .execute()
      )
    );
  } catch (error) {
    throw "error populating members table";
  }
};

const populateMoviesTable = async (myDataSource: DataSource) => {
  movieRepository = myDataSource.getRepository(Movie);
  try {
    const moviesArray = await externalDA.getMoviesAndGanres();

    const moviesWithGenres = [];
    for (const movie of moviesArray) {
      const newMovie = new Movie();
      const genresArray: Genre[] = [];
      const movieFromDB = (await movieRepository.findOne({
        where: { name: movie.name },
      })) as Movie;
      if (!movieFromDB) {
        for (const genre of movie.genres) {
          const genreFromDB = (await genreRepository.findOne({
            where: { name: genre },
          })) as Genre;
          genresArray.push(genreFromDB);
        }
        newMovie.name = movie.name;
        newMovie.image = movie.url;
        newMovie.premiered = movie.premiered;
        newMovie.genre = genresArray;

        // moviesWithGenres.push(await movieRepository.save(newMovie));
        await movieRepository.save(newMovie);
      }
    }
    //return Promise.all(moviesWithGenres);
  } catch (error) {
    throw "error populating movies table";
  }
};

const populateGenresTable = async (myDataSource: DataSource): Promise<void> => {
  genreRepository = myDataSource.getRepository(Genre);
  try {
    const moviesArray = await externalDA.getMoviesAndGanres();
    Promise.all(
      moviesArray.map((movie) =>
        movie.genres.map((genre) =>
          genreRepository
            .createQueryBuilder()
            .insert()
            .into(Genre)
            .values({ name: genre })
            .orIgnore()
            .execute()
        )
      )
    );
  } catch (error) {
    throw "error populating genres table";
  }
};

const populatePermissionsTable = async (
  myDataSource: DataSource
): Promise<void> => {
  permissionRepository = myDataSource.getRepository(Permission);
  try {
    const permissionsArray: string[] = [
      "View Subscriptions",
      "Create Subscriptions",
      "Delete Subscriptions",
      "View Movies",
      "Create Movies",
      "Delete Movies",
    ];
    Promise.all(
      permissionsArray.map((permission) => {
        permissionRepository
          .createQueryBuilder()
          .insert()
          .into(Permission)
          .values({ name: permission })
          .orIgnore()
          .execute();
      })
    );
  } catch (error) {
    console.log(error);
    throw "error populating permissions table";
  }
};

const createAdminIfNotExists = async (
  myDataSource: DataSource
): Promise<void> => {
  userRepository = myDataSource.getRepository(User);
  try {
    const admin = (await userRepository.findOne({
      where: { userName: "admin" },
    })) as User;

    if (!admin) {
      bcryptjs.hash(process.env.PASS as string, 10, async (hashError, hash) => {
        if (hashError) {
          throw hashError.message;
        }
        try {
          const userAdmin: User = new User();
          userAdmin.userName = "admin";
          userAdmin.password = hash;
          userAdmin.firstName = "";
          userAdmin.lastName = "";
          const adminDB: User = await userRepository.save(userAdmin);
        } catch (error) {
          throw error;
        }
      });
    }
  } catch (error) {
    throw "error creating admin";
  }
};
export default {
  populateMemberTable,
  populateMoviesTable,
  populateGenresTable,
  populatePermissionsTable,
  createAdminIfNotExists,
};
