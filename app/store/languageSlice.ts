import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '.'

export const languageSlice = createSlice({
  name: 'language',
  initialState: { code: 'us', name: 'United States' },
  reducers: {
    changeLanguage: (state, action: PayloadAction<{ code: string; name: string }>) => {
      state.code = action.payload.code
      state.name = action.payload.name
    },
  },
})

export const { changeLanguage } = languageSlice.actions

export default languageSlice.reducer
