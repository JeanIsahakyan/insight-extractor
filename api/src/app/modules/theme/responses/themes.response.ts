import { ApiProperty } from '@nestjs/swagger';
import { Theme } from '@app/database/entities/theme.entity';
import { ThemeResponse } from '@app/app/modules/theme/responses/theme.response';

export class ThemesResponse {
  @ApiProperty({ type: [ThemeResponse] })
  themes: ThemeResponse[];

  @ApiProperty()
  total: number;

  constructor(total: number, themes: Theme[]) {
    this.themes = themes.map((theme) => {
      const postsCount = theme.theses.length;
      theme.theses = theme.theses.slice(0, 2);
      return new ThemeResponse(theme, postsCount);
    });
    this.total = total;
  }
}
