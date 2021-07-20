import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loadTierTable } from '@src/service/amazon'
import { parseTiers, parseTiers2Obj } from '@src/service/parser'
import { InitializedStateSlice, StateStatus } from '@src/service/constants'
interface TiersState extends StateSlice {
  tierRules?: ITier[]
}
const initialState: TiersState = InitializedStateSlice

export const fetchRuleContent = createAsyncThunk('tier/fetchRuleContent', async (country: string) => {
  return await loadTierTable(country)
})

const tiersSlice = createSlice({
  name: 'tier',
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<Country>) => {
      state.currentCountry = action.payload
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
        state.tierRules = parseTiers2Obj(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = StateStatus.Failed
        state.error = action.error.message
      })
  },
})
export const { setCountry } = tiersSlice.actions
export default tiersSlice.reducer
