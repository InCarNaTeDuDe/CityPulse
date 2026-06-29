import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: true })
  phone?: string;

  @Column('varchar')
  name!: string;

  @Column('varchar', { nullable: true })
  email?: string;

  @Column('varchar', { nullable: true })
  avatar?: string;

  @Column('float', { nullable: true })
  rating?: number;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column('int', { default: 0 })
  activitiesJoinedCount!: number;

  @Column('int', { default: 0 })
  ticketsSoldCount!: number;

  @Column('int', { default: 0 })
  ticketsBoughtCount!: number;

  @Column('boolean', { default: true })
  identityVerified!: boolean;

  @Column('float', { default: 500 })
  walletBalance!: number;
}
