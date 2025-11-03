import {
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class StudentAttendanceDto {
  @ApiProperty({ example: 1, description: 'ID del estudiante' })
  @IsNotEmpty()
  @IsNumber()
  student_id: number;

  @ApiProperty({ example: true, description: 'Si el estudiante asistió' })
  @IsNotEmpty()
  attended: boolean;

  @ApiProperty({
    example: 'Llegó 15 minutos tarde pero participó activamente',
    description: 'Notas específicas del estudiante (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkAttendanceDto {
  @ApiProperty({
    type: [StudentAttendanceDto],
    description: 'Lista de asistencias de estudiantes',
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  attendances: StudentAttendanceDto[];
}

export class CompleteSessionDto {
  @ApiProperty({
    example:
      'Se cubrieron todos los temas programados. Los estudiantes mostraron buen entendimiento.',
    description: 'Notas generales de la sesión',
  })
  @IsNotEmpty()
  @IsString()
  session_notes: string;

  @ApiProperty({
    type: [StudentAttendanceDto],
    description:
      'Lista final de asistencias (opcional, si no se marcó previamente)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  final_attendances?: StudentAttendanceDto[];
}
