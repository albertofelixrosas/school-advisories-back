import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FrontendListItemDto } from '../../common/frontend-list-item.dto';

export class ProfessorListItemDto extends FrontendListItemDto {
  @ApiPropertyOptional({ description: 'Correo electrónico del profesor' })
  email?: string;

  @ApiPropertyOptional({ description: 'Foto del profesor' })
  photo_url?: string;

  @ApiPropertyOptional({ description: 'Materia principal' })
  subject?: string;
}
