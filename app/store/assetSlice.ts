import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { InitializedStateSlice, StateStatus } from '@src/renderer/constants'
import { UsProfitCalculator } from '@src/service/countries/UsProfitCalculator'
import { CaProfitCalculator } from '@src/service/countries/CaProfitCalculator'
import { MxProfitCalculator } from '@src/service/countries/MxProfitCalculator'
import { UndefinedProfitCalculator } from '@src/service/countries/UndefinedProfitCalculator'
import { IProfitCalculator } from '@src/service/IProfitCalculator'
import { StateSlice } from '@src/types'
interface RulesState extends StateSlice {
  ruleCollection?: IRule
}
const initialState: RulesState = InitializedStateSlice

let profitCalculator: IProfitCalculator

export const fetchRuleContent = createAsyncThunk('rules/fetchRuleContent', async (): Promise<any> => {
  try {
    await profitCalculator.fetchRuleContent()
    return Promise.resolve(profitCalculator.content)
  } catch (e) {
    return Promise.reject(e)
  }
})

const rulesSlice = createSlice({
  name: 'asset',
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<Country>) => {
      state.currentCountry = action.payload
      state.status = StateStatus.Idle
      state.content = InitializedStateSlice.content
      delete state.error
      delete state.ruleCollection
      switch (state.currentCountry.code) {
        case 'ca':
          profitCalculator = new CaProfitCalculator({ ...state.currentCountry })
          break
        case 'mx':
          profitCalculator = new MxProfitCalculator({ ...state.currentCountry })
          break
        case 'us':
          profitCalculator = new UsProfitCalculator({ ...state.currentCountry })
          break
        default:
          profitCalculator = new UndefinedProfitCalculator({ ...state.currentCountry })
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
        state.content = action.payload
        state.ruleCollection = profitCalculator.parseRule()
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = StateStatus.Failed
        state.error = action.error.message
      })
  },
})
export const { setCountry } = rulesSlice.actions
export default rulesSlice.reducer
