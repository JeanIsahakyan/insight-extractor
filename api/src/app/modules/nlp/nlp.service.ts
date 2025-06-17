import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { calculateCosineSimilarity } from '@app/utils/math';
import { AutoTokenizer, PreTrainedModel, PreTrainedTokenizer, AutoModel } from '@xenova/transformers';

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);
  protected model: PreTrainedModel;
  protected tokenizer: PreTrainedTokenizer;
  private readonly maxSentences: number;
  public readonly similarityThreshold: number;

  constructor(private readonly configService: ConfigService) {
    this.maxSentences = configService.get<number>('MAX_SENTENCES', 2);
    this.similarityThreshold = configService.get<number>('COSINE_SIMILARITY_THRESHOLD');
    this.initialize().catch(this.logger.error);
  }

  private async initialize(): Promise<void> {
    this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/all-MiniLM-L6-v2');
    this.model = await AutoModel.from_pretrained('Xenova/all-MiniLM-L6-v2');
  }


  private tokenizeSentences(text: string): string[] {
    return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 200);
  }

  async extractThesis(content: string): Promise<string[]> {
    try {
      const sentences = this.tokenizeSentences(content);
      if (sentences.length === 0) {
        this.logger.warn('No valid sentences found in content');
        return [];
      }
      if (sentences.length <= this.maxSentences) {
        return await this.handleFewSentences(sentences);
      }

      return await this.selectTopSentences(sentences, content);
    } catch (error) {
      this.logger.error(`Failed to extract thesis: ${error.message}`);
      return [];
    }
  }

  private async handleFewSentences(sentences: string[]): Promise<string[]> {
    if (sentences.length < this.maxSentences) {
      return sentences;
    }

    const embeddings = await this.getEmbeddings(sentences);
    if (embeddings.length === 0 || !Array.isArray(embeddings[0])) {
      this.logger.error('Invalid embeddings for few sentences');
      return [sentences[0]];
    }

    const similarity = calculateCosineSimilarity(embeddings[0], embeddings[1]);
    if (similarity > this.similarityThreshold) {
      this.logger.debug(`Filtered similar sentences: ${sentences[0]}`);
      return [sentences[0]];
    }

    return sentences;
  }

  private async selectTopSentences(sentences: string[], content: string): Promise<string[]> {
    const [docEmbedding, sentenceEmbeddings] = await Promise.all([
      this.getEmbedding(content),
      this.getEmbeddings(sentences),
    ]);
    if (!docEmbedding.length || !sentenceEmbeddings.length || !Array.isArray(sentenceEmbeddings[0])) {
      this.logger.error('Invalid embeddings for sentence selection');
      return [sentences[0]];
    }

    const similarities = (sentenceEmbeddings).map(sentEmb =>
      calculateCosineSimilarity(docEmbedding, sentEmb),
    );

    const topIndices = similarities
    .map((sim, idx) => ({ sim, idx }))
    .sort((a, b) => b.sim - a.sim)
    .slice(0, this.maxSentences)
    .map(item => item.idx);

    const pickedSentences = topIndices.map(idx => sentences[idx]);

    if (pickedSentences.length === this.maxSentences) {
      const pickEmbeddings = await this.getEmbeddings(pickedSentences);
      if (pickEmbeddings.length === 0 || !Array.isArray(pickEmbeddings[0])) {
        this.logger.error('Invalid embeddings for picked sentences');
        return [pickedSentences[0]];
      }

      const similarity = calculateCosineSimilarity(
        pickEmbeddings[0],
        pickEmbeddings[1],
      );
      if (similarity > this.similarityThreshold) {
        this.logger.debug(`Filtered similar top sentences: ${pickedSentences[0]}`);
        return [pickedSentences[0]];
      }
    }

    return pickedSentences;
  }

  async getEmbeddings(texts: string[]): Promise<Float32Array[]> {
    return await Promise.all(texts.map(async (text) => await this.getEmbedding(text)));
  }

  async getEmbedding(text: string): Promise<Float32Array> {
    try {
      const inputs = this.tokenizer(text, {
        padding: true,
        truncation: true,
        max_length: 128,
        return_tensors: 'pt',
      })
      const outputs = await this.model(inputs);
      return outputs?.last_hidden_state?.data as Float32Array;
    } catch (error) {
      this.logger.error(`Failed to get embedding: ${error.message}`);
      return new Float32Array();
    }
  }
}
