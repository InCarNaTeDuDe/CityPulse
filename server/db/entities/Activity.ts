import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Activity {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar')
  title!: string;

  @Column('varchar')
  category!: string;

  @Column('text')
  description!: string;

  @Column('varchar')
  creatorId!: string;

  @Column('varchar')
  creatorName!: string;

  @Column('varchar')
  creatorAvatar!: string;

  @Column('float')
  creatorRating!: number;

  @Column('int')
  peopleJoined!: number;

  @Column('int')
  peopleNeeded!: number;

  @Column('simple-json')
  joinedUsers!: { id: string; name: string; avatar: string }[];

  @Column('varchar')
  time!: string;

  @Column('varchar')
  location!: string;

  @Column('varchar')
  distance!: string;
}
