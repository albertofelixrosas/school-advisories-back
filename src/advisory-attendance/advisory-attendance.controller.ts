import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdvisoryAttendanceService } from './advisory-attendance.service';
import { CreateAdvisoryAttendanceDto } from './dto/create-advisory-attendance.dto';
import { UpdateAdvisoryAttendanceDto } from './dto/update-advisory-attendance.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Advisory Attendance')
@Controller('advisory-attendance')
export class AdvisoryAttendanceController {
  constructor(
    private readonly advisoryAttendanceService: AdvisoryAttendanceService,
  ) {}

  @Post()
  create(@Body() createAdvisoryAttendanceDto: CreateAdvisoryAttendanceDto) {
    return this.advisoryAttendanceService.create(createAdvisoryAttendanceDto);
  }

  @Get()
  findAll() {
    return this.advisoryAttendanceService.findAll();
  }

  @Get('advisory/:advisory_date_id')
  findByAdvisory(@Param('advisory_date_id') advisory_date_id: number) {
    return this.advisoryAttendanceService.findByAdvisory(advisory_date_id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advisoryAttendanceService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdvisoryAttendanceDto: UpdateAdvisoryAttendanceDto,
  ) {
    return this.advisoryAttendanceService.update(
      +id,
      updateAdvisoryAttendanceDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.advisoryAttendanceService.remove(+id);
  }
}
