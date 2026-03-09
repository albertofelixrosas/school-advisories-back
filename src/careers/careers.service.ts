import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from './entities/career.entity';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@Injectable()
export class CareersService {
  constructor(
    @InjectRepository(Career)
    private careersRepo: Repository<Career>,
  ) {}

  async create(createCareerDto: CreateCareerDto): Promise<Career> {
    const career = this.careersRepo.create(createCareerDto);
    return await this.careersRepo.save(career);
  }

  async findAll(): Promise<Career[]> {
    return await this.careersRepo.find({
      relations: ['study_plans'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Career> {
    const career = await this.careersRepo.findOne({
      where: { career_id: id },
      relations: ['study_plans'],
    });

    if (!career) {
      throw new NotFoundException(`Carrera con ID ${id} no encontrada`);
    }

    return career;
  }

  async update(id: number, updateCareerDto: UpdateCareerDto): Promise<Career> {
    const career = await this.findOne(id);
    Object.assign(career, updateCareerDto);
    return await this.careersRepo.save(career);
  }

  async remove(id: number): Promise<void> {
    const career = await this.findOne(id);
    await this.careersRepo.remove(career);
  }

  async findActive(): Promise<Career[]> {
    return await this.careersRepo.find({
      where: { is_active: true },
      order: { name: 'ASC' },
    });
  }
}
