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

@Entity('notification_preferences')
export class NotificationPreferences {
  @PrimaryGeneratedColumn()
  preference_id: number;

  @Column()
  user_id: number;

  @Column({ default: true })
  email_new_request: boolean;

  @Column({ default: true })
  email_request_approved: boolean;

  @Column({ default: true })
  email_request_rejected: boolean;

  @Column({ default: true })
  email_advisory_cancelled: boolean;

  @Column({ default: true })
  email_daily_reminders: boolean;

  @Column({ default: true })
  email_session_reminders: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
