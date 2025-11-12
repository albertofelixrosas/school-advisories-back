import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/user-role.enum';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async seedDatabase() {
    console.log('🌱 Iniciando seeding de la base de datos...');

    // Limpiar usuarios existentes
    await this.clearUsers();

    // Crear usuarios de prueba
    const users = await this.createUsers();
    console.log(`✅ Creados ${users.length} usuarios`);

    console.log('🎉 Seeding completado exitosamente!');

    return {
      message: 'Base de datos poblada exitosamente con usuarios de prueba',
      data: {
        users: users.length,
      },
      credentials: {
        admin: { username: 'admin', password: '123456' },
        professor: { username: 'mgarcia', password: '123456' },
        student: { username: 'alopez', password: '123456' },
      },
    };
  }

  private async clearUsers() {
    console.log('🧹 Limpiando usuarios existentes...');
    await this.usersRepo.delete({});
  }

  private async createUsers(): Promise<User[]> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('123456', saltRounds);

    // Crear usuarios uno por uno para evitar problemas de tipos
    const adminUser = this.usersRepo.create({
      name: 'Carlos',
      last_name: 'Rodríguez López',
      email: 'admin@itson.edu.mx',
      phone_number: '+52 644 410 0001',
      school_id: 1,
      username: 'admin',
      password: hashedPassword,
      employee_id: 'EMP001',
      role: UserRole.ADMIN,
      is_active: true,
    });

    const professorUser = this.usersRepo.create({
      name: 'María Elena',
      last_name: 'García Hernández',
      email: 'maria.garcia@itson.edu.mx',
      phone_number: '+52 644 410 0002',
      school_id: 1,
      username: 'mgarcia',
      password: hashedPassword,
      employee_id: 'EMP002',
      role: UserRole.PROFESSOR,
      is_active: true,
    });

    const studentUser = this.usersRepo.create({
      name: 'Ana Sofía',
      last_name: 'López Morales',
      email: 'ana.lopez@potros.itson.edu.mx',
      phone_number: '+52 644 410 0004',
      school_id: 1,
      username: 'alopez',
      password: hashedPassword,
      student_id: 'EST220001',
      role: UserRole.STUDENT,
      is_active: true,
    });

    // Guardar usuarios
    const savedAdmin = await this.usersRepo.save(adminUser);
    const savedProfessor = await this.usersRepo.save(professorUser);
    const savedStudent = await this.usersRepo.save(studentUser);

    return [savedAdmin, savedProfessor, savedStudent];
  }

  async getUsersInfo() {
    const users = await this.usersRepo.find({
      select: [
        'user_id',
        'name',
        'last_name',
        'username',
        'email',
        'role',
        'is_active',
      ],
      order: { role: 'ASC', name: 'ASC' },
    });

    return {
      message: 'Usuarios disponibles para pruebas',
      users: users.map((user) => ({
        ...user,
        login_credentials: {
          username: user.username,
          password: '123456',
        },
      })),
    };
  }
}
