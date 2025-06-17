import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { ThemeService } from './theme.service';
import { ApiOperation, ApiResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ThemeResponse } from '@app/app/modules/theme/responses/theme.response';
import { ThemesResponse } from '@app/app/modules/theme/responses/themes.response';

@ApiTags('themes')
@Controller('themes')
export class ThemeController {
  private readonly logger = new Logger(ThemeController.name);

  constructor(private readonly themeService: ThemeService) {}

  @Get()
  @ApiOperation({ summary: 'List all themes with post counts' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Paginated list of themes', type: ThemesResponse })
  async getAllThemes(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<ThemesResponse> {
    this.logger.log(`Fetching themes, page: ${page}, limit: ${limit}`);
    const [total, themes] = await this.themeService.getAllThemes(page, limit);
    return new ThemesResponse(total, themes);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get timeline for a specific theme' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiResponse({ status: 200, type: ThemeResponse })
  async getTheme(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<ThemeResponse> {
    this.logger.log(`Fetching theme ${id}`);
    const [total, theme, theses] = await this.themeService.getThemeById(id, page, limit);
    return new ThemeResponse({
      ...theme,
      theses,
    }, total);
  }
}
