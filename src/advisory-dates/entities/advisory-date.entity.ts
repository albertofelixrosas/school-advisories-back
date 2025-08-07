import { Advisory } from 'src/advisories/entities/advisory.entity';
import { AdvisoryAttendance } from 'src/advisory-attendance/entities/advisory-attendance.entity';
import { Venue } from 'src/venues/entities/venue.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('advisory_dates')
export class AdvisoryDate {
  @PrimaryGeneratedColumn()
  advisory_date_id: number;

  @Column()
  advisory_id: number;

  @Column()
  venue_id: number;

  @Column()
  topic: string;

  @Column()
  date: string; // ISO 8601 date string, e.g., "2023-10-01T10:00:00Z"

  // One advisory date have only one advisory but an advisory can have many dates
  @ManyToOne(() => Advisory, (advisory) => advisory.advisory_dates)
  @JoinColumn({ name: 'advisory_id' })
  advisory: Advisory;

  // One advisory date have only one venue but an venue can have many advisory dates
  @ManyToOne(() => Venue, (venue) => venue.advisory_dates)
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @OneToMany(() => AdvisoryAttendance, (attendance) => attendance.advisory_date)
  attendances: AdvisoryAttendance[];
}
