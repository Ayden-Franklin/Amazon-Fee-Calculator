import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadClosingFee } from '@src/service/amazon'
import { parseClosing } from '@src/service/parser'
import { InitializedStateSlice, StateStatus } from '@src/service/constants'

interface ClosingState extends StateSlice {
  closingRule?: {
    categories: string[]
    fee: number
  }
}
const initialState: ClosingState = InitializedStateSlice

export const fetchRuleContent = createAsyncThunk('closing/fetchRuleContent', async (country: string) => {
  return await loadClosingFee(country)
})

export const selectClosingRule = (state) => state.closing.closingRule

const closingSlice = createSlice({
  name: 'closing',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRuleContent.pending, (state, action) => {
        state.status = StateStatus.Loading
      })
      .addCase(fetchRuleContent.fulfilled, (state, action) => {
        state.status = StateStatus.Succeeded
        state.content = action.payload
        state.closingRule = parseClosing(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = StateStatus.Failed
        state.error = action.error.message
      })
  },
})
export default closingSlice.reducer
