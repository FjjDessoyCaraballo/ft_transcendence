# Frontend Guide: Connecting to the Backend API

This guide explains how to connect your frontend application to the backend API endpoints from the `user.js` routes. We'll cover setting up API services, authentication, and how to use each endpoint.

## Table of Contents

1. [Setting Up the API Service](#setting-up-the-api-service)
2. [Authentication](#authentication)
3. [User Endpoints](#user-endpoints)
    - [User Registration](#user-registration)
    - [User Login](#user-login)
    - [Get User Profile](#get-user-profile)
    - [Update User Profile](#update-user-profile)
    - [Change Password](#change-password)
    - [Upload Avatar](#upload-avatar)
    - [Get User Statistics](#get-user-statistics)
    - [GDPR: Export User Data](#gdpr-export-user-data)
    - [GDPR: Delete Account](#gdpr-delete-account)
4. [Error Handling](#error-handling)
5. [Complete Example: User Registration and Login](#complete-example-user-registration-and-login)

## Setting Up the API Service

First, create a service to handle API requests. This centralizes all your API calls and makes them reusable throughout your application.

```typescript
// src/services/api.ts

const API_URL = 'http://localhost:3000/api';

// Helper function for making API requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Get token from localStorage if available
  const token = localStorage.getItem('token');
  
  // Set default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    // Make the fetch request
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    // Parse the JSON response
    const data = await response.json();
    
    // Check if request was successful
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
```

## Authentication

Authentication is handled using JSON Web Tokens (JWT). When a user logs in, the server returns a token that should be included in subsequent requests.

```typescript
// src/services/auth.ts

import { apiRequest } from './api';

// Interface for user type
export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  color: string;
  games_won: number;
  games_lost: number;
  elo_rank: number;
}

// Login and get token
export const login = async (email: string, password: string) => {
  const data = await apiRequest('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  // Store token and user data
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
};

// Get current user from local storage
export const getCurrentUser = (): User | null => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Logout - clear local storage
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
```

## User Endpoints

Now, let's implement service functions for each user endpoint.

### User Registration

```typescript
// src/services/userService.ts
import { apiRequest } from './api';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  color?: string;
}

export const registerUser = async (userData: RegisterData) => {
  return apiRequest('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};
```

**Example usage in a component:**

```typescript
import { registerUser } from '../services/userService';

// Inside your component
const handleRegister = async (event: React.FormEvent) => {
  event.preventDefault();
  
  try {
    await registerUser({
      username,
      email,
      password,
      color
    });
    
    // Registration successful - redirect to login or show success message
    setSuccess('Registration successful! You can now log in.');
  } catch (error) {
    setError(error.message);
  }
};
```

### User Login

This was covered in the auth service above, but here's how to use it in a component:

```typescript
import { login } from '../services/auth';

// Inside your component
const handleLogin = async (event: React.FormEvent) => {
  event.preventDefault();
  
  try {
    const result = await login(email, password);
    
    // Login successful - update app state
    setCurrentUser(result.user);
    
    // Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    setError(error.message);
  }
};
```

### Get User Profile

```typescript
// src/services/userService.ts
export const getUserProfile = async () => {
  return apiRequest('/users/profile');
};
```

**Example usage:**

```typescript
import { getUserProfile } from '../services/userService';

// Inside your component
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const userData = await getUserProfile();
      setProfile(userData);
    } catch (error) {
      setError(error.message);
    }
  };
  
  fetchProfile();
}, []);
```

### Update User Profile

```typescript
// src/services/userService.ts
interface ProfileUpdateData {
  username?: string;
  email?: string;
  color?: string;
}

export const updateUserProfile = async (profileData: ProfileUpdateData) => {
  return apiRequest('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
};
```

**Example usage:**

```typescript
import { updateUserProfile } from '../services/userService';

// Inside your component
const handleUpdateProfile = async (event: React.FormEvent) => {
  event.preventDefault();
  
  try {
    const updatedProfile = await updateUserProfile({
      username,
      email,
      color
    });
    
    // Update local state and storage
    setProfile(updatedProfile);
    localStorage.setItem('user', JSON.stringify(updatedProfile));
    
    setSuccess('Profile updated successfully!');
  } catch (error) {
    setError(error.message);
  }
};
```

### Change Password

```typescript
// src/services/userService.ts
interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (passwordData: PasswordChangeData) => {
  return apiRequest('/users/password', {
    method: 'PUT',
    body: JSON.stringify(passwordData)
  });
};
```

**Example usage:**

```typescript
import { changePassword } from '../services/userService';

// Inside your component
const handlePasswordChange = async (event: React.FormEvent) => {
  event.preventDefault();
  
  // Validate passwords match
  if (newPassword !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  
  try {
    await changePassword({
      currentPassword,
      newPassword
    });
    
    setSuccess('Password changed successfully!');
    // Clear form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  } catch (error) {
    setError(error.message);
  }
};
```

### Upload Avatar

```typescript
// src/services/userService.ts
export const uploadAvatar = async (imageData: string) => {
  return apiRequest('/users/avatar', {
    method: 'POST',
    body: JSON.stringify({
      avatar: { data: imageData }
    })
  });
};

// Helper function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};
```

**Example usage:**

```typescript
import { uploadAvatar, fileToBase64 } from '../services/userService';

// Inside your component
const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  if (!event.target.files || event.target.files.length === 0) {
    return;
  }
  
  const file = event.target.files[0];
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    setError('Please select an image file');
    return;
  }
  
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    setError('Image size must be less than 2MB');
    return;
  }
  
  try {
    setUploading(true);
    
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Upload to server
    const result = await uploadAvatar(base64Data);
    
    // Update avatar in profile and local storage
    const updatedUser = {
      ...JSON.parse(localStorage.getItem('user') || '{}'),
      avatar_url: result.avatar_url
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setProfile(prevProfile => ({
      ...prevProfile,
      avatar_url: result.avatar_url
    }));
    
    setSuccess('Avatar uploaded successfully!');
  } catch (error) {
    setError(error.message);
  } finally {
    setUploading(false);
  }
};
```

### Get User Statistics

```typescript
// src/services/userService.ts
export const getUserStats = async () => {
  return apiRequest('/users/stats');
};
```

**Example usage:**

```typescript
import { getUserStats } from '../services/userService';

// Inside your component
useEffect(() => {
  const fetchStats = async () => {
    try {
      const stats = await getUserStats();
      setUserStats(stats);
    } catch (error) {
      setError(error.message);
    }
  };
  
  fetchStats();
}, []);
```

### GDPR: Export User Data

```typescript
// src/services/userService.ts
export const exportUserData = async () => {
  return apiRequest('/users/export-data');
};
```

**Example usage:**

```typescript
import { exportUserData } from '../services/userService';

// Inside your component
const handleExportData = async () => {
  try {
    setExporting(true);
    const userData = await exportUserData();
    
    // Convert to JSON string and create download link
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_data_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setSuccess('Data exported successfully!');
  } catch (error) {
    setError(error.message);
  } finally {
    setExporting(false);
  }
};
```

### GDPR: Delete Account

```typescript
// src/services/userService.ts
export const deleteAccount = async () => {
  return apiRequest('/users/account', {
    method: 'DELETE'
  });
};
```

**Example usage:**

```typescript
import { deleteAccount } from '../services/userService';
import { logout } from '../services/auth';

// Inside your component
const handleDeleteAccount = async () => {
  // Confirm with user
  if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    return;
  }
  
  try {
    await deleteAccount();
    
    // Log out the user
    logout();
    
    // Redirect to home page
    navigate('/');
    
    // Show success message
    alert('Your account has been scheduled for deletion.');
  } catch (error) {
    setError(error.message);
  }
};
```

## Error Handling

Consistent error handling is important for a good user experience. Here's a reusable error component:

```tsx
// src/components/ErrorMessage.tsx
import React from 'react';

interface ErrorMessageProps {
  message: string | null;
  onClear?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClear }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <span className="block sm:inline">{message}</span>
      {onClear && (
        <button
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          onClick={onClear}
        >
          <span className="sr-only">Dismiss</span>
          <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
```

## Complete Example: User Registration and Login

Here's a complete example of a registration and login system:

```tsx
// src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/userService';
import ErrorMessage from '../components/ErrorMessage';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [color, setColor] = useState('blue');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      await registerUser({
        username,
        email,
        password,
        color
      });
      
      // Redirect to login page
      navigate('/login', { state: { message: 'Registration successful! You can now log in.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        
        <ErrorMessage message={error} onClear={() => setError(null)} />
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="color" className="sr-only">Your Color</label>
              <select
                id="color"
                name="color"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                <option value="blue">Blue</option>
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="yellow">Yellow</option>
                <option value="purple">Purple</option>
              </select>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
```

```tsx
// src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/auth';
import ErrorMessage from '../components/ErrorMessage';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Check for success message from registration
  useEffect(() => {
    if (location.state && 'message' in location.state) {
      setSuccess(location.state.message as string);
    }
  }, [location]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      await login(email, password);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{success}</span>
            <button
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setSuccess(null)}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        <ErrorMessage message={error} onClear={() => setError(null)} />
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
```

This comprehensive guide should help you connect your frontend application to the backend API and implement all the user-related functionality. The examples use React with TypeScript and Tailwind CSS, but the principles apply to any frontend framework.
