import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdvisoryDate } from 'src/advisory-dates/entities/advisory-date.entity';
import { User } from 'src/users/entities/user.entity';

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

@Entity('student_invitations')
export class StudentInvitation {
  @PrimaryGeneratedColumn()
  invitation_id: number;

  @Column()
  advisory_date_id: number;

  @Column()
  student_id: number;

  @Column()
  invited_by_id: number; // ID del profesor que invitó

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status: InvitationStatus;

  @Column({ type: 'text', nullable: true })
  invitation_message: string | null;

  @Column({ type: 'text', nullable: true })
  response_message: string | null; // Mensaje del estudiante al aceptar/rechazar

  @Column({ nullable: true })
  responded_at: Date | null;

  @Column({ nullable: true })
  expires_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relaciones
  @ManyToOne(() => AdvisoryDate, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advisory_date_id' })
  advisory_date: AdvisoryDate;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by_id' })
  invited_by: User;
}
