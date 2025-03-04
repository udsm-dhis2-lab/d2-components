import { User } from './user.model';

export class CurrentUser extends User {
  authorities!: string[];
}
