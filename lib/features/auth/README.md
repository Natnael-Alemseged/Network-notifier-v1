# Auth Feature

This feature handles all authentication-related functionality including login, signup, password management, and user profile operations.

## Files

- **`authThunk.ts`** - Contains all async thunks for API calls
- **`authSlice.ts`** - Redux slice with state management and reducers

## Available Thunks

### `loginUser(credentials)`
Login with email and password.

```typescript
const credentials = { email: 'user@example.com', password: 'password123' };
dispatch(loginUser(credentials));
```

### `registerUser(credentials)`
Register a new user account.

```typescript
const credentials = { 
  email: 'user@example.com', 
  password: 'password123',
  name: 'John Doe' 
};
dispatch(registerUser(credentials));
```

### `forgotPassword(data)`
Request a password reset email.

```typescript
dispatch(forgotPassword({ email: 'user@example.com' }));
```

### `changePassword(data)`
Change the current user's password.

```typescript
const data = { 
  oldPassword: 'oldpass123', 
  newPassword: 'newpass456' 
};
dispatch(changePassword(data));
```

### `refreshToken()`
Refresh the authentication token.

```typescript
dispatch(refreshToken());
```

### `fetchUserProfile()`
Fetch the current user's profile.

```typescript
dispatch(fetchUserProfile());
```

### `updateUserProfile(profileData)`
Update the user's profile information.

```typescript
const profileData = { name: 'Jane Doe', email: 'jane@example.com' };
dispatch(updateUserProfile(profileData));
```

### `logoutUser()`
Logout the current user.

```typescript
dispatch(logoutUser());
```

## State Structure

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

## Manual Actions

```typescript
import { 
  setCredentials, 
  clearCredentials, 
  setError, 
  clearError,
  resetPasswordResetStatus 
} from './authSlice';

// Manually set credentials
dispatch(setCredentials({ user, token, refreshToken }));

// Clear all credentials
dispatch(clearCredentials());

// Set error message
dispatch(setError('Custom error message'));

// Clear error
dispatch(clearError());

// Reset password reset status
dispatch(resetPasswordResetStatus());
```

## Usage Example

```tsx
'use client';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { loginUser, logoutUser } from '@/lib/features/auth/authThunk';
import { clearError } from '@/lib/features/auth/authSlice';

export default function AuthExample() {
  const dispatch = useAppDispatch();
  const { user, isLoading, error, isAuthenticated } = useAppSelector(
    (state) => state.auth
  );

  const handleLogin = async () => {
    try {
      await dispatch(loginUser({ 
        email: 'user@example.com', 
        password: 'password123' 
      })).unwrap();
      console.log('Login successful!');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {error && (
        <div className="error">
          {error}
          <button onClick={() => dispatch(clearError())}>Dismiss</button>
        </div>
      )}
      
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```
