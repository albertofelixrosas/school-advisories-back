import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../user-role.enum';
import { SubjectDetails } from '../../subject-details/entities/subject-detail.entity';
import { AdvisoryAttendance } from '../../advisory-attendance/entities/advisory-attendance.entity';
import { Advisory } from '../../advisories/entities/advisory.entity';
import { Career } from '../../careers/entities/career.entity';

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

  @Column({ nullable: true })
  career_id: number;

  @Column({ nullable: true })
  enrollment_year: number;

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

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Career, (career) => career.users)
  @JoinColumn({ name: 'career_id' })
  career: Career;

  @OneToMany(() => SubjectDetails, (details) => details.professor)
  subject_details: SubjectDetails[];

  @ManyToOne(() => Advisory, (advisory) => advisory.professor)
  @JoinColumn({ name: 'professor_id' })
  advisories: Advisory[];

  @OneToMany(() => AdvisoryAttendance, (attendance) => attendance.student)
  attendances: AdvisoryAttendance[];
}
