import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Ticket {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar')
  title!: string;

  @Column('varchar')
  category!: string;

  @Column('float')
  originalPrice!: number;

  @Column('float')
  sellingPrice!: number;

  @Column('float')
  connectFee!: number;

  @Column('varchar')
  sellerId!: string;

  @Column('varchar')
  sellerName!: string;

  @Column('varchar')
  sellerAvatar!: string;

  @Column('float')
  sellerRating!: number;

  @Column('int')
  quantity!: number;

  @Column('varchar')
  location!: string;

  @Column('varchar')
  distance!: string;

  @Column('boolean', { default: true })
  verified!: boolean;

  @Column('varchar')
  status!: string;
}
