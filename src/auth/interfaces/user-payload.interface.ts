import { UserRole } from '../../users/user-role.enum';

export interface UserPayload {
  id: number;
  username: string;
  role: UserRole;
}
