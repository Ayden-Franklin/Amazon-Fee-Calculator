import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { InitializedStateSlice, StateStatus } from '@src/service/constants'
import { UsProfitCalculator } from '@src/service/countries/UsProfitCalculator'
import { CaProfitCalculator } from '@src/service/countries/CaProfitCalculator'
import { UndefinedProfitCalculator } from '@src/service/countries/UndefinedProfitCalculator'
import { IProfitCaluclator } from '@src/service/IProfitCalculator'
import { StateSlice } from '@src/types'
interface RulesState extends StateSlice {
  rule?: Rule
}
const initialState: RulesState = InitializedStateSlice

let profitCaluclator: IProfitCaluclator

export const fetchRuleContent = createAsyncThunk('rules/fetchRuleContent', async (): Promise<any> => {
  try {
    await profitCaluclator.fetchRuleContent()
    return Promise.resolve(profitCaluclator.content)
  } catch (e) {
    return Promise.reject(e)
  }
})

const rulesSlice = createSlice({
  name: 'rules',
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<Country>) => {
      state.currentCountry = action.payload
      state.status = StateStatus.Idel
      state.content = InitializedStateSlice.content
      delete state.error
      delete state.rule
      switch (state.currentCountry.code) {
        case 'ca':
          profitCaluclator = new CaProfitCalculator({ ...state.currentCountry })
          break
        case 'us':
          profitCaluclator = new UsProfitCalculator({ ...state.currentCountry })
          break
        default:
          profitCaluclator = new UndefinedProfitCalculator({ ...state.currentCountry })
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
        state.rule = profitCaluclator.parseRule()
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = StateStatus.Failed
        state.error = action.error.message
      })
  },
})
export const { setCountry } = rulesSlice.actions
export default rulesSlice.reducer
