import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Advisory } from 'src/advisories/entities/advisory.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  student_id: number;

  @Column()
  name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column()
  school_id: number;

  @ManyToMany(() => Advisory, (advisory) => advisory.students)
  advisories: Advisory[];
}
