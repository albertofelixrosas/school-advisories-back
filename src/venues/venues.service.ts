import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { CreateVenueDto } from './dto/create-venue.dto';
import { UpdateVenueDto } from './dto/update-venue.dto';
import { PaginatedResult } from 'src/common/interfaces/paginated-result.interface';
import { VenueDto } from './dto/venue.dto';
import { VenueQueryDto } from './dto/venue-query.dto';
import { AdvisoryDate } from 'src/advisory-dates/entities/advisory-date.entity';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private readonly repo: Repository<Venue>,
    @InjectRepository(AdvisoryDate)
    private readonly advisoryDateRepo: Repository<AdvisoryDate>,
  ) {}

  create(dto: CreateVenueDto) {
    const venue = this.repo.create(dto);
    return this.repo.save(venue);
  }

  async findAll(query: VenueQueryDto): Promise<PaginatedResult<VenueDto>> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const qb = this.repo.createQueryBuilder('venue');

    if (filters.name) {
      qb.andWhere('venue.name ILIKE :name', { name: `%${filters.name}%` });
    }

    if (filters.type) {
      qb.andWhere('venue.type = :type', { type: filters.type });
    }

    if (filters.building) {
      qb.andWhere('venue.building = :building', { building: filters.building });
    }

    if (filters.floor) {
      qb.andWhere('venue.floor = :floor', { floor: filters.floor });
    }

    qb.skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    const responseData: VenueDto[] = data.map((v) => ({
      venue_id: v.venue_id,
      name: v.name,
      type: v.type,
      url: v.url,
      building: v.building,
      floor: v.floor,
    }));

    return {
      data: responseData,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    return this.repo.findOneBy({ venue_id: id });
  }

  async update(id: number, dto: UpdateVenueDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    // Check if the venue exists
    const venue = await this.findOne(id);
    if (!venue) {
      throw new Error('Venue not found');
    }

    // Check if exist any advisory dates associated with this venue
    const advisoryDates = await this.advisoryDateRepo.find({
      where: { venue: { venue_id: id } },
    });
    if (advisoryDates.length > 0) {
      throw new BadRequestException(
        'Cannot delete venue with associated advisory dates',
      );
    }

    return this.repo.delete(id);
  }
}
