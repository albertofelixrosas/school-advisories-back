import { PartialType } from '@nestjs/swagger';
import { CreateAdvisoryDateDto } from './create-advisory-date.dto';

export class UpdateAdvisoryDateDto extends PartialType(CreateAdvisoryDateDto) {}
