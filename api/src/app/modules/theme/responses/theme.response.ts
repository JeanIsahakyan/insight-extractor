import { ApiProperty } from '@nestjs/swagger';
import { ThesisResponse } from '@app/app/modules/theme/responses/thesis.response';
import { Theme } from '@app/database/entities/theme.entity';

export class ThemeResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  canonical_thesis: string;

  @ApiProperty({ type: [ThesisResponse] })
  theses: ThesisResponse[];

  @ApiProperty()
  post_count?: number;

  constructor(theme: Theme, post_count?: number) {
    this.id = theme.id;
    this.post_count = post_count;
    this.canonical_thesis = theme.canonical_thesis;
    this.theses = theme.theses.map((thesis) => new ThesisResponse(thesis));
  }
}
