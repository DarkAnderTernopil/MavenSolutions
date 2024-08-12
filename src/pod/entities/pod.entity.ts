import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  PrimaryColumn,
  Index,
} from 'typeorm';

@Entity()
export class Pod {
  @Index({ unique: true })
  @PrimaryColumn()
  name: string;

  @Column()
  namespace: string;

  @Column()
  status: string;

  @Column()
  resourceVersion: string;

  @Column()
  uid: string;
}
