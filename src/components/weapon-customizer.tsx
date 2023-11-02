import HorizontalScroll from "@/components/horizontal-scroll";
import WeaponDisplay from "@/components/weapon-display";
import Image from "next/image";
import {CSGOAPI_Skin, WeaponSkinDefinition} from "@/shared/types";
import {ReactNode, useEffect, useState} from "react";
import {saveSkin} from "@/shared/clientutils";
import {currentSkinsSlice, useDispatch} from "@/lib/redux";

interface WeaponCustomizerProps {
  skinDefinition: WeaponSkinDefinition | undefined,
  weaponSkins: Map<string, CSGOAPI_Skin>
}

interface SkinCustomization {
  skinId: number,
  wear: number,
  seed: number
}

export default function WeaponCustomizer({skinDefinition, weaponSkins}: WeaponCustomizerProps) {
  const dispatch = useDispatch();

  const skins: [string, ReactNode][] = [];
  Array.from(weaponSkins.entries())
      .sort(([p1, skin1], [p2, skin2]) => skin1.rarity.id - skin2.rarity.id)
      .forEach(([paintId, skin]) => skins.push([paintId, (
          <WeaponDisplay key={paintId} csgoSkin={weaponSkins.get(paintId)!} textProps="text-xs"/>)]))

  const [selectedSkin, setSelectedSkin] = useState<CSGOAPI_Skin>();
  const [customization, setCustomization] = useState<SkinCustomization>();

  useEffect(() => {
    setCustomization(fromSkinDef(skinDefinition));
  }, [skinDefinition])

  useEffect(() => {
    if (customization === undefined) {
      return;
    }

    const selectedSkinId = customization.skinId.toString();
    setSelectedSkin(weaponSkins.get(selectedSkinId)!)
  }, [customization, weaponSkins])

  const onApply = () => {
    const definition: WeaponSkinDefinition = new WeaponSkinDefinition(
        selectedSkin!.weapon.id, 0, customization!.skinId, customization!.seed, customization!.wear);
    saveSkin(definition).then(() => dispatch(currentSkinsSlice.actions.update(definition)));
  }

  return selectedSkin && customization && (
      <div className="col-span-8 bg-white border border-gray-200 rounded-lg shadow h-full overflow-auto">
        <div className="grid grid-rows-5 h-full">
          <div className="row-span-2 px-16">
            <div className="mx-auto mt-5 w-auto h-2/3 relative">
              <Image
                  src={selectedSkin.image}
                  alt=""
                  layout="fill"
                  objectFit="contain"/>
            </div>
            <div className="p-5">
              <h5 className="font-bold text-center text-xl tracking-tight">{selectedSkin.weapon.name}{selectedSkin.pattern && ` | ${selectedSkin.pattern.name}`}</h5>
            </div>
          </div>
          <div className="row-span-2 px-16">
            <div className="mt-10">
              <label htmlFor="wear-range"
                     className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Wear</label>
              <input id="wear-range" type="range" min="0" max="100" value={customization.wear * 100}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                     disabled={customization.skinId == 0}
                     onChange={ev => setCustomization({
                       ...customization,
                       wear: Number(ev.target.value) / 100
                     })}/>
            </div>
            <div className="mt-5">
              <label htmlFor="seed-range"
                     className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seed</label>
              <input id="seed-range" type="range" min="0" max="1024" step="1" value={customization.seed}
                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                     disabled={customization.skinId == 0}
                     onChange={ev => setCustomization({
                       ...customization,
                       seed: Number(ev.target.value)
                     })}/>
            </div>
            <div className="mt-5 flex justify-center">
              <button type="button"
                      className="text-white my-auto bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      onClick={onApply}
              >Apply
              </button>
            </div>
          </div>
          <div className="row-span-1">
            <HorizontalScroll elements={skins} onSelect={(elementId) => setCustomization({
              ...customization,
              skinId: Number(elementId)
            })}/>
          </div>
        </div>
      </div>
  ) || <div>Loading...</div>
}

function fromSkinDef(skinDef?: WeaponSkinDefinition): SkinCustomization {
  return {
    seed: skinDef?.seed ?? 0, skinId: skinDef?.skinId ?? 0, wear: skinDef?.wear ?? 0
  }
}