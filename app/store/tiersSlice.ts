import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadTierTable } from '@src/service/amazon'
import { parseTiers, parseTiers2Obj } from '@src/service/parser'
interface TiersState {
  content: string
  status: string
  error?: string
  tierRules?: ITier[]
}
const initialState: TiersState = {
  content: '',
  status: 'idle',
}

export const fetchRuleContent = createAsyncThunk('tier/fetchRuleContent', async () => {
  return await loadTierTable()
})

const tiersSlice = createSlice({
  name: 'tier',
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
        state.tierRules = parseTiers2Obj(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})
export default tiersSlice.reducer
