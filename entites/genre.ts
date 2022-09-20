import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Movie } from "./movie";

@Entity("genres")
export class Genre extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ unique: true })
  name?: string;

  @ManyToMany(() => Movie, (movie) => movie.genre, { cascade: true })
  @JoinTable({
    name: "geners_movies",
    joinColumn: {
      name: "genre_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "movie_id",
      referencedColumnName: "id",
    },
  })
  movie?: Movie[];
}
