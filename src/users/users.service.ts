import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from './user-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ username });
  }

  async create(
    username: string,
    password: string,
    role: UserRole = UserRole.STUDENT,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.usersRepo.create({
      username,
      password: hashedPassword,
      role,
    });

    return this.usersRepo.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(
        `El usuario con el id "${id}" no fue encontrado`,
      );
    }
    return user;
  }

  async updateRole(id: number, role: UserRole) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.role = role;
    return this.usersRepo.save(user);
  }
}
