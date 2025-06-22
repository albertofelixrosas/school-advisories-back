import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  teacher_id: number;

  @Column()
  name: string;
}
