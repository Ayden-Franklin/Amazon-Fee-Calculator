import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadWeightRule } from '@src/service/amazon'
import { parseWeight } from '@src/service/parser'
interface DimensionalWeightState {
  content: string
  status: string
  error?: string
  // value: Array<{ name: string }> | undefined
  diemnsionalWeightRule?: {
    minimumWeight: number
    divisor: number
  }
}
const initialState: DimensionalWeightState = {
  content: '',
  status: 'idle',
}

export const fetchRuleContent = createAsyncThunk('weight/fetchRuleContent', async () => {
  return await loadWeightRule()
})

export const selectDimensionalWeightRule = (state) => state.dimensionalWeight.dimensionalWeightRule

const dimensionalWeightSlice = createSlice({
  name: 'weight',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRuleContent.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchRuleContent.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.content = action.payload
        state.diemnsionalWeightRule = parseWeight(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})
export default dimensionalWeightSlice.reducer
