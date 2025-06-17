import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, Index, JoinTable, JoinColumn } from 'typeorm';
import { Theme } from './theme.entity';

@Entity('thesis')
export class Thesis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  theme_id: string;

  @Column()
  thesis_text: string;

  @Column()
  post_title: string;

  @Column()
  @Index({ unique: true })
  post_url: string;

  @Column()
  published_at: Date;

  @Column()
  ingested_at: Date;

  @ManyToOne(() => Theme, (theme) => theme.theses)
  @JoinColumn({
    name: 'theme_id',
  })
  theme: Theme;
}
