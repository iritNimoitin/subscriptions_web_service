import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { Genre } from "./genre";
import { Member } from "./member";
@Entity("movies")
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;

  @Column()
  image?: string;

  @Column()
  premiered?: Date;

  @ManyToMany(() => Genre, (genre) => genre.movie)
  genre?: Genre[];

  @ManyToMany(() => Member, (member) => member.movies, {
    cascade: true,
  })
  @JoinTable({
    name: "subscriptions",
    joinColumn: {
      name: "memeber_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "movie_id",
      referencedColumnName: "id",
    },
  })
  members?: Member[];
}
