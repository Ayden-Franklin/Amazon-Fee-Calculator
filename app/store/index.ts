import { configureStore, applyMiddleware } from '@reduxjs/toolkit'
import languageReducer from '@src/store/languageSlice'
import tiersReducer from '@src/store/tiersSlice'
import dimensionalWeightReducer from '@src/store/dimensionalWeightSlice'
import fbaReducer from '@src/store/fbaSlice'
import referralReducer from '@src/store/referralSlice'
import closingReducer from '@src/store/closingSlice'
import calculatorReducer from '@src/store/calculatorSlice'
function interceptor({ getState }) {
  return next => action => {
    // console.log('will dispatch', action)
    if (action.type === 'calculator/calculate' || action.type === 'calculator/estimate') {
      action.payload = {
        tierRule: getState().tier.tierRule,
        diemnsionalWeightRule: getState().dimensionalWeight.diemnsionalWeightRule,
        fbaRule: getState().fba.fbaRule,
        referralRule: getState().referral.referralRule,
        closingRule: getState().closing.closingRule,
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
    language: languageReducer,
    tier: tiersReducer,
    dimensionalWeight: dimensionalWeightReducer,
    fba: fbaReducer,
    referral: referralReducer,
    closing: closingReducer,
    calculator: calculatorReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(interceptor),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default store
