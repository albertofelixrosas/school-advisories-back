import { Injectable } from '@nestjs/common';
import { CreateAdvisoryDateDto } from './dto/create-advisory-date.dto';
import { UpdateAdvisoryDateDto } from './dto/update-advisory-date.dto';

@Injectable()
export class AdvisoryDatesService {
  create(createAdvisoryDateDto: CreateAdvisoryDateDto) {
    return 'This action adds a new advisoryDate';
  }

  findAll() {
    return `This action returns all advisoryDates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} advisoryDate`;
  }

  update(id: number, updateAdvisoryDateDto: UpdateAdvisoryDateDto) {
    return `This action updates a #${id} advisoryDate`;
  }

  remove(id: number) {
    return `This action removes a #${id} advisoryDate`;
  }
}
