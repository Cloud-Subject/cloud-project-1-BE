import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import * as argon2 from 'argon2'; // Sử dụng argon2 thay vì bcrypt
import { Task } from '../tasks/task.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude({ toPlainOnly: true }) // Ẩn password khi trả về response
  password: string;

  @Column()
  fullName: string;

  @Column()
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await argon2.hash(this.password); // Mã hóa password bằng argon2
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(this.password, plainPassword);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }
}
