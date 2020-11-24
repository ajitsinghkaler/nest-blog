import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { User } from 'src/user/user/models/user.interface';
import { UserService } from 'src/user/user/service/user.service';
import { BlogEntry } from '../model/blog-entry.interface';
import { BlogService } from '../service/blog.service';

@Injectable()
export class UserIsAuthorGaurd implements CanActivate {
  constructor(
    private userService: UserService,
    private blogService: BlogService,
  ) {}
  canActivate(context: ExecutionContext): Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const params = request.params;
    const blogEntryId = Number(params.id);
    const user: User = request.user;
    return this.userService.findOne(user.id).pipe(
      switchMap((user: User) => {
        return this.blogService.findOne(blogEntryId).pipe(
          map((blogEntry: BlogEntry) => {
            console.log(user, blogEntry);
            let hasPermission = false;
            if (user.id === blogEntry?.author?.id) {
              hasPermission = true;
            }
            return user && hasPermission;
          }),
        );
      }),
    );
  }
}
