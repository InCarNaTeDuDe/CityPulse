import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class NotificationItem {
  @PrimaryColumn('varchar')
  id!: string;

  @Column('varchar')
  text!: string;

  @Column('varchar')
  type!: string;

  @Column('varchar')
  timestamp!: string;

  @Column('boolean', { default: false })
  read!: boolean;

  @Column('varchar')
  userId!: string;
}
