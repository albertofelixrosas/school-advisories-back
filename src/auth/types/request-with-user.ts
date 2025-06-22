import { Request } from 'express';
import { UserPayload } from '../interfaces/user-payload.interface';

export interface RequestWithUser extends Request {
  user: UserPayload;
}
