import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'

export const countrySlice = createSlice({
  name: 'country',
  initialState: { code: 'us', name: 'United States' },
  reducers: {
    changeCountry: (state, action: PayloadAction<Country>) => {
      state.code = action.payload.code
      state.name = action.payload.name
    },
  },
})

export const { changeCountry } = countrySlice.actions

export default countrySlice.reducer
