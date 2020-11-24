import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { BlogEntryEntity } from './model/blog-entry.entity';
import { BlogController } from './controller/blog.controller';
import { BlogService } from './service/blog.service';
import { UserIsAuthorGaurd } from './gaurds/user-is-author.gaurds';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntryEntity]),
    AuthModule,
    UserModule,
  ],
  controllers: [BlogController],
  providers: [BlogService, UserIsAuthorGaurd],
})
export class BlogModule {}
