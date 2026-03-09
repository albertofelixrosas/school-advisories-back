import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCareerDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
