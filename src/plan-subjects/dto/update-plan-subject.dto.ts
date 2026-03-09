import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanSubjectDto } from './create-plan-subject.dto';

export class UpdatePlanSubjectDto extends PartialType(CreatePlanSubjectDto) {}
