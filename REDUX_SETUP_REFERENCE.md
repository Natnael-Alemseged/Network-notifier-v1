# Redux Toolkit & Redux Persist Setup Reference

## Project Structure

```
lib/
├── features/
│   └── auth/
│       ├── authThunk.ts      # Async thunks for API calls
│       └── authSlice.ts      # Redux slice with reducers
├── store/
│   ├── store.ts              # Redux store configuration
│   ├── hooks.ts              # Typed Redux hooks
│   └── StoreProvider.tsx     # Provider component for Next.js
├── util/
│   └── apiService.ts         # API service wrapper
└── constants/
    └── api_const.ts          # API endpoints
```

## Installation

```bash
pnpm install @reduxjs/toolkit react-redux redux-persist
```

## Usage

### 1. Wrap Your App with StoreProvider

In your root layout or `_app.tsx`:

```tsx
import { StoreProvider } from '@/lib/store/StoreProvider';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
```

### 2. Use Redux Hooks in Components

```tsx
'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { loginUser, registerUser, logoutUser } from '@/lib/features/auth/authThunk';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { user, isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const handleLogin = async (email: string, password: string) => {
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      // Login successful
    } catch (err) {
      // Handle error
      console.error('Login failed:', err);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={() => handleLogin('user@example.com', 'password')}>
          Login
        </button>
      )}
    </div>
  );
}
```

### 3. Available Auth Thunks

All thunks are located in `lib/features/auth/authThunk.ts`:

- **`loginUser(credentials)`** - Login with email/password
- **`registerUser(credentials)`** - Register new user
- **`forgotPassword(data)`** - Request password reset
- **`changePassword(data)`** - Change user password
- **`refreshToken()`** - Refresh authentication token
- **`fetchUserProfile()`** - Get current user profile
- **`updateUserProfile(profileData)`** - Update user profile
- **`logoutUser()`** - Logout current user

### 4. Auth State Structure

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  passwordResetSent: boolean;
}
```

### 5. Manual Actions

You can also use manual actions from the slice:

```tsx
import { setCredentials, clearCredentials, setError, clearError } from '@/lib/features/auth/authSlice';

// Set credentials manually
dispatch(setCredentials({ 
  user: { id: '1', email: 'user@example.com' }, 
  token: 'abc123',
  refreshToken: 'refresh123'
}));

// Clear credentials
dispatch(clearCredentials());

// Set/clear errors
dispatch(setError('Something went wrong'));
dispatch(clearError());
```

## Creating New Features

Follow this structure for new features:

### Step 1: Create Feature Directory

```
lib/features/[featureName]/
├── [featureName]Thunk.ts
└── [featureName]Slice.ts
```

### Step 2: Create Thunk File

**Example: `lib/features/listings/listingsThunk.ts`**

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ApiService } from '@/lib/util/apiService';
import { ENDPOINTS } from '@/lib/constants/api_const';

export const fetchListings = createAsyncThunk(
  'listings/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.get(ENDPOINTS.LISTINGS);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to fetch listings');
    }
  }
);

export const createListing = createAsyncThunk(
  'listings/create',
  async (listingData: any, { rejectWithValue }) => {
    try {
      const response = await ApiService.post(ENDPOINTS.LISTINGS, listingData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Failed to create listing');
    }
  }
);
```

### Step 3: Create Slice File

**Example: `lib/features/listings/listingsSlice.ts`**

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchListings, createListing } from './listingsThunk';

interface ListingsState {
  items: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ListingsState = {
  items: [],
  isLoading: false,
  error: null,
};

const listingsSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    clearListings: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createListing.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createListing.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.push(action.payload);
      })
      .addCase(createListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearListings } = listingsSlice.actions;
export default listingsSlice.reducer;
```

### Step 4: Add to Store

Update `lib/store/store.ts`:

```typescript
import listingsReducer from '@/lib/features/listings/listingsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  listings: listingsReducer, // Add new reducer
});
```

### Step 5: Update Persist Config (Optional)

If you want to persist the new feature:

```typescript
const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth', 'listings'], // Add to whitelist
};
```

## API Service Integration

The `ApiService` from `lib/util/apiService.ts` provides these methods:

- **`get(url, config?, tokenNeeded?)`**
- **`getWithQuery(endpoint, queryProps?, tokenNeeded?, config?, signal?)`**
- **`getWithPaginationQuery(endpoint, queryProps?, tokenNeeded?, config?, signal?)`**
- **`post(url, body?, config?, tokenNeeded?)`**
- **`postWithQuery(endpoint, body, queryProps?, tokenNeeded?, config?, signal?)`**
- **`patch(url, body?, config?, tokenNeeded?)`**
- **`put(url, body?, config?, tokenNeeded?)`**
- **`delete(url, body?, config?, tokenNeeded?)`**
- **`uploadFile(url, file, tokenNeeded?)`**
- **`uploadFiles(url, files, tokenNeeded?)`**

### Token Management

- Set `tokenNeeded: false` for public endpoints (login, register)
- Set `tokenNeeded: true` (default) for authenticated endpoints
- The token is automatically attached via the `X-Token-Needed` header

## Best Practices

1. **Always use typed hooks**: Use `useAppDispatch` and `useAppSelector` instead of plain `useDispatch` and `useSelector`

2. **Handle async thunk results**: Use `.unwrap()` to handle promise resolution/rejection

3. **Error handling**: All thunks use `rejectWithValue` for consistent error handling

4. **Loading states**: Each slice maintains its own `isLoading` state

5. **Persistence**: Only persist necessary data (tokens, user info) - not temporary UI state

6. **Feature organization**: Keep each feature in its own directory with thunk and slice files

7. **Type safety**: Define interfaces for all state shapes and API payloads

## Troubleshooting

### Redux Persist Warnings

If you see serialization warnings, ensure you've configured the middleware correctly:

```typescript
middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    },
  }),
```

### Token Not Attached

Ensure your API client interceptor reads the `X-Token-Needed` header and attaches the token from Redux state.

### State Not Persisting

Check that:
1. The feature is in the `whitelist` array
2. You're using `PersistGate` in your app wrapper
3. Local storage is available in your environment

## Example: Complete Feature Implementation

See `lib/features/auth/` for a complete, production-ready example of:
- Multiple async thunks
- Complex state management
- Error handling
- Token management
- Profile updates
- Password reset flows
