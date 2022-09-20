import {
  Entity,
  BaseEntity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  CreateDateColumn,
} from "typeorm";
import { Permission } from "./permission";
@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  firstName?: string;

  @Column()
  lastName?: string;

  @Column()
  userName?: string;

  @Column()
  password?: string;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  public created_at?: Date;

  @ManyToMany(() => Permission, (permission) => permission.user, {
    cascade: true,
  })
  permission?: Permission[];
}
