import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, switchMapTo } from 'rxjs/operators';
import { AuthService } from 'src/auth/service/auth.service';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../models/user.entity';
import { User, UserRole } from '../models/user.interface';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class UserService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  create(user: User): Observable<User> {
    return this.authService.hashPassword(user.password).pipe(
      switchMap((hash: string) => {
        const newUser = new UserEntity();
        newUser.name = user.name;
        newUser.email = user.email;
        newUser.username = user.username;
        newUser.password = hash;
        newUser.role = UserRole.USER;
        return from(this.userRepository.save(newUser)).pipe(
          map((user: User) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...result } = user;
            return result;
          }),
          catchError((err) => throwError(err)),
        );
      }),
    );
  }

  findOne(id: number): Observable<User> {
    return from(this.userRepository.findOne({ id })).pipe(
      map((user: User) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }),
      catchError((err) => throwError(err)),
    );
  }

  findAll(): Observable<User[]> {
    return from(this.userRepository.find()).pipe(
      map((users: User[]) => {
        users.forEach(function (v) {
          delete v.password;
        });
        return users;
      }),
    );
  }

  paginate(options: IPaginationOptions): Observable<Pagination<User>> {
    return from(paginate(this.userRepository, options)).pipe(
      map((usersPageAble: Pagination<User>) => {
        usersPageAble.items.forEach(function (v) {
          delete v.password;
        });
        return usersPageAble;
      }),
    );
  }

  paginateByUsername(
    options: IPaginationOptions,
    user: User,
  ): Observable<Pagination<User>> {
    return from(
      this.userRepository.findAndCount({
        skip: (options.page - 1) * options.limit,
        take: options.limit || 10,
        order: { id: 'ASC' },
        select: ['id', 'email', 'role', 'name', 'username'],
        where: [
          {
            username: Like(`%${user.username}%`),
          },
        ],
      }),
    ).pipe(
      map(([users, totalUsers]) => {
        const usersPageAble: Pagination<User> = {
          items: users,
          links: {
            first: options.route + `?limit=${options.limit}`,
            previous:
              options.page - 1 > 0
                ? options.route +
                  `?limit=${options.limit}&page=${options.page - 1}`
                : '',
            next:
              options.page + 1 > Math.ceil(totalUsers / options.limit)
                ? ''
                : options.route +
                  `?limit=${options.limit}&page=${options.page + 1}`,
            last:
              options.route +
              `?limit=${options.limit}&page=${Math.ceil(
                totalUsers / options.limit,
              )}`,
          },
          meta: {
            currentPage: options.page,
            itemCount: users.length,
            totalItems: totalUsers,
            itemsPerPage: options.limit,
            totalPages: Math.ceil(totalUsers / options.limit),
          },
        };
        return usersPageAble;
      }),
    );
  }

  updateOne(id: number, user: User): Observable<User> {
    delete user.email;
    delete user.role;
    delete user.password;
    return from(this.userRepository.update(id, user)).pipe(
      switchMapTo(this.findOne(id)),
    );
  }

  deleteOne(id: number): Observable<any> {
    return from(this.userRepository.delete(id));
  }

  login(user: User): Observable<string> {
    return this.validateUser(user.email, user.password).pipe(
      switchMap((user: User) => {
        if (user) {
          return this.authService.generateJWT(user);
        } else {
          return 'Wrong Credentials';
        }
      }),
    );
  }

  validateUser(email: string, password: string): Observable<User> {
    return this.findByMail(email, {
      select: ['id', 'email', 'role', 'name', 'username', 'password'],
    }).pipe(
      switchMap((user: User) =>
        this.authService.comparePassword(password, user.password).pipe(
          map((match: boolean) => {
            if (match) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { password, ...result } = user;
              return result;
            } else {
              throw Error;
            }
          }),
        ),
      ),
    );
  }

  findByMail(email: string, options?: any) {
    return from(
      this.userRepository.findOne(
        {
          email,
        },
        options,
      ),
    );
  }

  updateRole(id: number, user: User): Observable<any> {
    return from(this.userRepository.update(id, user));
  }
}
