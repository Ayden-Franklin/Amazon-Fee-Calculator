import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { countryMenuItems } from '@src/service/constants'

export const countrySlice = createSlice({
  name: 'country',
  initialState: countryMenuItems[0],
  reducers: {
    changeCountry: (state, action: PayloadAction<Country>) => {
      state.code = action.payload.code
      state.name = action.payload.name
    },
  },
})
export const { changeCountry } = countrySlice.actions

export default countrySlice.reducer
