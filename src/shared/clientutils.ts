import {CSGOAPI_Skin, WeaponSkinDefinition} from "@/shared/types";
import {WeaponIds} from "@/shared/weaponid";
import {Rarity} from "@/shared/rarity";

let weapons: Map<string, string> | undefined;
let skinsByWeapon: Map<string, Map<string, CSGOAPI_Skin>> | undefined;

let ongoingJsonPromise: Promise<CSGOAPI_Skin[]> | undefined;

export function getUserToken(): Promise<string> {
  return fetch("/api/v1/user/token")
      .then(res => res.json())
      .then(res => res.token);
}

export function getUserSkins(): Promise<Map<string, WeaponSkinDefinition>> {
  return fetch("/api/v1/skins")
      .then(res => res.json())
      .then((defs: WeaponSkinDefinition[]) => {
        const map = new Map<string, WeaponSkinDefinition>();
        defs.forEach(def => map.set(def.weaponName, def));
        return map;
      })
}

export function saveSkin(skinDef: WeaponSkinDefinition) {
  return fetch("/api/v1/editor", {
    method: 'POST',
    body: JSON.stringify(skinDef),
    headers: {
      'Content-Type': 'application/json'
    }
  });
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
    if (WeaponIds[weaponId as keyof typeof WeaponIds] === undefined) {
      continue;
    }

    if (!weapons.has(weaponId)) {
      weapons.set(weaponId, skin.weapon.name)
      skinsByWeapon.set(weaponId, new Map());
      // TODO: to rewrite
      skinsByWeapon.get(weaponId)!.set("0", {
        paint_index: "0",
        souvenir: false,
        stattrak: false,
        image: skin.image,
        rarity: {
          id: Rarity.rarity_none,
          name: "Default skin."
        },
        weapon: skin.weapon
      })
    }

    skinsByWeapon.get(weaponId)!.set(skin.paint_index, patchSkin(skin));
  }
}

function patchSkin(skin: CSGOAPI_Skin): CSGOAPI_Skin {
  return {
    ...skin,
    rarity: {
      id: Rarity[skin.rarity.id as unknown as keyof typeof Rarity],
      name: skin.rarity.name

    }
  }
}