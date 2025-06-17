import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Theme } from '@app/database/entities/theme.entity';
import { NlpService } from '../nlp/nlp.service';
import { ConfigService } from '@nestjs/config';

import { calculateCosineSimilarity } from '@app/utils/math';
import { Thesis } from '@app/database/entities/thesis.entity';

@Injectable()
export class ThemeService {
  private readonly logger = new Logger(ThemeService.name);

  constructor(
    @InjectRepository(Theme)
    private readonly themeRepository: Repository<Theme>,
    @InjectRepository(Thesis)
    private readonly thesisRepository: Repository<Thesis>,
    private readonly nlpService: NlpService,
  ) {
  }

  async findOrCreateTheme(thesisText: string): Promise<Theme> {
    const newEmbedding = await this.nlpService.getEmbedding(thesisText);
    const theses = await this.thesisRepository.find({
      relations: {
        theme: true,
      }
    });
    const thesesEmbeddings = await Promise.all(theses.map(async (thesis) => ({
      thesis,
      embedding: await this.nlpService.getEmbedding(thesis.thesis_text),
    })));
    let bestTheme: {theme: Theme, similarity: number} = {
      theme: undefined,
      similarity: 0,
    };

    for (const { thesis, embedding } of thesesEmbeddings) {
      if (!embedding) {
        continue;
      }
      const similarity = calculateCosineSimilarity(newEmbedding, embedding);
      this.logger.log(`Comparing thesis to theme ${thesis.id}: similarity ${similarity}`);
      if (similarity < this.nlpService.similarityThreshold) {
        continue;
      }
      if (similarity > bestTheme.similarity) {
        bestTheme = {
          similarity,
          theme: thesis.theme,
        };
      }
    }
    if (bestTheme.theme) {
      return bestTheme.theme;
    }
    const newTheme = this.themeRepository.create({
      canonical_thesis: thesisText,
    });

    this.logger.log(`Creating new theme for thesis: ${thesisText}`);
    return await this.themeRepository.save(newTheme);
  }

  async getAllThemes(page: number = 1, limit: number = 10): Promise<[number, Theme[]]> {
    const skip = (page - 1) * limit;
    const [themes, total] = await this.themeRepository.findAndCount({
      relations: ['theses'],
      skip,
      take: limit,
    });

    return [total, themes];
  }

  async getThemeById(id: string, page: number = 1, limit: number = 10): Promise<[number, Theme, Thesis[]]> {
    const theme = await this.themeRepository.findOne({
      where: { id },
    });
    if (!theme)  {
      throw new BadRequestException('theme not found');
    }

    const skip = (page - 1) * limit;
    const [theses, total] = await this.thesisRepository.findAndCount({
      where: {
        theme_id: id,
      },
      skip,
      take: limit,
      order: { published_at: 'ASC' },
    });

    return [
      total,
      theme,
      theses,
    ];
  }
}
