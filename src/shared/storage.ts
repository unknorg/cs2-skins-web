import {PlayerSkins, ServerPlayer, Storage, WeaponSkinDefinition} from "@/shared/types";
import {initORM} from "@/shared/serverutils";
import {Account, Skin} from "@/shared/entities";
import {WeaponIds} from "@/shared/weaponid";

export class DatabaseStorage extends Storage {
  delete(accountId: number, weaponId: number): Promise<void> {
    return initORM().then(ds => ds.getRepository(Skin))
        .then(r => r.delete({
          account_id: accountId,
          weapon_name: WeaponIds[weaponId]
        }))
        .then(() => {
        })
  }

  fetch(accountId: number): Promise<PlayerSkins> {
    return initORM().then(ds => ds.getRepository(Account))
        .then(r => r.findOneBy({
          id: accountId
        }))
        .then(account => {
          if (!account) {
            throw new Error(`Account '${accountId}' not found`)
          }
          return this.fromAccount(account);
        })
  }

  persist(accountId: number, def: WeaponSkinDefinition): Promise<void> {
    return initORM().then(ds => ds.getRepository(Skin))
        .then(r => r.findOneBy({
          account_id: accountId,
          weapon_name: WeaponIds[def.weaponId]
        }).then(skin => skin ?? this.fromDef(accountId, def))
            .then(s => {
              s.skin_id = def.skinId;
              s.seed = def.seed;
              s.wear = def.wear;
              return s;
            })
            .then(s => r.save(s)))
        .then(() => {
        })
  }

  private async fromAccount(account: Account): Promise<PlayerSkins> {
    const skinDefs = account.skins.map(this.fromSkin);
    return new PlayerSkins(new ServerPlayer(account.id), skinDefs);
  }

  private fromSkin(skin: Skin): WeaponSkinDefinition {
    return new WeaponSkinDefinition(skin.weapon_name,
        WeaponIds[skin.weapon_name as keyof typeof WeaponIds],
        skin.skin_id,
        skin.seed,
        skin.wear);
  }

  private fromDef(accountId: number, def: WeaponSkinDefinition): Skin {
    const skin = new Skin();
    skin.account_id = accountId;
    skin.weapon_name = def.weaponName ?? WeaponIds[def.weaponId];
    skin.skin_id = def.skinId;
    skin.wear = def.wear;
    skin.seed = def.seed;
    return skin;
  }
}


let storage: Storage | undefined = undefined;
if (typeof window === 'undefined') {
  storage = new DatabaseStorage();
}

export const defaultStorage = storage;