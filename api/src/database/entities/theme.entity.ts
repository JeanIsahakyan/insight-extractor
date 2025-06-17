import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm';
import { Thesis } from './thesis.entity';

@Entity()
export class Theme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  canonical_thesis: string;

  @OneToMany(() => Thesis, (thesis) => thesis.theme)
  @JoinColumn({
    name: 'id',
  })
  theses: Thesis[];
}
