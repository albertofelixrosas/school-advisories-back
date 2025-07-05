import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectDetails } from './entities/subject-detail.entity';
import { CreateSubjectDetailDto } from './dto/create-subject-detail.dto';
import { UpdateSubjectDetailDto } from './dto/update-subject-detail.dto';

@Injectable()
export class SubjectDetailsService {
  constructor(
    @InjectRepository(SubjectDetails)
    private readonly detailsRepo: Repository<SubjectDetails>,
  ) {}

  create(dto: CreateSubjectDetailDto) {
    const detail = this.detailsRepo.create(dto);
    return this.detailsRepo.save(detail);
  }

  findAll() {
    return this.detailsRepo.find({ relations: ['subject', 'schedules'] });
  }

  findOne(id: number) {
    return this.detailsRepo.findOne({
      where: { id },
      relations: ['subject', 'schedules'],
    });
  }

  async update(id: number, dto: UpdateSubjectDetailDto) {
    await this.detailsRepo.update(id, dto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.detailsRepo.delete(id);
  }
}
