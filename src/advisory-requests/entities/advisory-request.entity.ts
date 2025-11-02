import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { SubjectDetails } from '../../subject-details/entities/subject-detail.entity';
import { RequestStatus } from '../request-status.enum';

@Entity('advisory_requests')
export class AdvisoryRequest {
  @PrimaryGeneratedColumn()
  request_id: number;

  @Column()
  student_id: number;

  @Column()
  professor_id: number;

  @Column()
  subject_detail_id: number;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Column({ type: 'text', nullable: true })
  student_message: string;

  @Column({ type: 'text', nullable: true })
  professor_response: string;

  @Column({ nullable: true })
  processed_at: Date;

  @Column({ nullable: true })
  processed_by_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'professor_id' })
  professor: User;

  @ManyToOne(() => SubjectDetails)
  @JoinColumn({ name: 'subject_detail_id' })
  subject_detail: SubjectDetails;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'processed_by_id' })
  processed_by: User;
}
