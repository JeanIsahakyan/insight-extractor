import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Thesis } from '@app/database/entities/thesis.entity';
import { Feed } from '@app/database/entities/feed.entity';
import * as Parser from 'rss-parser';
import { NlpService } from '../nlp/nlp.service';
import { ThemeService } from '../theme/theme.service';
import { ConfigService } from '@nestjs/config';
import * as cheerio from 'cheerio';
import { Cron, CronExpression } from '@nestjs/schedule';


@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);
  private readonly parser = new Parser();

  constructor(
    @InjectRepository(Thesis)
    private readonly thesisRepository: Repository<Thesis>,
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    private readonly nlpService: NlpService,
    private readonly themeService: ThemeService,
    private readonly configService: ConfigService,
  ) {}



  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Starting scheduled feed ingestion');
    const feeds = await this.feedRepository.find();
    const defaultFeedUrl = this.configService.get<string>('FEED_URL');

    if (defaultFeedUrl && !feeds.some(feed => feed.url === defaultFeedUrl)) {
      feeds.push({ id: '', url: defaultFeedUrl, added_at: new Date() });
    }

    if (!feeds.length) {
      this.logger.warn('No feeds configured for scheduled ingestion');
      return;
    }

    for (const feed of feeds) {
      await this.ingestFeed(feed.url);
    }
  }

  async addFeed(url: string): Promise<Feed> {
    this.logger.log(`Adding new feed: ${url}`);
    const existingFeed = await this.feedRepository.findOne({ where: { url } });
    if (existingFeed) {
      throw new BadRequestException(`Feed with URL ${url} already exists`);
    }

    const feed = this.feedRepository.create({
      url,
      added_at: new Date(),
    });

    return await this.feedRepository.save(feed);
  }

  async ingestFeed(feedUrl: string): Promise<void> {
    this.logger.log(`Fetching feed: ${feedUrl}`);
    try {
      const feed = await this.parser.parseURL(feedUrl);
      this.logger.log(`Found ${feed.items.length} posts`);

      for (const item of feed.items) {
        await this.processPost(item);
      }
    } catch (error) {
      this.logger.error(`Failed to process feed ${feedUrl}: ${error.message}`);
    }
  }

  private extractMainText(entry: any): string {
    let html = '';
    if (entry.content && Array.isArray(entry.content) && entry.content.length > 0) {
      html = entry.content[0].value || '';
    }
    if (html === '' && entry.summary) {
      html = entry.summary;
    }
    if (html === '') {
      return entry.title || '';
    }

    const $ = cheerio.load(html);
    return $('body').text().replace(/\s+/g, ' ').trim();
  }

  private async processPost(item: {[key: string]: any}): Promise<void> {
    const existing = await this.thesisRepository.findOne({ where: { post_url: item.link } });
    if (existing) {
      this.logger.log(`Skipping duplicate post: ${item.title}`);
      return;
    }

    const content = this.extractMainText(item);
    const thesisSentences = await this.nlpService.extractThesis(content);
    if (!thesisSentences.length) {
      this.logger.warn(`No thesis extracted for post: ${item.title}`);
      return;
    }
    const thesisText = thesisSentences.join(' ');
    const theme = await this.themeService.findOrCreateTheme(thesisText);

    const thesis = this.thesisRepository.create({
      thesis_text: thesisText,
      post_title: item.title,
      post_url: item.link,
      published_at: new Date(item.pubDate ?? undefined),
      ingested_at: new Date(),
      theme,
    });

    await this.thesisRepository.save(thesis);
    this.logger.log(`Saved thesis for post: ${item.title} under theme ${theme.id}`);
  }
}
