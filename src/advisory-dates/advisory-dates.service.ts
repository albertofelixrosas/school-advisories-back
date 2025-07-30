import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdvisoryDateDto } from './dto/create-advisory-date.dto';
import { UpdateAdvisoryDateDto } from './dto/update-advisory-date.dto';
import { Repository } from 'typeorm';
import { AdvisoryDate } from './entities/advisory-date.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdvisoryDatesService {
  constructor(
    // Inject any required dependencies here, e.g., repositories or other services
    @InjectRepository(AdvisoryDate)
    private readonly advisoryDateRepo: Repository<AdvisoryDate>,
  ) {}

  async create(dto: CreateAdvisoryDateDto) {
    // Validate the DTO
    if (!dto.advisory_id || !dto.venue_id || !dto.topic || !dto.date) {
      throw new BadRequestException('All fields are required');
    }

    // Check if the advisory and venue exist
    const advisory = await this.advisoryDateRepo.manager.findOne(AdvisoryDate, {
      where: { advisory_id: dto.advisory_id },
    });

    if (!advisory) {
      throw new BadRequestException(
        `Advisory with ID ${dto.advisory_id} not found`,
      );
    }

    const venue = await this.advisoryDateRepo.manager.findOne(AdvisoryDate, {
      where: { venue_id: dto.venue_id },
    });

    if (!venue) {
      throw new BadRequestException(`Venue with ID ${dto.venue_id} not found`);
    }

    // Validate the DTO and create a new AdvisoryDate entity
    const advisoryDate = this.advisoryDateRepo.create(dto);
    // Save the new advisory date to the database
    return await this.advisoryDateRepo.save(advisoryDate);
  }

  async findAll() {
    // Fetch all advisory dates from the database
    return await this.advisoryDateRepo.find({
      relations: ['advisory', 'venue'], // Include related entities if needed
    });
  }

  async findOne(id: number) {
    const advisoryDate = await this.advisoryDateRepo.findOne({
      where: { advisory_date_id: id },
    });

    if (!advisoryDate) {
      throw new NotFoundException(`Advisory Date with ID ${id} not found`);
    }

    return advisoryDate;
  }

  async update(id: number, dto: UpdateAdvisoryDateDto) {
    const advisoryDate = await this.advisoryDateRepo.findOne({
      where: { advisory_date_id: id },
    });

    if (!advisoryDate) {
      throw new NotFoundException(`Advisory Date with ID ${id} not found`);
    }

    // Update the fields that are provided in the DTO
    Object.assign(advisoryDate, dto);

    // Save the updated advisory date to the database
    return await this.advisoryDateRepo.save(advisoryDate);
  }

  async remove(id: number) {
    const advisoryDate = await this.advisoryDateRepo.findOne({
      where: { advisory_date_id: id },
    });

    if (!advisoryDate) {
      throw new NotFoundException(`Advisory Date with ID ${id} not found`);
    }

    // Remove the advisory date from the database
    return await this.advisoryDateRepo.remove(advisoryDate);
  }
}
