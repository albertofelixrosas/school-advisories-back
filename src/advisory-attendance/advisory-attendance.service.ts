import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdvisoryAttendance } from './entities/advisory-attendance.entity';
import { CreateAdvisoryAttendanceDto } from './dto/create-advisory-attendance.dto';
import { UpdateAdvisoryAttendanceDto } from './dto/update-advisory-attendance.dto';

@Injectable()
export class AdvisoryAttendanceService {
  constructor(
    @InjectRepository(AdvisoryAttendance)
    private attendanceRepo: Repository<AdvisoryAttendance>,
  ) {}

  async create(dto: CreateAdvisoryAttendanceDto) {
    // Check if attendance already exists for the student on the same advisory date
    const existingAttendance = await this.attendanceRepo.findOne({
      where: {
        student_id: dto.student_id,
        advisory_date_id: dto.advisory_date_id,
      },
    });
    if (existingAttendance) {
      throw new BadRequestException(
        'Attendance already exists for this student on this date.',
      );
    }

    // Create new attendance record
    const attendance = this.attendanceRepo.create(dto);
    return this.attendanceRepo.save(attendance);
  }

  findAll() {
    return this.attendanceRepo.find({
      relations: ['student', 'advisory_date'],
    });
  }

  async findByAdvisory(advisory_date_id: number) {
    // Check if the advisory date exists
    const advisoryDateExists = await this.attendanceRepo.manager
      .getRepository('AdvisoryDate')
      .findOne({ where: { advisory_date_id } });
    if (!advisoryDateExists) {
      throw new NotFoundException('Advisory date not found.');
    }
    // Find all attendances for the given advisory date id
    const attendances = await this.attendanceRepo.find({
      where: { advisory_date_id },
      relations: ['student'],
    });
    if (attendances.length === 0) {
      throw new NotFoundException(
        'No attendances found for this advisory date.',
      );
    }
    // Return the attendances for the advisory date
    return attendances;
  }

  async findOne(id: number) {
    // Check if the attendance record exists
    const attendance = await this.attendanceRepo.findOne({
      where: { advisory_attendance_id: id },
      relations: ['student', 'advisory_date'],
    });
    if (!attendance) {
      throw new NotFoundException('Attendance record not found.');
    }
    // Return the attendance record with relations
    return attendance;
  }

  async update(id: number, dto: UpdateAdvisoryAttendanceDto) {
    // Check if the attendance record exists
    const attendance = await this.attendanceRepo.findOne({
      where: { advisory_attendance_id: id },
    });
    if (!attendance) {
      throw new NotFoundException('Attendance record not found.');
    }

    // Update the attendance record
    // Note: UpdateAdvisoryAttendanceDto should have properties to update
    return this.attendanceRepo.update(id, dto);
  }

  async remove(id: number) {
    // Check if the attendance record exists
    const attendance = await this.attendanceRepo.findOne({
      where: { advisory_attendance_id: id },
    });
    if (!attendance) {
      throw new NotFoundException('Attendance record not found.');
    }
    // Remove the attendance record
    return this.attendanceRepo.delete(id);
  }
}
