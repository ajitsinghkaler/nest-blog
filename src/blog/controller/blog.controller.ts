import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/user/user/models/user.interface';
import { UserIsAuthorGaurd } from '../gaurds/user-is-author.gaurds';
import { BlogEntry } from '../model/blog-entry.interface';
import { BlogService } from '../service/blog.service';

export const BLOG_ENTRIES_URL = 'localhost:3000/api/v1/blogs/';
@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() blogEntry: BlogEntry, @Request() req): Observable<BlogEntry> {
    const user: User = req.user;
    return this.blogService.create(user, blogEntry);
  }

  @Get(``)
  paginateAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    console.log(limit, page);
    limit = limit > 100 ? 100 : limit;
    return this.blogService.paginateAll({
      limit: Number(limit),
      page: Number(page),
      route: BLOG_ENTRIES_URL,
    });
  }

  @Get('user/:userId')
  paginateByUser(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Param('userId') userId: number,
  ) {
    console.log(limit, page);
    limit = limit > 100 ? 100 : limit;
    return this.blogService.paginateByUser(
      {
        limit: Number(limit),
        page: Number(page),
        route: BLOG_ENTRIES_URL,
      },
      Number(userId),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: number): Observable<BlogEntry> {
    return this.blogService.findOne(id);
  }
  @UseGuards(JwtAuthGuard, UserIsAuthorGaurd)
  @Put(':id')
  updateOne(
    @Param('id') id: number,
    @Body() blogEntry: BlogEntry,
  ): Observable<BlogEntry> {
    return this.blogService.updateOne(id, blogEntry);
  }

  @UseGuards(JwtAuthGuard, UserIsAuthorGaurd)
  @Delete(':id')
  deleteOne(@Param('id') id: number): Observable<any> {
    return this.blogService.deleteOne(id);
  }
}
