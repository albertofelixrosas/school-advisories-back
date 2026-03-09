import { IsInt, IsOptional } from 'class-validator';

export class AssignCareerDto {
  @IsInt()
  career_id: number;

  @IsInt()
  enrollment_year: number;
}

export class UpdateCareerDto {
  @IsOptional()
  @IsInt()
  career_id?: number;

  @IsOptional()
  @IsInt()
  enrollment_year?: number;
}
