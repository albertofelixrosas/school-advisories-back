import { PartialType } from '@nestjs/swagger';
import { CreateSubjectDetailDto } from './create-subject-detail.dto';

export class UpdateSubjectDetailDto extends PartialType(
  CreateSubjectDetailDto,
) {}
