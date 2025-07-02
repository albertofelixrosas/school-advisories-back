import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { VenueType } from '../venue-type.enum';
import { Advisory } from 'src/advisories/entities/advisory.entity';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn()
  venue_id: number;

  @Column()
  name: string; // Ej: "Aula 3", "Cubículo 12", "Google Meet - Math"

  @Column({
    type: 'enum',
    enum: VenueType,
    default: VenueType.CLASSROOM,
  })
  type: VenueType;

  @Column({ nullable: true })
  url?: string; // solo si es virtual

  @Column({ nullable: true })
  building?: string; // si aplica para oficinas o aulas

  @Column({ nullable: true })
  floor?: string; // si aplica para oficinas o aulas, igual que building

  @OneToMany(() => Advisory, (advisory) => advisory.venue)
  advisories: Advisory[];
}
