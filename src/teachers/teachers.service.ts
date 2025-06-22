import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  create(dto: CreateTeacherDto) {
    const teacher = this.teacherRepository.create(dto);
    return this.teacherRepository.save(teacher);
  }

  findAll() {
    return this.teacherRepository.find();
  }

  findOne(id: number) {
    return this.teacherRepository.findOneBy({ teacher_id: id });
  }

  async update(id: number, dto: UpdateTeacherDto) {
    await this.teacherRepository.update(id, dto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.teacherRepository.delete(id);
  }
}
