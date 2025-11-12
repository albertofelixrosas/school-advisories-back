import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SubjectDetails } from '../../subject-details/entities/subject-detail.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  subject_id: number;

  @Column({ unique: true })
  subject: string;

  @OneToMany(() => SubjectDetails, (details) => details.subject)
  details: SubjectDetails[];
}
