import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '@/lib/features/auth/authSlice';
import contactsReducer from '@/lib/features/contacts/contactsSlice';
import settingsReducer from '@/lib/features/settings/settingsSlice';
import { setAuthToken } from '@/lib/util/apiclient';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'settings'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  contacts: contactsReducer,
  settings: settingsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

let currentToken: string | null = null;
const syncAuthToken = () => {
  const nextToken = store.getState().auth.token;
  if (nextToken !== currentToken) {
    currentToken = nextToken;
    setAuthToken(nextToken);
  }
};

syncAuthToken();
store.subscribe(syncAuthToken);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
