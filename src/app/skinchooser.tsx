"use client"

import WeaponDisplay from "@/components/weapon-display";
import VerticalScroll from "@/components/vertical-scroll";
import WeaponCustomizer from "@/components/weapon-customizer";
import {ReactNode, useEffect, useState} from "react";
import {getAllSkins, getUserSkins, getWeapons} from "@/shared/clientutils";
import {CSGOAPI_Skin} from "@/shared/types";
import {currentSkinsSlice, selectSkinDefs, useDispatch, useSelector} from "@/lib/redux";

export default function SkinChooser() {
  // TODO: excuse this spaghetti for now...
  const dispatch = useDispatch();
  const skinDefinitions = useSelector(selectSkinDefs)

  const [loaded, setLoaded] = useState(false);

  const [weapons, setWeapons] = useState<Map<string, string>>();
  const [selectedWeapon, setSelectedWeapon] = useState("weapon_deagle");
  const [weaponSkins, setWeaponSkins] = useState<Map<string, Map<string, CSGOAPI_Skin>>>()

  const [displays, setDisplays] = useState<[string, ReactNode][]>([])

  // Init weapons and user skins
  useEffect(() => {
    getUserSkins().then(currentSkinsSlice.actions.updateAll).then(dispatch);
    getWeapons().then(setWeapons);
    getAllSkins().then(setWeaponSkins);
  }, [dispatch])

  // Refresh display
  useEffect(() => {
    if (!loaded) {
      return;
    }

    const weaponDisplays: [string, ReactNode][] = [];
    const equippedSkin = (weaponId: string) => weaponSkins?.get(weaponId)?.get(skinDefinitions!.get(weaponId)?.skinId.toString(10) ?? "0");
    weapons?.forEach((_, weaponId) => {
      weaponDisplays.push([weaponId, (<WeaponDisplay key={weaponId} csgoSkin={equippedSkin(weaponId)!}/>)])
    })
    setDisplays(weaponDisplays);
  }, [loaded, weapons, skinDefinitions, weaponSkins])

  useEffect(() => {
    setLoaded(weapons !== undefined && skinDefinitions !== undefined && weaponSkins !== undefined)
  }, [weapons, skinDefinitions, weaponSkins])

  return loaded &&
      (<div className="grid grid-cols-10 gap-2 h-full max-w-screen-xl m-auto">
        <div className="col-span-2 h-full">
          <VerticalScroll elements={displays} onSelect={setSelectedWeapon}/>
        </div>
        <WeaponCustomizer weaponSkins={weaponSkins?.get(selectedWeapon)!}
                          skinDefinition={skinDefinitions!.get(selectedWeapon)!}/>
      </div>) ||
      (
          <div>
            <p>Loading...</p>
          </div>
      );
}