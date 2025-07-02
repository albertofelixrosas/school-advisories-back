import { Injectable, NotFoundException } from '@nestjs/common';
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
}
