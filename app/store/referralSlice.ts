import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadReferralTable } from '@src/service/amazon'
import { parseReferral } from '@src/service/parser'
interface ReferralFeeItem {
  categoriy: string
  fee: number
  minimumFee: number
}
interface ReferralState {
  content: string
  status: string
  error?: string
  referralRule?: ReferralFeeItem[]
}
const initialState: ReferralState = {
  content: '',
  status: 'idle',
}

export const fetchRuleContent = createAsyncThunk('referral/fetchRuleContent', async () => {
  return await loadReferralTable()
})

export const selectReferralRule = (state) => state.referral.referralRule

const referralSlice = createSlice({
  name: 'referral',
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
        state.referralRule = parseReferral(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})
export default referralSlice.reducer
