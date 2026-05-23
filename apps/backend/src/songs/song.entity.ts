import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { CreateSongDto, Timestamps } from 'shared';

@Entity('songs')
export class Song implements CreateSongDto, Timestamps<Date> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  artist!: string;

  @Column({ nullable: true })
  key!: string;

  @Column({ nullable: true })
  bpm!: number;

  @Column({ type: 'text', nullable: true })
  content!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}