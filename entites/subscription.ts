import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from "typeorm";
@Entity("subscriptions")
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  date?: Date;

  @Column()
  @PrimaryColumn()
  memeber_id?: number;

  @Column()
  @PrimaryColumn()
  movie_id?: number;
}
