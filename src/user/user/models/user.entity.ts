import { BlogEntryEntity } from 'src/blog/model/blog-entry.entity';
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user.interface';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @OneToMany(() => BlogEntryEntity, (blogEntryEntity) => blogEntryEntity)
  blogEntries: BlogEntryEntity[];

  @BeforeInsert()
  emailToLowerCase() {
    this.email.toLowerCase();
  }
}
