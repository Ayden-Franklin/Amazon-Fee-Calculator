import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadClosingFee } from '@src/service/amazon'
import { parseClosing } from '@src/service/parser'

interface ClosingState {
  content: string
  status: string
  error?: string
  closingRule?: {
    categories: string[]
    fee: number
  }
}
const initialState: ClosingState = {
  content: '',
  status: 'idle',
}

export const fetchRuleContent = createAsyncThunk('closing/fetchRuleContent', async () => {
  return await loadClosingFee()
})

export const selectClosingRule = (state) => state.closing.closingRule

const closingSlice = createSlice({
  name: 'closing',
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
        state.closingRule = parseClosing(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})
export default closingSlice.reducer
