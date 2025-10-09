import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ username });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newUser = this.usersRepo.create({
      ...dto,
      password: hashedPassword,
    });

    return this.usersRepo.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepo.findOneBy({ user_id: id });
    if (!user) {
      throw new NotFoundException(
        `El usuario con el id "${id}" no fue encontrado`,
      );
    }
    return user;
  }

  async findByRole(role: UserRole) {
    return this.usersRepo.find({
      where: { role },
    });
  }

  async updateRole(id: number, role: UserRole) {
    const user = await this.usersRepo.findOneBy({ user_id: id });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.role = role;
    return this.usersRepo.save(user);
  }

  async update(id: number, dto: Partial<CreateUserDto>) {
    const user = await this.usersRepo.findOneBy({ user_id: id });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Verificar si email ya existe en otro usuario (excluir el usuario actual)
    if (dto.email && dto.email !== user.email) {
      const existingUserByEmail = await this.usersRepo
        .createQueryBuilder('user')
        .where('user.email = :email', { email: dto.email })
        .andWhere('user.user_id != :userId', { userId: id })
        .getOne();

      if (existingUserByEmail) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }
    }

    // Verificar si username ya existe en otro usuario (excluir el usuario actual)
    if (dto.username && dto.username !== user.username) {
      const existingUserByUsername = await this.usersRepo
        .createQueryBuilder('user')
        .where('user.username = :username', { username: dto.username })
        .andWhere('user.user_id != :userId', { userId: id })
        .getOne();

      if (existingUserByUsername) {
        throw new ConflictException(
          'El nombre de usuario ya está en uso por otro usuario',
        );
      }
    }

    // Verificar si phone_number ya existe en otro usuario (excluir el usuario actual)
    if (dto.phone_number && dto.phone_number !== user.phone_number) {
      const existingUserByPhone = await this.usersRepo
        .createQueryBuilder('user')
        .where('user.phone_number = :phoneNumber', {
          phoneNumber: dto.phone_number,
        })
        .andWhere('user.user_id != :userId', { userId: id })
        .getOne();

      if (existingUserByPhone) {
        throw new ConflictException(
          'El número de teléfono ya está en uso por otro usuario',
        );
      }
    }

    // Hash de la contraseña si se proporciona
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    // Actualizar solo los campos que han cambiado
    const updateData: Partial<User> = {};

    // Solo incluir campos que realmente cambiaron
    if (dto.name && dto.name !== user.name) updateData.name = dto.name;
    if (dto.last_name && dto.last_name !== user.last_name)
      updateData.last_name = dto.last_name;
    if (dto.email && dto.email !== user.email) updateData.email = dto.email;
    if (dto.phone_number && dto.phone_number !== user.phone_number)
      updateData.phone_number = dto.phone_number;
    if (dto.username && dto.username !== user.username)
      updateData.username = dto.username;
    if (dto.password) updateData.password = dto.password;
    if (dto.photo_url !== undefined && dto.photo_url !== user.photo_url)
      updateData.photo_url = dto.photo_url;
    if (dto.school_id !== undefined && dto.school_id !== user.school_id)
      updateData.school_id = dto.school_id;
    if (dto.role && dto.role !== user.role) updateData.role = dto.role;

    // Si no hay cambios, devolver el usuario actual
    if (Object.keys(updateData).length === 0) {
      return user;
    }

    // Usar update en lugar de save para evitar problemas con constraints
    await this.usersRepo.update(id, updateData);

    // Retornar el usuario actualizado
    return this.usersRepo.findOneBy({ user_id: id });
  }
}
