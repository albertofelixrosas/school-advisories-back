import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdvisoryDateDto } from './dto/create-advisory-date.dto';
import { UpdateAdvisoryDateDto } from './dto/update-advisory-date.dto';
import {
  FindAdvisoryDatesQueryDto,
  SessionStatus,
} from './dto/find-advisory-dates-query.dto';
import { PaginatedAdvisoryDatesResponseDto } from './dto/paginated-response.dto';
import { Repository, FindOptionsWhere, MoreThanOrEqual, LessThanOrEqual, IsNull, Not } from 'typeorm';
import { AdvisoryDate } from './entities/advisory-date.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Advisory } from '../advisories/entities/advisory.entity';
import { Venue } from '../venues/entities/venue.entity';

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

  async findAll(
    queryDto?: FindAdvisoryDatesQueryDto,
  ): Promise<PaginatedAdvisoryDatesResponseDto<AdvisoryDate>> {
    // Si no hay queryDto, usar valores por defecto
    const {
      advisory_id,
      professor_id,
      from_date,
      to_date,
      status = SessionStatus.ALL,
      page = 1,
      limit = 50,
    } = queryDto || {};

    // Construir las condiciones de filtrado
    const where: FindOptionsWhere<AdvisoryDate> = {};

    // Filtro por advisory_id
    if (advisory_id) {
      where.advisory_id = advisory_id;
    }

    // Filtro por fecha desde
    if (from_date) {
      where.date = MoreThanOrEqual(from_date);
    }

    // Filtro por fecha hasta
    if (to_date) {
      if (where.date) {
        // Si ya hay un filtro de fecha, necesitamos combinarlos
        // TypeORM no soporta múltiples operadores en el mismo campo fácilmente
        // Por eso usaremos query builder más adelante
      } else {
        where.date = LessThanOrEqual(to_date);
      }
    }

    // Filtro por estado (upcoming/completed)
    const now = new Date().toISOString();
    if (status === SessionStatus.UPCOMING) {
      where.completed_at = IsNull();
      if (!where.date) {
        where.date = MoreThanOrEqual(now);
      }
    } else if (status === SessionStatus.COMPLETED) {
      where.completed_at = Not(IsNull());
    }

    // Crear query builder para filtros más complejos
    let queryBuilder = this.advisoryDateRepo
      .createQueryBuilder('advisory_date')
      .leftJoinAndSelect('advisory_date.advisory', 'advisory')
      .leftJoinAndSelect('advisory_date.venue', 'venue')
      .leftJoinAndSelect('advisory_date.attendances', 'attendances');

    // Aplicar filtro por advisory_id
    if (advisory_id) {
      queryBuilder = queryBuilder.andWhere(
        'advisory_date.advisory_id = :advisory_id',
        { advisory_id },
      );
    }

    // Aplicar filtro por professor_id (a través de la relación con advisory)
    if (professor_id) {
      queryBuilder = queryBuilder
        .leftJoin('advisory.professor', 'professor')
        .andWhere('advisory.professor_id = :professor_id', { professor_id });
    }

    // Aplicar filtro por rango de fechas
    if (from_date && to_date) {
      queryBuilder = queryBuilder.andWhere(
        'advisory_date.date BETWEEN :from_date AND :to_date',
        { from_date, to_date },
      );
    } else if (from_date) {
      queryBuilder = queryBuilder.andWhere('advisory_date.date >= :from_date', {
        from_date,
      });
    } else if (to_date) {
      queryBuilder = queryBuilder.andWhere('advisory_date.date <= :to_date', {
        to_date,
      });
    }

    // Aplicar filtro por estado
    if (status === SessionStatus.UPCOMING) {
      queryBuilder = queryBuilder
        .andWhere('advisory_date.completed_at IS NULL')
        .andWhere('advisory_date.date >= :now', { now });
    } else if (status === SessionStatus.COMPLETED) {
      queryBuilder = queryBuilder.andWhere(
        'advisory_date.completed_at IS NOT NULL',
      );
    }

    // Ordenar por fecha (más recientes primero por defecto)
    queryBuilder = queryBuilder.orderBy('advisory_date.date', 'DESC');

    // Obtener el total de registros antes de paginar
    const total = await queryBuilder.getCount();

    // Aplicar paginación
    const skip = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(skip).take(limit);

    // Ejecutar query
    const data = await queryBuilder.getMany();

    // Calcular metadatos de paginación
    const total_pages = Math.ceil(total / limit);
    const has_next = page < total_pages;
    const has_prev = page > 1;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        total_pages,
        has_next,
        has_prev,
      },
    };
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
