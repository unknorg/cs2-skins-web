/* Core */
import {createSlice, type PayloadAction} from '@reduxjs/toolkit'
import {WeaponSkinDefinition} from "@/shared/types";

interface PlayerSkinsState {
  // should not be putting MapSet into redux state? no, thanks
  skins: Map<string, WeaponSkinDefinition>
}

const initialState: PlayerSkinsState = {
  skins: new Map<string, WeaponSkinDefinition>()
}

export const currentSkinsSlice = createSlice({
  name: 'currentSkins',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    update: (state, action: PayloadAction<WeaponSkinDefinition>) => {
      state.skins.set(action.payload.weaponName, action.payload);
    },
    delete: (state, action: PayloadAction<string>) => {
      state.skins.delete(action.payload);
    },
    updateAll: (state, action: PayloadAction<Map<string, WeaponSkinDefinition>>) => {
      state.skins = action.payload;
    }
  }
})