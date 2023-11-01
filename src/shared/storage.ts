import {PlayerSkins, ServerPlayer, Storage, WeaponSkinDefinition} from "@/shared/types";

export class MemoryStorage extends Storage {
  private map: Map<number, Map<number, WeaponSkinDefinition>> = new Map();

  delete(steamId64: number, weaponId: number): void {
    this.map.get(steamId64)?.delete(weaponId);
  }

  fetch(steamId64: number): PlayerSkins {
    return new PlayerSkins(new ServerPlayer(steamId64), Array.from(this.map.get(steamId64)?.values() ?? []));
  }

  fetchAll(): PlayerSkins[] {
    return Array.from(this.map.keys())
        .map(this.fetch)
  }

  persist(steamId64: number, def: WeaponSkinDefinition): void {
    if (!this.map.has(steamId64)) {
      this.map.set(steamId64, new Map());
    }

    this.map.get(steamId64)!.set(def.weaponId, def);
  }

}

let storage: Storage | undefined = undefined;
if (typeof window === 'undefined') {
  storage = new MemoryStorage();
}

export const defaultStorage = storage;