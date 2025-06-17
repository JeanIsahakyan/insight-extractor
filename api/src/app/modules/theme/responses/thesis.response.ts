import { ApiProperty } from '@nestjs/swagger';
import { Thesis } from '@app/database/entities/thesis.entity';

export class ThesisResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  thesis_text: string;

  @ApiProperty()
  post_title: string;

  @ApiProperty()
  post_url: string;

  @ApiProperty()
  published_at: Date;

  @ApiProperty()
  ingested_at: Date;

  constructor(thesis: Thesis) {
    this.ingested_at = thesis.ingested_at;
    this.id = thesis.id;
    this.thesis_text = thesis.thesis_text;
    this.post_title = thesis.post_title;
    this.post_url = thesis.post_url;
    this.published_at = thesis.published_at;
  }
}

