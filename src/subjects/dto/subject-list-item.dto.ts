import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FrontendListItemDto } from '../../common/frontend-list-item.dto';

export class SubjectListItemDto extends FrontendListItemDto {
  @ApiPropertyOptional({ description: 'Clave de la materia' })
  code?: string;

  @ApiPropertyOptional({ description: 'Descripción de la materia' })
  description?: string;
}
