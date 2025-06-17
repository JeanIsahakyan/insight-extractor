import { ApiProperty } from '@nestjs/swagger';
import { Feed } from '@app/database/entities/feed.entity';
import { FeedResponse } from '@app/app/modules/feed/responses/feed.response';

export class FeedsResponse {
  @ApiProperty({
    type: [FeedResponse]
  })
  items: FeedResponse[];

  @ApiProperty()
  url: string;

  @ApiProperty()
  added_at: Date;

  constructor(items: Feed[]) {
    this.items = items.map((feed) => new FeedResponse(feed));
  }
}
