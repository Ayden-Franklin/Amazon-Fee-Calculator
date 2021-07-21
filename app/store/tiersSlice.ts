import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { parseTiers, parseTiers2Obj } from '@src/service/parser'
import { InitializedStateSlice, StateStatus } from '@src/service/constants'
import { UsProfitCalculator } from '@src/service/countries/UsProfitCalculator'
import { CaProfitCalculator } from '@src/service/countries/CaProfitCalculator'
import { UndefinedProfitCalculator } from '@src/service/countries/UndefinedProfitCalculator'
import { IProfitCaluclator } from '@src/service/IProfitCalculator'
import { StateSlice } from '@src/types'
interface TiersState extends StateSlice {
  tierRules?: ITier[]
}
const initialState: TiersState = InitializedStateSlice

let profitCaluclator: IProfitCaluclator

export const fetchRuleContent = createAsyncThunk('tier/fetchRuleContent', () => {
  profitCaluclator.fetchRuleContent()
  return profitCaluclator.content.tier
})

const tiersSlice = createSlice({
  name: 'tier',
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<Country>) => {
      state.currentCountry = action.payload
      state.status = StateStatus.Idel
      state.content = InitializedStateSlice.content
      delete state.tierRules
      switch (state.currentCountry.code) {
        case 'ca':
          profitCaluclator = new CaProfitCalculator(state.currentCountry)
          break
        case 'us':
          profitCaluclator = new UsProfitCalculator(state.currentCountry)
          break
        default:
          profitCaluclator = new UndefinedProfitCalculator(state.currentCountry)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRuleContent.pending, (state, action) => {
        state.status = StateStatus.Loading
      })
      .addCase(fetchRuleContent.fulfilled, (state, action) => {
        state.status = StateStatus.Succeeded
        // state.content = action.payload
        // state.tierRules = parseTiers2Obj(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = StateStatus.Failed
        state.error = action.error.message
      })
  },
})
export const { setCountry } = tiersSlice.actions
export default tiersSlice.reducer
