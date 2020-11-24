import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/user/user/models/user.interface';
import { UserService } from 'src/user/user/service/user.service';

@Injectable()
export class UserIsUserGaurd implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService)) private userService: UserService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    console.log(params);
    const user: User = request.user;
    return this.userService.findOne(user.id).pipe(
      map((user: User) => {
        let hasPermission = false;
        console.log(user.id);
        if (user.id === Number(params.id)) {
          hasPermission = true;
        }
        return user && hasPermission;
      }),
    );
  }
}