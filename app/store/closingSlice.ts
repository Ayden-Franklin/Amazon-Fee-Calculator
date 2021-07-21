import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { loadClosingFee } from '@src/service/amazon'
import { parseClosing } from '@src/service/parser-us'
import { InitializedStateSlice, StateStatus } from '@src/service/constants'
import { StateSlice } from '@src/types'

interface ClosingState extends StateSlice {
  closingRule?: {
    categories: string[]
    fee: number
  }
}
const initialState: ClosingState = InitializedStateSlice

export const fetchRuleContent = createAsyncThunk('closing/fetchRuleContent', async () => {
  return await loadClosingFee('us')
})

export const selectClosingRule = (state) => state.closing.closingRule

const closingSlice = createSlice({
  name: 'closing',
  initialState,
  reducers: {
    setCountry: (state, action: PayloadAction<Country>) => {
      state.currentCountry = action.payload
      state.status = StateStatus.Idel
      state.content = ''
      delete state.closingRule
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
        state.closingRule = parseClosing(action.payload)
      })
      .addCase(fetchRuleContent.rejected, (state, action) => {
        state.status = StateStatus.Failed
        state.error = action.error.message
      })
  },
})
export const { setCountry } = closingSlice.actions
export default closingSlice.reducer
