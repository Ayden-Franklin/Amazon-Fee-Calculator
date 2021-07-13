import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadFBATable } from '@src/service/amazon'
import { parseFba } from '@src/service/parser'
interface FulfillmentItem {
  minimumShippingWeight: number
  maximumShippingWeight: number
  fee: number
}
interface TierItem {
  tierName: string
  fulfillments: FulfillmentItem[]
}
interface ProductTierItem {
  productType: string
  tiers: TierItem[]
}
interface FbaState {
  content: string
  status: string
  error?: string
  // value: Array<{ name: string }> | undefined
  fbaRule?: {
    dimensionUnit: string
    weightUnit: string
    standard: ProductTierItem[]
    oversize: ProductTierItem[]
  }
}
const initialState: FbaState = {
  content: '',
  status: 'idle',
}

export const fetchRuleContent = createAsyncThunk('fba/fetchRuleContent', async () => {
  return await loadFBATable()
})

export const selectFbaRule = (state) => state.fba.fbaRule

const fbaSlice = createSlice({
  name: 'fba',
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
        state.fbaRule = parseFba(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})
export default fbaSlice.reducer