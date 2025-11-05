import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { RequestWithUser } from '../auth/types/request-with-user';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user-role.enum';
import { InvitationService } from '../advisories/services/invitation.service';
import { RespondInvitationDto } from '../advisories/dto/invitation.dto';
import { InvitationStatus } from '../advisories/entities/student-invitation.entity';

@ApiTags('Student Invitations')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('student-invitations')
export class StudentInvitationsController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get('my-invitations')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Obtener mis invitaciones',
    description: 'Obtiene todas las invitaciones del estudiante autenticado',
  })
  @ApiQuery({
    name: 'status',
    enum: InvitationStatus,
    required: false,
    description: 'Filtrar por estado de invitación',
  })
  @ApiOkResponse({ description: 'Invitaciones obtenidas exitosamente' })
  async getMyInvitations(
    @Request() req: RequestWithUser,
    @Query('status') status?: InvitationStatus,
  ) {
    try {
      const studentId = req.user.user_id;
      return await this.invitationService.getStudentInvitations(
        studentId,
        status,
      );
    } catch (error) {
      console.error('Error al obtener invitaciones del estudiante:', error);
      throw error;
    }
  }

  @Post(':invitationId/respond')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Responder a invitación',
    description: 'Permite al estudiante aceptar o rechazar una invitación',
  })
  @ApiCreatedResponse({ description: 'Respuesta enviada exitosamente' })
  @ApiBadRequestResponse({ description: 'Invitación ya respondida o expirada' })
  @ApiNotFoundResponse({ description: 'Invitación no encontrada' })
  async respondToInvitation(
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @Body() dto: RespondInvitationDto,
    @Request() req: RequestWithUser,
  ) {
    try {
      const studentId = req.user.user_id;
      return await this.invitationService.respondToInvitation(
        invitationId,
        dto,
        studentId,
      );
    } catch (error) {
      console.error('Error al responder invitación:', error);
      throw error;
    }
  }

  @Get(':invitationId')
  @Roles(UserRole.STUDENT)
  @ApiOperation({
    summary: 'Obtener detalle de invitación',
    description: 'Obtiene los detalles de una invitación específica',
  })
  @ApiOkResponse({ description: 'Detalle de invitación obtenido exitosamente' })
  @ApiNotFoundResponse({ description: 'Invitación no encontrada' })
  async getInvitationDetail(
    @Param('invitationId', ParseIntPipe) invitationId: number,
    @Request() req: RequestWithUser,
  ) {
    try {
      const studentId = req.user.user_id;
      // Obtener todas las invitaciones del estudiante y filtrar por ID
      const invitations =
        await this.invitationService.getStudentInvitations(studentId);
      const invitation = invitations.find(
        (inv) => inv.invitation_id === invitationId,
      );

      if (!invitation) {
        throw new Error('Invitation not found or not authorized');
      }

      return invitation;
    } catch (error) {
      console.error('Error al obtener detalle de invitación:', error);
      throw error;
    }
  }
}
