# React Project Setup for School Advisories Frontend

## 🚀 Quick Setup Commands

```bash
# 1. Create React TypeScript project
npx create-react-app school-advisories-front --template typescript
cd school-advisories-front

# 2. Install core dependencies
npm install axios react-router-dom react-query @types/node

# 3. Install UI framework (choose one)
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
# OR
npm install antd
# OR
npm install react-bootstrap bootstrap

# 4. Install development tools
npm install -D @types/react-router-dom eslint prettier

# 5. Install optional but recommended
npm install react-hook-form @hookform/resolvers yup
npm install date-fns # for date handling
npm install react-toastify # for notifications
npm install js-cookie @types/js-cookie # for JWT storage
```

---

## 📁 Recommended Project Structure

```
src/
  api/
    client.ts              # Axios configuration with JWT interceptor
    types.ts               # Copy backend-types.ts here
    endpoints/
      auth.ts              # Authentication API calls
      advisories.ts        # Advisory-related API calls
      users.ts             # User management API calls
      subjects.ts          # Subject API calls
      notifications.ts     # Notification API calls
  components/
    common/
      Layout.tsx           # Main app layout with navigation
      ProtectedRoute.tsx   # Route protection component
      LoadingSpinner.tsx   # Loading states
      ErrorBoundary.tsx    # Error handling
    auth/
      LoginForm.tsx        # Login component
      LogoutButton.tsx     # Logout functionality
    student/
      RequestAdvisory.tsx  # Advisory request form
      MyRequests.tsx       # Student's request list
      MyInvitations.tsx    # Student's invitations
      StudentDashboard.tsx # Student overview
    professor/
      PendingRequests.tsx  # Professor's pending requests
      MyAvailability.tsx   # Professor's schedule
      CreateSession.tsx    # Create advisory session
      ManageRequests.tsx   # Review and approve/reject
    admin/
      UserManagement.tsx   # Admin user CRUD
      SystemSettings.tsx   # System configuration
      EmailTemplates.tsx   # Template management
  contexts/
    AuthContext.tsx        # Authentication state management
    NotificationContext.tsx # Global notifications
  hooks/
    useAuth.ts            # Authentication hooks
    useApi.ts             # API calling hooks
    useNotifications.ts   # Notification hooks
  pages/
    LoginPage.tsx         # Login page
    DashboardPage.tsx     # Main dashboard
    StudentPages.tsx      # Student-specific pages
    ProfessorPages.tsx    # Professor-specific pages
    AdminPages.tsx        # Admin-specific pages
  utils/
    constants.ts          # App constants
    helpers.ts            # Utility functions
    dateUtils.ts          # Date formatting
    tokenUtils.ts         # JWT handling
```

---

## 🔧 Essential Configuration Files

### 1. **Environment Variables (.env)**
```env
# Backend API Configuration
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_API_TIMEOUT=10000

# JWT Configuration
REACT_APP_JWT_STORAGE_KEY=auth_token
REACT_APP_REFRESH_TOKEN_KEY=refresh_token

# App Configuration
REACT_APP_NAME=School Advisories System
REACT_APP_VERSION=1.0.0
REACT_APP_ENV=development

# Optional Features
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_REAL_TIME=false
REACT_APP_DEBUG_MODE=true
```

### 2. **Axios Client Setup (src/api/client.ts)**
```typescript
import axios from 'axios';
import { getAuthToken, removeAuthTokens, refreshAuthToken } from '../utils/tokenUtils';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshAuthToken();
        const newToken = getAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        removeAuthTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. **Authentication Context (src/contexts/AuthContext.tsx)**
```typescript
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, UserRole } from '../api/types';
import { getAuthToken, getUserFromToken, removeAuthTokens } from '../utils/tokenUtils';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
}

interface AuthContextType {
  state: AuthState;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth reducer for state management
const authReducer = (state: AuthState, action: any): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        role: action.payload.user.role,
        loading: false,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        user: null,
        role: null,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      try {
        const user = getUserFromToken(token);
        dispatch({ type: 'LOGIN', payload: { user } });
      } catch (error) {
        removeAuthTokens();
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = (token: string) => {
    const user = getUserFromToken(token);
    dispatch({ type: 'LOGIN', payload: { user } });
  };

  const logout = () => {
    removeAuthTokens();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 4. **Protected Route Component (src/components/common/ProtectedRoute.tsx)**
```typescript
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../api/types';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true
}) => {
  const { state } = useAuth();
  const location = useLocation();

  if (state.loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if authentication required but user not authenticated
  if (requireAuth && !state.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  if (allowedRoles.length > 0 && state.user && !allowedRoles.includes(state.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

---

## 🗺️ Router Configuration

### Main App Router (src/App.tsx)
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/student/StudentDashboard';
import ProfessorDashboard from './pages/professor/ProfessorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import { UserRole } from './api/types';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Dashboard redirect based on role */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Student routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              
              {/* Professor routes */}
              <Route path="/professor/*" element={
                <ProtectedRoute allowedRoles={[UserRole.PROFESSOR, UserRole.ADMIN]}>
                  <ProfessorDashboard />
                </ProtectedRoute>
              } />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={
                <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
```

---

## 🎨 UI Framework Integration

### Material-UI Theme Setup
```typescript
// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});
```

---

## 📝 React Query Setup

### Custom Hooks for API (src/hooks/useApi.ts)
```typescript
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authAPI, advisoryAPI, userAPI } from '../api/endpoints';
import { LoginDto, CreateAdvisoryRequestDto } from '../api/types';

// Auth hooks
export const useLogin = () => {
  return useMutation(authAPI.login);
};

// Advisory hooks
export const useMyAdvisoryRequests = () => {
  return useQuery('myAdvisoryRequests', advisoryAPI.getMyRequests);
};

export const useCreateAdvisoryRequest = () => {
  const queryClient = useQueryClient();
  return useMutation(advisoryAPI.createRequest, {
    onSuccess: () => {
      queryClient.invalidateQueries('myAdvisoryRequests');
    },
  });
};

// User hooks
export const useProfessors = () => {
  return useQuery('professors', userAPI.getProfessors);
};
```

---

## 🔔 Notification Setup

### Toast Notification Configuration
```typescript
// src/components/common/NotificationProvider.tsx
import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};
```

---

## 🚀 Getting Started Steps

1. **Copy this entire documentation folder to your React project root**
2. **Install dependencies using the commands above**
3. **Copy backend-types.ts to src/api/types.ts**
4. **Set up environment variables**
5. **Implement the basic components and contexts**
6. **Start with the authentication flow**
7. **Build feature by feature using the user flows as reference**

---

## 💡 GitHub Copilot Usage Tips

When working with GitHub Copilot on this project:

1. **Always mention the role** when creating components:
   - "Create a StudentDashboard component"
   - "Build a ProfessorRequestReview component"

2. **Reference the API types**:
   - "Use AdvisoryRequestDto for the form"
   - "Return User[] from this API call"

3. **Mention the API endpoint**:
   - "Call GET /advisory-requests/my-requests"
   - "Submit to POST /auth/login"

4. **Specify the UI framework**:
   - "Create a Material-UI form for advisory requests"
   - "Build an Ant Design table for user management"

5. **Reference user flows**:
   - "Implement the student advisory request flow"
   - "Create the professor approval workflow"

This setup provides everything GitHub Copilot needs to understand your project and generate appropriate React code!