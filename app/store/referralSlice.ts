import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadReferralTable } from '@src/service/amazon'
import { parseReferral } from '@src/service/parser-us'
import { InitializedStateSlice, StateStatus } from '@src/service/constants'
import { ReferralFeeItem } from '@src/types/referral'
interface ReferralState extends StateSlice {
  referralRule?: ReferralFeeItem[]
}
const initialState: ReferralState = InitializedStateSlice

export const fetchRuleContent = createAsyncThunk('referral/fetchRuleContent', async (country: string) => {
  return await loadReferralTable(country)
})

export const selectReferralRule = (state) => state.referral.referralRule

const referralSlice = createSlice({
  name: 'referral',
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
        state.referralRule = parseReferral(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = StateStatus.Failed
        state.error = action.error.message
      })
  },
})
export default referralSlice.reducer
