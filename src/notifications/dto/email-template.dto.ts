import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
} from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty({ description: 'Unique template key (e.g., advisory_reminder)' })
  @IsString()
  @IsNotEmpty()
  template_key: string;

  @ApiProperty({ description: 'Human-readable template name' })
  @IsString()
  @IsNotEmpty()
  template_name: string;

  @ApiProperty({ description: 'Email subject line (supports variables)' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'HTML email content (supports {{variables}})' })
  @IsString()
  @IsNotEmpty()
  html_content: string;

  @ApiPropertyOptional({ description: 'Plain text email content (optional)' })
  @IsString()
  @IsOptional()
  text_content?: string;

  @ApiPropertyOptional({
    description: 'Available variables for the template',
    example: {
      student_name: 'Name of the student',
      professor_name: 'Name of the professor',
      subject_name: 'Name of the subject',
    },
  })
  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Is the template active?',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

export class UpdateEmailTemplateDto {
  @ApiPropertyOptional({ description: 'Human-readable template name' })
  @IsString()
  @IsOptional()
  template_name?: string;

  @ApiPropertyOptional({
    description: 'Email subject line (supports variables)',
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({
    description: 'HTML email content (supports {{variables}})',
  })
  @IsString()
  @IsOptional()
  html_content?: string;

  @ApiPropertyOptional({ description: 'Plain text email content' })
  @IsString()
  @IsOptional()
  text_content?: string;

  @ApiPropertyOptional({ description: 'Available variables for the template' })
  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Is the template active?' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
