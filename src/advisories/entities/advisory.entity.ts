import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Venue } from 'src/venues/entities/venue.entity';
import { User } from 'src/users/entities/user.entity';

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

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToOne(() => Subject, (subject) => subject.advisories, {
    nullable: false,
  })
  subject: Subject;

  @ManyToOne(() => Venue, (venue) => venue.advisories, {
    nullable: false,
  })
  venue: Venue;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'advisory_students',
    joinColumn: { name: 'advisory_id', referencedColumnName: 'advisory_id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'user_id' },
  })
  students: User[];
}
