import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Advisory } from 'src/advisories/entities/advisory.entity';
import { SubjectDetails } from 'src/subject-details/entities/subject-detail.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  subject_id: number;

  @Column({ unique: true })
  subject: string;

  @OneToMany(() => Advisory, (advisory) => advisory.subject)
  advisories: Advisory[];

  @OneToMany(() => SubjectDetails, (details) => details.subject)
  details: SubjectDetails[];
}
