import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdvisoryDatesService } from './advisory-dates.service';
import { CreateAdvisoryDateDto } from './dto/create-advisory-date.dto';
import { UpdateAdvisoryDateDto } from './dto/update-advisory-date.dto';

@Controller('advisory-dates')
export class AdvisoryDatesController {
  constructor(private readonly advisoryDatesService: AdvisoryDatesService) {}

  @Post()
  create(@Body() createAdvisoryDateDto: CreateAdvisoryDateDto) {
    return this.advisoryDatesService.create(createAdvisoryDateDto);
  }

  @Get()
  findAll() {
    return this.advisoryDatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advisoryDatesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdvisoryDateDto: UpdateAdvisoryDateDto) {
    return this.advisoryDatesService.update(+id, updateAdvisoryDateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.advisoryDatesService.remove(+id);
  }
}
