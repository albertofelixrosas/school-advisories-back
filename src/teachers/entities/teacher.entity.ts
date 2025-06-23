import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Advisory } from 'src/advisories/entities/advisory.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  teacher_id: number;

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

  @OneToMany(() => Advisory, (advisory) => advisory.teacher)
  advisories: Advisory[];
}
