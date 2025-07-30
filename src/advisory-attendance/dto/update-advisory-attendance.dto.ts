import { PartialType } from '@nestjs/swagger';
import { CreateAdvisoryAttendanceDto } from './create-advisory-attendance.dto';

export class UpdateAdvisoryAttendanceDto extends PartialType(
  CreateAdvisoryAttendanceDto,
) {}
