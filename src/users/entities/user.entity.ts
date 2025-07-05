import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserRole } from '../user-role.enum';
import { SubjectDetails } from '../../subject-details/entities/subject-detail.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone_number: string;

  @Column({ nullable: true })
  school_id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  photo_url: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @OneToMany(() => SubjectDetails, (details) => details.professor)
  subject_details: SubjectDetails[];
}
