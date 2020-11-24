import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/user/user/models/user.interface';
import { Repository } from 'typeorm';
import { BlogEntryEntity } from '../model/blog-entry.entity';
import { BlogEntry } from '../model/blog-entry.interface';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const slugify = require('slugify');

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntryEntity)
    private readonly blogRepository: Repository<BlogEntryEntity>,
  ) {}

  create(user: User, blogEntry: BlogEntry): Observable<BlogEntry> {
    blogEntry.author = user;
    return this.generateSlug(blogEntry.title).pipe(
      switchMap((slug: string) => {
        blogEntry.slug = slug;
        return this.blogRepository.save(blogEntry);
      }),
    );
  }

  generateSlug(title: string): Observable<string> {
    return of(slugify(title));
  }

  findAll(): Observable<BlogEntry[]> {
    return from(this.blogRepository.find({ relations: ['author'] }));
  }

  findByUser(userId: number): Observable<BlogEntry[]> {
    return from(
      this.blogRepository.find({
        where: { author: userId },
      }),
    );
  }

  findOne(id) {
    return from(
      this.blogRepository.findOne(
        {
          id,
        },
        { relations: ['author'] },
      ),
    );
  }
}
