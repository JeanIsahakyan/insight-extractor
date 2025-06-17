import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ThemeController } from './theme.controller';
import { Feed } from '@app/database/entities/feed.entity';
import { Thesis } from '@app/database/entities/thesis.entity';
import { NlpService } from '../nlp/nlp.service';
import { ThemeService } from '../theme/theme.service';
import { Theme } from '@app/database/entities/theme.entity';
import { FeedService } from '@app/app/modules/feed/feed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feed, Thesis, Theme]),
    HttpModule,
  ],
  controllers: [ThemeController],
  providers: [FeedService, NlpService, ThemeService],
  exports: [FeedService],
})
export class ThemeModule {}
