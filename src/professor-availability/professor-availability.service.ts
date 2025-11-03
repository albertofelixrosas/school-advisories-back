import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfessorAvailability } from './entities/professor-availability.entity';
import { User } from '../users/entities/user.entity';
import { SubjectDetails } from '../subject-details/entities/subject-detail.entity';
import { AdvisoryDate } from '../advisory-dates/entities/advisory-date.entity';
import { CreateAvailabilitySlotDto } from './dto/create-availability.dto';
import { UpdateAvailabilitySlotDto } from './dto/update-availability.dto';
import {
  GetAvailabilityQueryDto,
  AvailabilitySlotResponseDto,
  BulkAvailabilityDto,
} from './dto/availability-response.dto';
import { UserRole } from '../users/user-role.enum';
import { WeekDay } from '../common/week-day.enum';

@Injectable()
export class ProfessorAvailabilityService {
  constructor(
    @InjectRepository(ProfessorAvailability)
    private availabilityRepo: Repository<ProfessorAvailability>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(SubjectDetails)
    private subjectDetailRepo: Repository<SubjectDetails>,
    @InjectRepository(AdvisoryDate)
    private advisoryDateRepo: Repository<AdvisoryDate>,
  ) {}

  /**
   * Crea un nuevo slot de disponibilidad
   */
  async createAvailabilitySlot(
    dto: CreateAvailabilitySlotDto,
  ): Promise<AvailabilitySlotResponseDto> {
    // Validar que el profesor existe
    const professor = await this.userRepo.findOne({
      where: { user_id: dto.professor_id, role: UserRole.PROFESSOR },
    });
    if (!professor) {
      throw new NotFoundException(
        `Professor with ID ${dto.professor_id} not found`,
      );
    }

    // Validar subject_detail si se proporciona
    if (dto.subject_detail_id) {
      const subjectDetail = await this.subjectDetailRepo.findOne({
        where: {
          subject_detail_id: dto.subject_detail_id,
          professor_id: dto.professor_id, // Solo puede crear disponibilidad para sus materias
        },
        relations: ['subject'],
      });
      if (!subjectDetail) {
        throw new ForbiddenException(
          'You can only create availability for subjects assigned to you',
        );
      }
    }

    // Validar que no haya solapamiento de horarios
    await this.validateTimeSlotConflict(dto);

    // Crear el slot de disponibilidad
    const availability = this.availabilityRepo.create(dto);
    const savedAvailability = await this.availabilityRepo.save(availability);

    return this.mapToResponseDto(savedAvailability);
  }

  /**
   * Crea múltiples slots de disponibilidad de una vez
   */
  async createBulkAvailability(
    dto: BulkAvailabilityDto,
  ): Promise<AvailabilitySlotResponseDto[]> {
    const results: AvailabilitySlotResponseDto[] = [];

    for (const slot of dto.slots) {
      const slotWithProfessor: CreateAvailabilitySlotDto = {
        ...slot,
        professor_id: dto.professor_id,
      };
      const result = await this.createAvailabilitySlot(slotWithProfessor);
      results.push(result);
    }

    return results;
  }

  /**
   * Obtiene la disponibilidad de un profesor
   */
  async getAvailability(
    query: GetAvailabilityQueryDto,
  ): Promise<AvailabilitySlotResponseDto[]> {
    const queryBuilder = this.availabilityRepo
      .createQueryBuilder('availability')
      .leftJoinAndSelect('availability.professor', 'professor')
      .leftJoinAndSelect('availability.subject_detail', 'subject_detail')
      .leftJoinAndSelect('subject_detail.subject', 'subject')
      .where('availability.professor_id = :professorId', {
        professorId: query.professor_id,
      })
      .andWhere('availability.is_active = :isActive', { isActive: true });

    // Filtros opcionales
    if (query.subject_detail_id) {
      queryBuilder.andWhere(
        'availability.subject_detail_id = :subjectDetailId',
        { subjectDetailId: query.subject_detail_id },
      );
    }

    if (query.day_of_week) {
      queryBuilder.andWhere('availability.day_of_week = :dayOfWeek', {
        dayOfWeek: query.day_of_week,
      });
    }

    // Filtro por fecha efectiva
    if (query.date) {
      queryBuilder
        .andWhere(
          '(availability.effective_from IS NULL OR availability.effective_from <= :date)',
          { date: query.date },
        )
        .andWhere(
          '(availability.effective_until IS NULL OR availability.effective_until >= :date)',
          { date: query.date },
        );
    }

    queryBuilder
      .orderBy('availability.day_of_week', 'ASC')
      .addOrderBy('availability.start_time', 'ASC');

    const availabilities = await queryBuilder.getMany();

    // Mapear a DTOs con información adicional
    const results: AvailabilitySlotResponseDto[] = [];
    for (const availability of availabilities) {
      const dto = this.mapToResponseDto(availability);
      // Agregar estadísticas de reservas actuales
      dto.current_bookings = await this.getCurrentBookings(
        availability.availability_id,
        query.date,
      );
      dto.available_spots = Math.max(
        0,
        availability.max_students_per_slot - (dto.current_bookings || 0),
      );
      results.push(dto);
    }

    return results;
  }

  /**
   * Obtiene slots disponibles para una fecha específica
   */
  async getAvailableSlots(
    professorId: number,
    subjectDetailId: number,
    targetDate: Date,
  ): Promise<{
    date: string;
    slots: Array<{
      availability_id: number;
      start_time: string;
      end_time: string;
      available_spots: number;
      max_students: number;
    }>;
  }> {
    const dayOfWeek = this.getWeekDayFromDate(targetDate);

    const availability = await this.getAvailability({
      professor_id: professorId,
      subject_detail_id: subjectDetailId,
      day_of_week: dayOfWeek,
      date: targetDate,
    });

    const slots = availability
      .filter((slot) => (slot.available_spots || 0) > 0)
      .map((slot) => ({
        availability_id: slot.availability_id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        available_spots: slot.available_spots || 0,
        max_students: slot.max_students_per_slot,
      }));

    return {
      date: targetDate.toISOString().split('T')[0],
      slots,
    };
  }

  /**
   * Actualiza un slot de disponibilidad
   */
  async updateAvailabilitySlot(
    availabilityId: number,
    dto: UpdateAvailabilitySlotDto,
  ): Promise<AvailabilitySlotResponseDto> {
    const availability = await this.availabilityRepo.findOne({
      where: { availability_id: availabilityId },
      relations: ['professor', 'subject_detail'],
    });

    if (!availability) {
      throw new NotFoundException(
        `Availability slot with ID ${availabilityId} not found`,
      );
    }

    // Si se cambian los horarios, validar conflictos
    if (dto.start_time || dto.end_time || dto.day_of_week) {
      const updateData = {
        ...availability,
        ...dto,
      };
      await this.validateTimeSlotConflict(updateData, availabilityId);
    }

    Object.assign(availability, dto);
    const updatedAvailability = await this.availabilityRepo.save(availability);

    return this.mapToResponseDto(updatedAvailability);
  }

  /**
   * Desactiva un slot de disponibilidad
   */
  async deactivateAvailabilitySlot(availabilityId: number): Promise<void> {
    const availability = await this.availabilityRepo.findOne({
      where: { availability_id: availabilityId },
    });

    if (!availability) {
      throw new NotFoundException(
        `Availability slot with ID ${availabilityId} not found`,
      );
    }

    availability.is_active = false;
    await this.availabilityRepo.save(availability);
  }

  /**
   * Elimina completamente un slot de disponibilidad
   */
  async deleteAvailabilitySlot(availabilityId: number): Promise<void> {
    const availability = await this.availabilityRepo.findOne({
      where: { availability_id: availabilityId },
    });

    if (!availability) {
      throw new NotFoundException(
        `Availability slot with ID ${availabilityId} not found`,
      );
    }

    // Verificar que no haya sesiones futuras reservadas
    const futureBookings = await this.getFutureBookingsForSlot(availabilityId);
    if (futureBookings > 0) {
      throw new BadRequestException(
        'Cannot delete availability slot with future bookings',
      );
    }

    await this.availabilityRepo.remove(availability);
  }

  // Métodos privados de utilidad

  private async validateTimeSlotConflict(
    dto: CreateAvailabilitySlotDto | UpdateAvailabilitySlotDto,
    excludeId?: number,
  ): Promise<void> {
    const queryBuilder = this.availabilityRepo
      .createQueryBuilder('availability')
      .where('availability.professor_id = :professorId', {
        professorId: dto.professor_id,
      })
      .andWhere('availability.day_of_week = :dayOfWeek', {
        dayOfWeek: dto.day_of_week,
      })
      .andWhere('availability.is_active = :isActive', { isActive: true })
      .andWhere(
        '(availability.start_time < :endTime AND availability.end_time > :startTime)',
        {
          startTime: dto.start_time,
          endTime: dto.end_time,
        },
      );

    if (excludeId) {
      queryBuilder.andWhere('availability.availability_id != :excludeId', {
        excludeId,
      });
    }

    const conflictingSlot = await queryBuilder.getOne();

    if (conflictingSlot) {
      throw new BadRequestException(
        `Time slot conflicts with existing availability from ${conflictingSlot.start_time} to ${conflictingSlot.end_time}`,
      );
    }
  }

  private async getCurrentBookings(
    availabilityId: number,
    date?: Date,
  ): Promise<number> {
    // Si se proporciona una fecha específica, contar reservas para esa fecha
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return await this.advisoryDateRepo.count({
        where: {
          // Aquí necesitaríamos relacionar con availability_id
          // Por ahora retornamos 0 como placeholder
        },
      });
    }

    return 0; // Placeholder para implementación completa
  }

  private getFutureBookingsForSlot(availabilityId: number): Promise<number> {
    // Placeholder - implementar lógica real cuando tengamos la relación completa
    console.log(`Checking future bookings for availability ${availabilityId}`);
    return Promise.resolve(0);
  }

  private getWeekDayFromDate(date: Date): WeekDay {
    const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const weekDays = [
      WeekDay.SUNDAY,
      WeekDay.MONDAY,
      WeekDay.TUESDAY,
      WeekDay.WEDNESDAY,
      WeekDay.THURSDAY,
      WeekDay.FRIDAY,
      WeekDay.SATURDAY,
    ];
    return weekDays[dayIndex];
  }

  private mapToResponseDto(
    availability: ProfessorAvailability,
  ): AvailabilitySlotResponseDto {
    return {
      availability_id: availability.availability_id,
      professor_id: availability.professor_id,
      subject_detail_id: availability.subject_detail_id,
      day_of_week: availability.day_of_week,
      start_time: availability.start_time,
      end_time: availability.end_time,
      max_students_per_slot: availability.max_students_per_slot,
      slot_duration_minutes: availability.slot_duration_minutes,
      is_active: availability.is_active,
      is_recurring: availability.is_recurring,
      effective_from: availability.effective_from,
      effective_until: availability.effective_until,
      notes: availability.notes,
      created_at: availability.created_at,
      updated_at: availability.updated_at,
      professor: availability.professor
        ? {
            user_id: availability.professor.user_id,
            name: availability.professor.name,
            last_name: availability.professor.last_name,
            email: availability.professor.email,
          }
        : undefined,
      subject_detail: availability.subject_detail
        ? {
            subject_detail_id: availability.subject_detail.subject_detail_id,
            subject_name: availability.subject_detail.subject?.subject || 'N/A',
          }
        : undefined,
    };
  }
}
