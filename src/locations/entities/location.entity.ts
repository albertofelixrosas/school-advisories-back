import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Advisory } from '../../advisories/entities/advisory.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  location_id: number;

  @Column()
  description: string;

  @OneToMany(() => Advisory, (advisory) => advisory.student)
  advisories: Advisory[];
}
