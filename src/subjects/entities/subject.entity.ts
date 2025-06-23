import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Advisory } from 'src/advisories/entities/advisory.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  subject_id: number;

  @Column({ unique: true })
  subject: string;

  @OneToMany(() => Advisory, (advisory) => advisory.subject)
  advisories: Advisory[];
}
