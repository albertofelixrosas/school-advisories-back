import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Advisory } from '../../advisories/entities/advisory.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  subject_id: number;

  @Column()
  name: string;

  @OneToMany(() => Advisory, (advisory) => advisory.subject)
  advisories: Advisory[];
}
