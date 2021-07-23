import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loadWeightRule } from '@src/service/amazon'
import { parseWeight } from '@src/service/parser-us'
import { InitializedStateSlice, StateStatus } from '@src/service/constants'
interface DimensionalWeightState extends StateSlice {
  dimensionalWeightRule?: {
    minimumWeight: number
    divisor: number
  }
}
const initialState: DimensionalWeightState = InitializedStateSlice

export const fetchRuleContent = createAsyncThunk('weight/fetchRuleContent', async () => {
  return await loadWeightRule('us')
})

export const selectDimensionalWeightRule = (state) => state.dimensionalWeight.dimensionalWeightRule

const dimensionalWeightSlice = createSlice({
  name: 'weight',
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<Country>) => {
      state.currentCountry = action.payload
      state.status = StateStatus.Idel
      state.content = ''
      state.dimensionalWeightRule = undefined
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
        state.dimensionalWeightRule = parseWeight(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = StateStatus.Failed
        state.error = action.error.message
      })
  },
})
export const { setCountry } = dimensionalWeightSlice.actions
export default dimensionalWeightSlice.reducer
