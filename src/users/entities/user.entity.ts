import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from '../user-role.enum'; // asegúrate de la ruta correcta

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;
}
