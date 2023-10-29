import {CSGOAPI_Skin} from "@/shared/types";
import Image from "next/image";

interface WeaponDisplayProps {
  csgoSkin: CSGOAPI_Skin
  textProps?: string
}

export default function WeaponDisplay({csgoSkin, textProps}: WeaponDisplayProps) {
  return (
      <div
          className="h-full w-full grid grid-rows-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 items-center">
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