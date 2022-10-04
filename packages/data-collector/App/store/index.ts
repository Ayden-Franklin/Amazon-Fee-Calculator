import { configureStore } from '@reduxjs/toolkit'
import countryReducer from '@src/store/countrySlice'
import assetReducer from '@src/store/assetSlice'
import calculatorReducer from '@src/store/calculatorSlice'
const store = configureStore({
  reducer: {
    country: countryReducer,
    asset: assetReducer,
    calculator: calculatorReducer,
  },
  // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(interceptor),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store
