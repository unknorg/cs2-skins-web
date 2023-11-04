import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm"

@Entity()
export class Account extends BaseEntity {
  constructor() {
    super();
    // Ugly but we are keeping "strictPropertyInitialization" enabled
    this.id = undefined as unknown as number;
    this.provider = undefined as unknown as string;
    this.name = undefined as unknown as string;
    this.email = undefined as unknown as string;
    this.skins = undefined as unknown as Skin[];
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  provider: string

  @Column()
  name: string

  @Column()
  email: string

  // TODO: investigate why lazy loading (skins: Promise<Skin[]>) resolves into undefined.
  @OneToMany(() => Skin, skin => skin.account, {eager: true})
  skins: Skin[]
}

@Entity()
export class Skin extends BaseEntity {
  constructor() {
    super();
    this.id = undefined as unknown as number;
    this.account_id = undefined as unknown as number;
    this.account = undefined as unknown as Account;
    this.weapon_name = undefined as unknown as string;
    this.skin_id = undefined as unknown as number;
    this.wear = undefined as unknown as number;
    this.seed = undefined as unknown as number;
  }

  @PrimaryGeneratedColumn()
  id: number

  @Column()
  account_id: number

  @ManyToOne(() => Account, account => account.skins)
  @JoinColumn({name: "account_id", referencedColumnName: "id"})
  account: Account

  @Column()
  weapon_name: string

  @Column()
  skin_id: number

  @Column()
  wear: number

  @Column()
  seed: number
}