# Quick Start Guide - Authentication

## 🚀 How to Use Authentication in Your Components

### **1. Access Auth State**

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.full_name}!</h1>
      <p>Email: {user.email}</p>
      <p>Plan: {user.subscription_tier}</p>
    </div>
  );
}
```

---

### **2. Signup New User**

```typescript
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const handleSubmit = async (formData) => {
    try {
      await signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone_number: formData.phone,
      });
      
      // Success! User is now logged in
      navigate('/onboarding');
    } catch (err) {
      // Show error to user
      setError(err.message);
    }
  };
}
```

---

### **3. Login Existing User**

```typescript
import { useAuth } from '../context/AuthContext';

function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  
  const handleLogin = async (email, password) => {
    try {
      await login({ email, password });
      // Success! Redirect handled by component
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };
}
```

---

### **4. Logout User**

```typescript
import { useAuth } from '../context/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return <button onClick={handleLogout}>Logout</button>;
}
```

---

### **5. Create Protected Route**

```typescript
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Usage in App.tsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } 
/>
```

---

### **6. Update User Profile**

```typescript
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  
  const handleUpdateProfile = async (newData) => {
    try {
      const updatedUser = await authService.updateUserProfile(newData);
      updateUser(updatedUser); // Update context state
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };
}
```

---

### **7. Check Authentication Status**

```typescript
import { useAuth } from '../context/AuthContext';

function Header() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user.full_name}</span>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
}
```

---

### **8. Handle Token Refresh**

Token refresh is **automatic**, but you can also trigger it manually:

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { refreshAuth } = useAuth();
  
  const handleManualRefresh = async () => {
    try {
      await refreshAuth();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Refresh failed, user needs to re-login');
    }
  };
}
```

---

## 🔐 Password Validation

Use the built-in password validator:

```typescript
import { validatePasswordStrength } from '../services/authService';

function PasswordInput() {
  const [password, setPassword] = useState('');
  
  const validation = validatePasswordStrength(password);
  
  return (
    <div>
      <input 
        type="password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      {/* Show strength indicator */}
      <div className={`strength-${validation.strength}`}>
        Password Strength: {validation.strength}
      </div>
      
      {/* Show requirements */}
      <ul>
        <li className={validation.isValid ? 'valid' : 'invalid'}>
          {validation.isValid ? '✓' : '✗'} Meets all requirements
        </li>
      </ul>
    </div>
  );
}
```

**Requirements**:
- ✅ 8+ characters
- ✅ Uppercase letter
- ✅ Lowercase letter
- ✅ Number
- ✅ Special character

---

## 🛠️ API Service Functions

Direct access to auth API functions:

```typescript
import * as authService from '../services/authService';

// Signup
const response = await authService.signup({
  email: 'user@example.com',
  password: 'SecurePass123!',
  full_name: 'John Doe',
  phone_number: '+2348012345678',
});

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'SecurePass123!',
});

// Logout
await authService.logout();

// Get current user
const user = await authService.getCurrentUser();

// Update profile
const updatedUser = await authService.updateUserProfile({
  full_name: 'Jane Doe',
});
```

---

## 📦 Available Hooks & Functions

### **useAuth() Hook**

Returns:
```typescript
{
  // State
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signup: (data: SignupRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}
```

---

## ❌ Common Mistakes to Avoid

### **1. Don't access localStorage directly**

❌ **Bad**:
```typescript
const token = localStorage.getItem('remsana_auth_token');
```

✅ **Good**:
```typescript
const { accessToken } = useAuth();
```

---

### **2. Don't use useAuth() outside AuthProvider**

❌ **Bad**:
```typescript
// This will throw error if not wrapped in AuthProvider
const { user } = useAuth();
```

✅ **Good**:
```typescript
// Ensure App.tsx has <AuthProvider>
<AuthProvider>
  <MyComponent /> {/* Now can use useAuth() */}
</AuthProvider>
```

---

### **3. Don't forget error handling**

❌ **Bad**:
```typescript
await signup(data); // Unhandled errors
```

✅ **Good**:
```typescript
try {
  await signup(data);
  navigate('/dashboard');
} catch (error) {
  setError(error.message);
}
```

---

### **4. Don't mix old and new auth approaches**

❌ **Bad**:
```typescript
// Mixing direct API calls with AuthContext
await authApi.register(data);
localStorage.setItem('token', token);
```

✅ **Good**:
```typescript
// Use AuthContext exclusively
const { signup } = useAuth();
await signup(data);
```

---

## 🎯 Best Practices

1. **Always use `useAuth()` hook** for auth state and actions
2. **Handle errors gracefully** with try/catch
3. **Show loading states** when `isLoading` is true
4. **Protect sensitive routes** with authentication checks
5. **Keep auth logic in Context**, not in components
6. **Use TypeScript types** from `auth.types.ts`
7. **Don't store sensitive data** in state or localStorage unnecessarily

---

## 📚 See Also

- [Full Implementation Documentation](./AUTHENTICATION_IMPLEMENTATION.md)
- [API Documentation](#) (Backend API docs)
- [TypeScript Types](../src/app/types/auth.types.ts)
- [Auth Service](../src/app/services/authService.ts)
- [Auth Context](../src/app/context/AuthContext.tsx)

---

**Need help?** Check the inline comments in the source code or refer to the full documentation.
