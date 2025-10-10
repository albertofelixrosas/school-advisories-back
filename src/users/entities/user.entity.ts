import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserRole } from '../user-role.enum';
import { SubjectDetails } from '../../subject-details/entities/subject-detail.entity';
import { AdvisoryAttendance } from 'src/advisory-attendance/entities/advisory-attendance.entity';
import { Advisory } from 'src/advisories/entities/advisory.entity';

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

  @Column({ nullable: true })
  student_id: string;

  @Column({ nullable: true })
  employee_id: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @OneToMany(() => SubjectDetails, (details) => details.professor)
  subject_details: SubjectDetails[];

  @ManyToOne(() => Advisory, (advisory) => advisory.professor)
  @JoinColumn({ name: 'professor_id' })
  advisories: Advisory[];

  @OneToMany(() => AdvisoryAttendance, (attendance) => attendance.student)
  attendances: AdvisoryAttendance[];
}
