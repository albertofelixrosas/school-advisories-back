import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsDateString } from 'class-validator';

export class CreateAdvisoryDto {
  @ApiProperty({
    example: '2025-06-22T15:30:00',
    description: 'Fecha y hora programada para la asesoría en formato ISO 8601',
  })
  @IsNotEmpty({ message: 'La fecha y hora de la asesoría es obligatoria' })
  @IsDateString(
    {},
    { message: 'El formato de la fecha es inválido (debe ser ISO 8601)' },
  )
  scheduled_at: string;

  @ApiProperty({
    example: 1,
    description: 'ID del profesor que dará la asesoría',
  })
  @IsNotEmpty({ message: 'El ID del profesor es obligatorio' })
  @IsInt({ message: 'El ID del profesor debe ser un número entero' })
  teacher_id: number;

  @ApiProperty({
    example: 3,
    description: 'ID del estudiante que recibirá la asesoría',
  })
  @IsNotEmpty({ message: 'El ID del estudiante es obligatorio' })
  @IsInt({ message: 'El ID del estudiante debe ser un número entero' })
  student_id: number;

  @ApiProperty({
    example: 2,
    description: 'ID de la materia relacionada con la asesoría',
  })
  @IsNotEmpty({ message: 'El ID de la materia es obligatorio' })
  @IsInt({ message: 'El ID de la materia debe ser un número entero' })
  subject_id: number;

  @ApiProperty({
    example: 4,
    description: 'ID de la ubicación donde se llevará a cabo la asesoría',
  })
  @IsNotEmpty({ message: 'El ID de la ubicación es obligatorio' })
  @IsInt({ message: 'El ID de la ubicación debe ser un número entero' })
  location_id: number;
}
