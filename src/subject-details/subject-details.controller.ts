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
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user-role.enum';
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

  @Post('assign/:professorId/:subjectId')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign professor to subject (Admin only)' })
  @ApiResponse({ status: 201, description: 'Professor assigned successfully' })
  @ApiResponse({
    status: 400,
    description: 'Professor already assigned or validation error',
  })
  @ApiResponse({ status: 404, description: 'Professor or subject not found' })
  async assignProfessorToSubject(
    @Param('professorId') professorId: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.service.assignProfessorToSubject(+professorId, +subjectId);
  }

  @Get('subject/:subjectId/professors')
  @ApiOperation({ summary: 'Get all professors assigned to a subject' })
  @ApiResponse({
    status: 200,
    description: 'List of professors assigned to the subject',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          assignment_id: { type: 'number' },
          professor: {
            type: 'object',
            properties: {
              user_id: { type: 'number' },
              name: { type: 'string' },
              last_name: { type: 'string' },
              email: { type: 'string' },
            },
          },
          assignmentDetails: {
            type: 'object',
            properties: {
              assignment_id: { type: 'number' },
              active_advisories: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getSubjectProfessors(@Param('subjectId') subjectId: string) {
    return this.service.getSubjectProfessors(+subjectId);
  }

  @Get('admin/assignments/stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get assignment statistics by subject (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Assignment statistics for all subjects',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          subject: {
            type: 'object',
            properties: {
              subject_id: { type: 'number' },
              subject: { type: 'string' },
            },
          },
          professors_count: { type: 'number' },
          active_advisories_count: { type: 'number' },
          total_students_served: { type: 'number' },
        },
      },
    },
  })
  async getAssignmentStats() {
    return this.service.getAssignmentStatsBySubject();
  }

  @Get('check/:professorId/:subjectId')
  @ApiOperation({ summary: 'Check if professor is assigned to subject' })
  @ApiResponse({
    status: 200,
    description: 'Assignment status',
    schema: {
      type: 'object',
      properties: {
        isAssigned: { type: 'boolean' },
      },
    },
  })
  async checkAssignment(
    @Param('professorId') professorId: string,
    @Param('subjectId') subjectId: string,
  ) {
    const isAssigned = await this.service.isProfessorAssignedToSubject(
      +professorId,
      +subjectId,
    );
    return { isAssigned };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subject detail by ID' })
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
