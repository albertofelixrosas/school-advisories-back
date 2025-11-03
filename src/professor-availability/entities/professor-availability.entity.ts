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
import { WeekDay } from '../../common/week-day.enum';

@Entity('professor_availability')
export class ProfessorAvailability {
  @PrimaryGeneratedColumn()
  availability_id: number;

  @Column()
  professor_id: number;

  @Column({ nullable: true })
  subject_detail_id?: number; // Opcional: disponibilidad para materia específica

  @Column({
    type: 'enum',
    enum: WeekDay,
  })
  day_of_week: WeekDay;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ default: 5 })
  max_students_per_slot: number;

  @Column({ default: 30 })
  slot_duration_minutes: number; // Duración de cada slot en minutos

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_recurring: boolean; // Si se repite semanalmente

  @Column({ type: 'date', nullable: true })
  effective_from?: Date; // Fecha desde cuando aplica

  @Column({ type: 'date', nullable: true })
  effective_until?: Date; // Fecha hasta cuando aplica

  @Column({ type: 'text', nullable: true })
  notes?: string; // Notas adicionales sobre la disponibilidad

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'professor_id' })
  professor: User;

  @ManyToOne(() => SubjectDetails, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_detail_id' })
  subject_detail?: SubjectDetails;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
