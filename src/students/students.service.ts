import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) {}

  create(dto: CreateStudentDto) {
    const student = this.repo.create(dto);
    return this.repo.save(student);
  }

  findAll(page = 1, limit = 10) {
    return this.repo.find({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        student_id: 'ASC',
      },
    });
  }

  findOne(id: number) {
    return this.repo.findOneBy({ student_id: id });
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
