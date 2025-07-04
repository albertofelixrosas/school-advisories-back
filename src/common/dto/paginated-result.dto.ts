import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export function PaginatedResultDto<T>(classRef: new () => T) {
  class PaginatedDto {
    @ApiProperty({ type: [classRef] })
    @Type(() => classRef)
    data: T[];

    @ApiProperty({ example: 100 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    lastPage: number;
  }

  return PaginatedDto;
}
