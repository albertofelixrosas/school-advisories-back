import { PartialType } from '@nestjs/swagger';
import { CreateAdvisoryScheduleDto } from './create-advisory-schedule.dto';

export class UpdateAdvisoryScheduleDto extends PartialType(CreateAdvisoryScheduleDto) {}
