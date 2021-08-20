import { configureStore } from '@reduxjs/toolkit'
import countryReducer from '@src/store/countrySlice'
import assetReducer from '@src/store/assetSlice'
import calculatorReducer from '@src/store/calculatorSlice'
function interceptor({ getState }) {
  return (next) => (action) => {
    // console.log('will dispatch', action)
    if (action.type === 'calculator/calculate') {
      action.payload = {
        country: getState().country.code,
        rules: { ...getState().asset.ruleCollection },
      }
    }
    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action)

    // console.log('state after dispatch', getState())

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue
  }
}
const store = configureStore({
  reducer: {
    country: countryReducer,
    asset: assetReducer,
    calculator: calculatorReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(interceptor),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store
