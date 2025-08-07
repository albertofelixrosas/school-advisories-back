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
import { Advisory } from 'src/advisories/entities/advisory.entity';
import { Venue } from 'src/venues/entities/venue.entity';

@Injectable()
export class AdvisoryDatesService {
  constructor(
    // Inject any required dependencies here, e.g., repositories or other services
    @InjectRepository(AdvisoryDate)
    private readonly advisoryDateRepo: Repository<AdvisoryDate>,
    @InjectRepository(Advisory)
    private readonly advisoryRepo: Repository<Advisory>,
    @InjectRepository(Venue)
    private readonly venueRepo: Repository<Venue>,
  ) {}

  async create(dto: CreateAdvisoryDateDto) {
    // Validate the DTO
    if (!dto.advisory_id || !dto.venue_id || !dto.topic || !dto.date) {
      throw new BadRequestException('All fields are required');
    }

    // Check if the advisory and venue exist
    const advisory = await this.advisoryRepo.findOne({
      where: { advisory_id: dto.advisory_id },
    });

    if (!advisory) {
      throw new BadRequestException(
        `Advisory with ID ${dto.advisory_id} not found`,
      );
    }

    const venue = await this.venueRepo.findOne({
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
      relations: ['advisory', 'venue', 'attendances'], // Include related entities if needed
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

    if (dto.venue_id) {
      const venue = await this.venueRepo.findOne({
        where: { venue_id: dto.venue_id },
      });

      if (!venue) {
        throw new BadRequestException(
          `Venue with ID ${dto.venue_id} not found`,
        );
      }
      dto.venue_id = venue.venue_id; // Ensure the venue ID is valid
    }

    if (dto.date) {
      const date = new Date(dto.date);
      if (isNaN(date.getTime())) {
        throw new BadRequestException('Invalid date format');
      }
      dto.date = date.toISOString(); // Ensure the date is in ISO format
    }

    if (dto.topic) {
      if (dto.topic.trim() === '') {
        throw new BadRequestException('Topic cannot be empty');
      }
      dto.topic = dto.topic.trim(); // Trim whitespace from the topic
    }

    // Update the advisory date with the new values
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
