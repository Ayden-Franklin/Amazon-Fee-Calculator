import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadFBATable } from '@src/service/amazon'
import { parseFba } from '@src/service/parser-us'
import { InitializedStateSlice, StateStatus } from '@src/service/constants'
import { ProductTierItem } from '@src/types/fba'
import { StateSlice } from '@src/types'
interface FbaState extends StateSlice {
  // value: Array<{ name: string }> | undefined
  fbaRule?: {
    standard: Record<string, Array<Record<string, Array<string>>>>
    oversize: Record<string, Array<Record<string, Array<string>>>>
    // standard: ProductTierItem[]
    // oversize: ProductTierItem[]
  }
}
const initialState: FbaState = InitializedStateSlice

export const fetchRuleContent = createAsyncThunk('fba/fetchRuleContent', async (country: string) => {
  return await loadFBATable(country)
})

export const selectFbaRule = (state) => state.fba.fbaRule

const fbaSlice = createSlice({
  name: 'fba',
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
        state.fbaRule = parseFba(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = StateStatus.Failed
        state.error = action.error.message
      })
  },
})
export default fbaSlice.reducer
