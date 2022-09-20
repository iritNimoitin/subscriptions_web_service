import { NextFunction, Request, Response } from "express";
import { User } from "../../entites/user";
import { Permission } from "../../entites/permission";
import { Movie } from "../../entites/movie";
import { DataSource, Repository } from "typeorm";
import { Genre } from "../../entites/genre";

const NAMESPACE: string = "Movie";
let userRepository: Repository<User>;
let permissionRepository: Repository<Permission>;
let movieRepository: Repository<Movie>;
let genreRepository: Repository<Genre>;

const initializeRepository = (myDataSource: DataSource) => {
  userRepository = myDataSource.getRepository(User);
  permissionRepository = myDataSource.getRepository(Permission);
  movieRepository = myDataSource.getRepository(Movie);
  genreRepository = myDataSource.getRepository(Genre);
};

const getAllMovies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const usernameLogin = res.locals.jwt.username;
    const userFromDB: User = (await userRepository.findOne({
      where: { userName: usernameLogin },
      relations: ["permission"],
    })) as User;
    if (
      userFromDB.permission
        ?.map((permission) => permission.name)
        .includes("View Movies") ||
      usernameLogin === "admin"
    ) {
      const allMovies: Movie[] = (await movieRepository.find({
        relations: ["genre"],
      })) as Movie[];
      return res.status(200).send(allMovies);
    } else {
      return res
        .status(200)
        .send("this user is Unauthorized to do this action");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

const addMovie = async (req: Request, res: Response, next: NextFunction) => {
  const { name, image, premiered, genres } = req.body;
  try {
    const usernameLogin = res.locals.jwt.username;
    const userFromDB: User = (await userRepository.findOne({
      where: { userName: usernameLogin },
      relations: ["permission"],
    })) as User;
    if (
      userFromDB.permission
        ?.map((permission) => permission.name)
        .includes("Create Movies") ||
      usernameLogin === "admin"
    ) {
      const genresArray: string[] = genres;
      const genresOfMovie: Genre[] = [];
      for (const genre of genresArray) {
        const genreFromDB = (await genreRepository.findOne({
          where: { name: genre },
        })) as Genre;
        genresOfMovie.push(genreFromDB);
      }
      const movie = new Movie();
      movie.name = name;
      movie.image = image;
      movie.premiered = premiered;
      movie.genre = genresOfMovie;
      const newMovie: Movie = await movieRepository.save(movie);
      return res.status(200).send(newMovie);
    } else {
      return res
        .status(200)
        .send("this user is Unauthorized to do this action");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

const deleteMovie = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.body;
  try {
    const usernameLogin = res.locals.jwt.username;
    const userFromDB: User = (await userRepository.findOne({
      where: { userName: usernameLogin },
      relations: ["permission"],
    })) as User;
    if (
      userFromDB.permission
        ?.map((permission) => permission.name)
        .includes("Delete Movies") ||
      usernameLogin === "admin"
    ) {
      const movieFromDB: Movie = (await movieRepository.findOne({
        where: { id: id },
      })) as Movie;
      if (movieFromDB) {
        await movieRepository.remove(movieFromDB);
        return res.status(200).send("movie was deleted");
      } else {
        return res.status(200).send("movie not found");
      }
    } else {
      return res
        .status(400)
        .send("this user is Unauthorized to do this action");
    }
  } catch (error) {
    return res.status(500).send(error);
  }
};

const updateMovie = async (req: Request, res: Response, next: NextFunction) => {
  const { id, name, image, premiered, genres } = req.body;
  try {
    const usernameLogin = res.locals.jwt.username;
    const userFromDB: User = (await userRepository.findOne({
      where: { userName: usernameLogin },
      relations: ["permission"],
    })) as User;
    if (
      userFromDB.permission
        ?.map((permission) => permission.name)
        .includes("Create Movies") ||
      usernameLogin === "admin"
    ) {
      const genresArray: string[] = genres;
      const genresOfMovie: Genre[] = [];
      for (const genre of genresArray) {
        const genreFromDB = (await genreRepository.findOne({
          where: { name: genre },
        })) as Genre;
        genresOfMovie.push(genreFromDB);
      }
      const movieToUpdate = (await movieRepository.findOne({
        where: { id: id },
      })) as Movie;
      if (movieToUpdate) {
        movieToUpdate.name = name;
        movieToUpdate.image = image;
        movieToUpdate.premiered = premiered;
        movieToUpdate.genre = genresOfMovie;
        const updatedMovie: Movie = await movieRepository.save(movieToUpdate);
        return res.status(200).send(updatedMovie);
      } else {
        return res.status(400).send("movie not found");
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
  getAllMovies,
  addMovie,
  deleteMovie,
  updateMovie,
};
