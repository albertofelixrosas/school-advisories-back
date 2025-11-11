import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notification_logs')
export class NotificationLogs {
  @PrimaryGeneratedColumn()
  log_id: number;

  @Column()
  user_id: number;

  @Column()
  notification_type: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  sent_to: string; // email address

  @Column({ default: false })
  sent_successfully: boolean;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'timestamp', nullable: true })
  sent_at: Date;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
