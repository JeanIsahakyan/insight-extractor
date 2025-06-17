import { Controller, Post, Body } from '@nestjs/common';
import { FeedService } from './feed.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InputFeedDto } from '@app/app/modules/feed/dto/input-feed.dto';
import { FeedResponse } from '@app/app/modules/feed/responses/feed.response';

@ApiTags('Feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new RSS feed' })
  @ApiResponse({ status: 201, description: 'Feed added successfully', type: FeedResponse })
  async addFeed(@Body() addFeedDto: InputFeedDto): Promise<FeedResponse> {
    const response =  await this.feedService.addFeed(addFeedDto.url);
    return new FeedResponse(response);
  }

  @Post('/ingest')
  @ApiOperation({ summary: 'Ingest an RSS feed' })
  @ApiResponse({ status: 201, description: 'Feed ingestion finished' })
  async ingest(@Body() ingestFeedDto: InputFeedDto): Promise<void> {
    await this.feedService.ingestFeed(ingestFeedDto.url);
  }
}
