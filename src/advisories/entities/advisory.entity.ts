import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Location } from 'src/locations/entities/location.entity';
import { Student } from 'src/students/entities/student.entity';

@Entity('advisories')
export class Advisory {
  @PrimaryGeneratedColumn()
  advisory_id: number;

  @Column({ type: 'text', nullable: false })
  description: string;

  @Column({ type: 'date', nullable: false })
  date: string;

  @Column({ type: 'time', nullable: false })
  begin_time: string;

  @Column({ type: 'time', nullable: false })
  end_time: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.advisories, {
    nullable: false,
  })
  teacher: Teacher;

  @ManyToOne(() => Subject, (subject) => subject.advisories, {
    nullable: false,
  })
  subject: Subject;

  @ManyToOne(() => Location, (location) => location.advisories, {
    nullable: false,
  })
  location: Location;

  @ManyToMany(() => Student, (student) => student.advisories)
  @JoinTable({
    name: 'advisory_students',
    joinColumn: { name: 'advisory_id', referencedColumnName: 'advisory_id' },
    inverseJoinColumn: {
      name: 'student_id',
      referencedColumnName: 'student_id',
    },
  })
  students: Student[];
}
