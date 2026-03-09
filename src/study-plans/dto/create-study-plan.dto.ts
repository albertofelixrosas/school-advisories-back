import { IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateStudyPlanDto {
  @IsInt()
  career_id: number;

  @IsInt()
  year: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
