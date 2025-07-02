import { UserRole } from '../../users/user-role.enum';

export interface UserPayload {
  user_id: number;
  username: string;
  role: UserRole;
}
