import {CSGOAPI_Skin, WeaponSkinDefinition} from "@/shared/types";

let weapons: Map<string, string> | undefined;
let skinsByWeapon: Map<string, Map<string, CSGOAPI_Skin>> | undefined;

let ongoingJsonPromise: Promise<CSGOAPI_Skin[]> | undefined;

export function getUserSkins(): Promise<Map<string, WeaponSkinDefinition>> {
  return fetch("/api/skins")
      .then(res => res.json())
      .then((defs: WeaponSkinDefinition[]) => {
        const map = new Map<string, WeaponSkinDefinition>();
        defs.forEach(def => map.set(def.weaponName, def));
        return map;
      })
}

export function getWeapons(): Promise<Map<string, string>> {
  if (weapons !== undefined) {
    return Promise.resolve(weapons);
  }

  return getSkinsFromAPI()
      .then(buildSkinsMap)
      .then(() => weapons!);
}

export function getAllSkins(): Promise<Map<string, Map<string, CSGOAPI_Skin>>> {
  if (skinsByWeapon !== undefined) {
    return Promise.resolve(skinsByWeapon);
  }

  return getSkinsFromAPI()
      .then(buildSkinsMap)
      .then(() => skinsByWeapon!);
}

export function getSkinsForWeapon(weaponId: string): Promise<Map<string, CSGOAPI_Skin>> {
  if (skinsByWeapon !== undefined) {
    return Promise.resolve(skinsByWeapon.get(weaponId)!);
  }

  return getSkinsFromAPI()
      .then(buildSkinsMap)
      .then(() => skinsByWeapon!.get(weaponId)!);
}

function getSkinsFromAPI(): Promise<CSGOAPI_Skin[]> {
  if (!ongoingJsonPromise) {
    ongoingJsonPromise = fetch("https://bymykel.github.io/CSGO-API/api/en/skins.json")
        .then(r => r.json())
        .then(arr => {
          ongoingJsonPromise = undefined;
          return arr;
        })
  }

  return ongoingJsonPromise;
}

function buildSkinsMap(skins: CSGOAPI_Skin[]): void {
  weapons = new Map<string, string>();
  skinsByWeapon = new Map<string, Map<string, CSGOAPI_Skin>>();

  for (const skin of skins) {
    const weaponId = skin.weapon.id;
    if (!weapons.has(weaponId)) {
      weapons.set(weaponId, skin.weapon.name)
      skinsByWeapon.set(weaponId, new Map());
      // TODO: to rewrite
      skinsByWeapon.get(weaponId)!.set("0", {
        paint_index: "0",
        souvenir: false,
        stattrak: false,
        image: skin.image,
        rarity: skin.rarity,
        weapon: skin.weapon
      })
    }

    skinsByWeapon.get(weaponId)!.set(skin.paint_index, skin);
  }
}