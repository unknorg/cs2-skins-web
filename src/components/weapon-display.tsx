import {CSGOAPI_Skin} from "@/shared/types";
import Image from "next/image";
import {Rarity} from "@/shared/rarity";

const displayColors: Record<Rarity, string> = {
  [Rarity.rarity_none]: 'bg-gradient-to-t from-[#868686] to-white-500',
  [Rarity.rarity_common_weapon]: 'bg-gradient-to-t from-[#83bbda] to-white-500',
  [Rarity.rarity_uncommon_weapon]: 'bg-gradient-to-t from-[#6fd6ff] to-white-500',
  [Rarity.rarity_rare_weapon]: 'bg-gradient-to-t from-[#556bff] to-white-500',
  [Rarity.rarity_mythical_weapon]: 'bg-gradient-to-t from-[#7151ff] to-white-500',
  [Rarity.rarity_legendary_weapon]: 'bg-gradient-to-t from-[#db59ff] to-white-500',
  [Rarity.rarity_ancient_weapon]: 'bg-gradient-to-t from-[#ff3b3b] to-white-500',
  [Rarity.rarity_contraband_weapon]: 'bg-gradient-to-t from-[#ffc73b] to-white-500'
}

interface WeaponDisplayProps {
  csgoSkin: CSGOAPI_Skin
  textProps?: string
}

export default function WeaponDisplay({csgoSkin, textProps}: WeaponDisplayProps) {
  if (csgoSkin.rarity.name == "Contraband") {
    debugger;
  }
  const displayColor = displayColors[csgoSkin.rarity.id];
  return (
      <div
          className={`h-full w-full grid grid-rows-3 ${displayColor} border border-gray-200 rounded-lg shadow dark:border-gray-700 items-center`}>
        <div className="row-span-2 mx-auto mt-5 h-full w-full relative">
          <Image
              src={csgoSkin.image}
              alt=""
              layout="fill"
              objectFit="contain"/>
        </div>
        <div className="row-span-1">
          <h5 className={"text-center tracking-tight " + textProps ?? ""}>{csgoSkin.weapon.name}{csgoSkin.pattern && ` | ${csgoSkin.pattern.name}`}</h5>
        </div>
      </div>
  )
}