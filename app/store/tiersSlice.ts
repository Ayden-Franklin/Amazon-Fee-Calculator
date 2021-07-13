import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadTierTable } from '@src/service/amazon'
import { parseTiers } from '@src/service/parser'
interface TiersState {
  content: string
  status: string
  error?: string
  // value: Array<{ name: string }> | undefined
  tierRule?: {
    dimensionUnit: string
    weightUnit: string
    tierNames: string[]
    weightRule: number[]
    volumeRule: number[][]
    lengthGirthRule: number[]
  }
}
const initialState: TiersState = {
  content: '',
  status: 'idle',
}

export const fetchRuleContent = createAsyncThunk('tier/fetchRuleContent', async () => {
  return await loadTierTable()
})

export const selectTierRule = (state) => state.tier.tierRule

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
        state.tierRule = parseTiers(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})
export default tiersSlice.reducer
