import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Advisory } from '../../advisories/entities/advisory.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  student_id: number;

  @Column()
  name: string;

  @OneToMany(() => Advisory, (advisory) => advisory.student)
  advisories: Advisory[];
}
