import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubjectSchedulesService } from './subject-schedules.service';
import { CreateSubjectScheduleDto } from './dto/create-subject-schedule.dto';
import { UpdateSubjectScheduleDto } from './dto/update-subject-schedule.dto';

@Controller('subject-schedules')
export class SubjectSchedulesController {
  constructor(private readonly subjectSchedulesService: SubjectSchedulesService) {}

  @Post()
  create(@Body() createSubjectScheduleDto: CreateSubjectScheduleDto) {
    return this.subjectSchedulesService.create(createSubjectScheduleDto);
  }

  @Get()
  findAll() {
    return this.subjectSchedulesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectSchedulesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubjectScheduleDto: UpdateSubjectScheduleDto) {
    return this.subjectSchedulesService.update(+id, updateSubjectScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectSchedulesService.remove(+id);
  }
}
