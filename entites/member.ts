import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
} from "typeorm";
import { Movie } from "./movie";
@Entity("members")
export class Member extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;

  @Column()
  email?: string;

  @Column()
  city?: string;

  @ManyToMany(() => Movie, (movie) => movie.members)
  movies?: Movie[];
}
