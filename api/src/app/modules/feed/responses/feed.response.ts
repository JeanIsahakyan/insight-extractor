import { ApiProperty } from '@nestjs/swagger';
import { Feed } from '@app/database/entities/feed.entity';

export class FeedResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  added_at: Date;

  constructor(feed: Feed) {
    this.url = feed.url;
    this.added_at = feed.added_at;
  }
}
