import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreatePlanSubjectDto {
  @IsInt()
  study_plan_id: number;

  @IsInt()
  subject_id: number;

  @IsInt()
  semester: number;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsInt()
  credits?: number;
}
