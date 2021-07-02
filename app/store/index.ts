import { configureStore } from '@reduxjs/toolkit';
// import tiersSlice from '@src/renderer/components/tiers/tiersSlice';
import languageReducer from './languageSlice';
const store = configureStore({
  reducer: {
    language: languageReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
