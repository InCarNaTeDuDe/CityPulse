import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ChatMessage } from '@/src/shared/types';

@Entity()
export class Conversation {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar')
  type!: string;

  @Column('varchar')
  targetId!: string;

  @Column('varchar')
  targetTitle!: string;

  @Column('varchar')
  partnerId!: string;

  @Column('varchar')
  partnerName!: string;

  @Column('varchar')
  partnerAvatar!: string;

  @Column('float')
  partnerRating!: number;

  @Column('varchar')
  lastMessage!: string;

  @Column('varchar')
  timestamp!: string;

  @Column('boolean', { default: false })
  unread!: boolean;

  @Column('simple-json')
  messages!: ChatMessage[];

  @Column('varchar')
  userId!: string;
}
