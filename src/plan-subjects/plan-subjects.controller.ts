import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PlanSubjectsService } from './plan-subjects.service';
import { CreatePlanSubjectDto } from './dto/create-plan-subject.dto';
import { UpdatePlanSubjectDto } from './dto/update-plan-subject.dto';

@Controller('plan-subjects')
export class PlanSubjectsController {
  constructor(private readonly planSubjectsService: PlanSubjectsService) {}

  @Post()
  create(@Body() createPlanSubjectDto: CreatePlanSubjectDto) {
    return this.planSubjectsService.create(createPlanSubjectDto);
  }

  @Get()
  findAll() {
    return this.planSubjectsService.findAll();
  }

  @Get('by-plan/:studyPlanId')
  findByPlan(@Param('studyPlanId', ParseIntPipe) studyPlanId: number) {
    return this.planSubjectsService.findByPlan(studyPlanId);
  }

  @Get('by-semester')
  findBySemester(
    @Query('studyPlanId', ParseIntPipe) studyPlanId: number,
    @Query('semester', ParseIntPipe) semester: number,
  ) {
    return this.planSubjectsService.findBySemester(studyPlanId, semester);
  }

  @Get('check-in-plan')
  async checkInPlan(
    @Query('studyPlanId', ParseIntPipe) studyPlanId: number,
    @Query('subjectId', ParseIntPipe) subjectId: number,
  ) {
    const isInPlan = await this.planSubjectsService.isSubjectInPlan(
      studyPlanId,
      subjectId,
    );
    return { isInPlan };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.planSubjectsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlanSubjectDto: UpdatePlanSubjectDto,
  ) {
    return this.planSubjectsService.update(id, updatePlanSubjectDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.planSubjectsService.remove(id);
  }
}
