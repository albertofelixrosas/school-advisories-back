import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Advisory } from 'src/advisories/entities/advisory.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  location_id: number;

  @Column({ unique: true })
  location: string;

  @Column()
  location_type: string;

  @OneToMany(() => Advisory, (advisory) => advisory.location)
  advisories: Advisory[];
}
