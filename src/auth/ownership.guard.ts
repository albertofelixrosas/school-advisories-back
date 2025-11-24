import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../users/user-role.enum';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    // Solo aplica para profesores
    if (user.role === UserRole.PROFESSOR) {
      // Si el endpoint tiene :professorId, debe coincidir con el user_id
      if (params.professorId && Number(params.professorId) !== user.user_id) {
        throw new ForbiddenException('No puedes acceder a recursos de otros profesores.');
      }
    }
    return true;
  }
}
