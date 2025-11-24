import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FrontendListItemDto } from '../../common/frontend-list-item.dto';

export class VenueListItemDto extends FrontendListItemDto {
  @ApiPropertyOptional({ description: 'Edificio' })
  building?: string;

  @ApiPropertyOptional({ description: 'Ubicación' })
  location?: string;
}
