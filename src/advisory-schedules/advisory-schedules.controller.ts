import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdvisorySchedulesService } from './advisory-schedules.service';
import { CreateAdvisoryScheduleDto } from './dto/create-advisory-schedule.dto';
import { UpdateAdvisoryScheduleDto } from './dto/update-advisory-schedule.dto';

@Controller('advisory-schedules')
export class AdvisorySchedulesController {
  constructor(private readonly advisorySchedulesService: AdvisorySchedulesService) {}

  @Post()
  create(@Body() createAdvisoryScheduleDto: CreateAdvisoryScheduleDto) {
    return this.advisorySchedulesService.create(createAdvisoryScheduleDto);
  }

  @Get()
  findAll() {
    return this.advisorySchedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advisorySchedulesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdvisoryScheduleDto: UpdateAdvisoryScheduleDto) {
    return this.advisorySchedulesService.update(+id, updateAdvisoryScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.advisorySchedulesService.remove(+id);
  }
}
