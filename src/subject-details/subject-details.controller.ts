import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SubjectDetailsService } from './subject-details.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateSubjectDetailDto } from './dto/create-subject-detail.dto';
import { UpdateSubjectDetailDto } from './dto/update-subject-detail.dto';

@ApiTags('Subject Details')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subject-details')
export class SubjectDetailsController {
  constructor(private readonly service: SubjectDetailsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new subject detail' })
  @ApiResponse({ status: 201, description: 'Subject detail created' })
  create(@Body() dto: CreateSubjectDetailDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subject details' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subject detail by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update subject detail by ID' })
  update(@Param('id') id: string, @Body() dto: UpdateSubjectDetailDto) {
    return this.service.update(+id, dto);
  }

  @Get('professor/:professorId')
  @ApiOperation({
    summary: 'Get all subject details for a specific professor',
    description:
      'Retrieves all subject assignments (subject-details) for a professor including subject info, schedules, and advisories',
  })
  @ApiResponse({
    status: 200,
    description: 'Subject details found successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          subject_detail_id: { type: 'number' },
          subject_id: { type: 'number' },
          professor_id: { type: 'number' },
          subject: {
            type: 'object',
            properties: {
              subject_id: { type: 'number' },
              subject: { type: 'string' },
            },
          },
          schedules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                subject_schedule_id: { type: 'number' },
                day: {
                  type: 'string',
                  enum: [
                    'MONDAY',
                    'TUESDAY',
                    'WEDNESDAY',
                    'THURSDAY',
                    'FRIDAY',
                    'SATURDAY',
                    'SUNDAY',
                  ],
                },
                start_time: { type: 'string', example: '08:00' },
                end_time: { type: 'string', example: '10:00' },
              },
            },
          },
          advisories: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                advisory_id: { type: 'number' },
                max_capacity: { type: 'number' },
                created_at: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Professor not found' })
  async findByProfessor(@Param('professorId') professorId: string) {
    return this.service.findByProfessor(+professorId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subject detail by ID' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
