# 🚀 React Dependencies & Migration Guide
# School Advisories System - Frontend Implementation

---

## 🎯 **RECOMMENDED TECH STACK**

### **Core Framework**
- **React 18** + **TypeScript** + **Vite** 
- **Why**: Modern tooling, fast development, excellent TypeScript support

### **UI Framework: Material-UI (MUI) ✅ RECOMMENDED**
- **Primary Choice**: Material-UI with date/time components
- **Why Perfect for This Project**:
  - ✅ **Built-in date/time pickers** (critical for advisory scheduling)
  - ✅ **DataGrid component** (perfect for admin tables and reports)
  - ✅ **Professional dashboard components**
  - ✅ **Role-based UI patterns** (cards, stepper, tabs)
  - ✅ **Excellent TypeScript support**
  - ✅ **Enterprise-ready accessibility**

---

## 📦 **COMPLETE DEPENDENCIES LIST**

### **🔧 Project Creation Command**
```bash
# Create Vite + React + TypeScript project
npm create vite@latest school-advisories-frontend -- --template react-ts
cd school-advisories-frontend
```

### **🎨 UI Framework & Styling**
```bash
# Material-UI Core
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# MUI Advanced Components (CRITICAL for advisory system)
npm install @mui/x-date-pickers        # Date/Time pickers
npm install @mui/x-data-grid           # Advanced tables for admin
npm install @mui/x-date-pickers-pro    # Optional: Advanced calendar features
```

### **📅 Date Management (CRITICAL for scheduling)**
```bash
# Primary date library - tree-shakable and TypeScript native
npm install date-fns

# MUI Date Picker Adapter
npm install @mui/x-date-pickers/AdapterDateFns
```

### **🌐 API & State Management**
```bash
# Modern data fetching with caching
npm install @tanstack/react-query

# HTTP client with interceptors for JWT
npm install axios

# Lightweight state management
npm install zustand

# Cookie management for JWT storage
npm install js-cookie @types/js-cookie
```

### **🧭 Navigation & Routing**
```bash
# Client-side routing
npm install react-router-dom
npm install -D @types/react-router-dom
```

### **🔔 Notifications & UX**
```bash
# Toast notifications (better than MUI snackbar for complex notifications)
npm install react-hot-toast

# Smooth animations (optional but recommended)
npm install framer-motion
```

### **📊 Charts & Visualization (Future Features)**
```bash
# For admin dashboards and reports
npm install recharts

# Alternative: Lightweight charts
npm install chart.js react-chartjs-2
```

### **🛠️ Development Tools**
```bash
# TypeScript definitions
npm install -D @types/react @types/react-dom @types/node

# Code quality
npm install -D eslint prettier eslint-plugin-prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser

# Vite plugins
npm install -D @vitejs/plugin-react
```

### **🧪 Testing (Recommended)**
```bash
# Testing framework
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jsdom
```

### **📝 Form Management (Optional but Recommended)**
```bash
# Advanced form handling with validation
npm install react-hook-form @hookform/resolvers yup
```

---

## 📋 **COMPLETE PACKAGE.JSON TEMPLATE**

```json
{
  "name": "school-advisories-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    
    "@mui/material": "^5.15.0",
    "@mui/icons-material": "^5.15.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/x-date-pickers": "^6.18.0",
    "@mui/x-data-grid": "^6.18.0",
    
    "date-fns": "^2.30.0",
    
    "@tanstack/react-query": "^5.8.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    
    "js-cookie": "^3.0.5",
    "react-hot-toast": "^2.4.0",
    "framer-motion": "^10.16.0",
    
    "react-hook-form": "^7.47.0",
    "@hookform/resolvers": "^3.3.0",
    "yup": "^1.3.3",
    
    "recharts": "^2.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.0.0",
    "@types/js-cookie": "^3.0.6",
    
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5",
    "typescript": "^5.0.2",
    
    "eslint": "^8.45.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.3",
    "prettier": "^3.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    
    "vitest": "^0.34.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jsdom": "^22.1.0"
  }
}
```

---

## 🏗️ **PROJECT STRUCTURE**

```
school-advisories-frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios configuration with JWT interceptor
│   │   ├── types.ts               # Copy from backend-types.ts
│   │   ├── endpoints/
│   │   │   ├── auth.ts            # Authentication API calls
│   │   │   ├── advisories.ts      # Advisory-related API calls
│   │   │   ├── users.ts           # User management API calls
│   │   │   ├── subjects.ts        # Subject API calls
│   │   │   └── notifications.ts   # Notification API calls
│   │   └── hooks/
│   │       ├── useAuth.ts         # Authentication hooks
│   │       ├── useAdvisories.ts   # Advisory hooks
│   │       └── useUsers.ts        # User management hooks
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout.tsx         # Main app layout with navigation
│   │   │   ├── ProtectedRoute.tsx # Route protection component
│   │   │   ├── LoadingSpinner.tsx # Loading states
│   │   │   ├── ErrorBoundary.tsx  # Error handling
│   │   │   └── NotificationProvider.tsx # Toast provider
│   │   ├── forms/
│   │   │   ├── AdvisoryRequestForm.tsx
│   │   │   ├── SessionCreationForm.tsx
│   │   │   └── UserManagementForm.tsx
│   │   ├── calendars/
│   │   │   ├── AvailabilityCalendar.tsx
│   │   │   ├── SessionCalendar.tsx
│   │   │   └── DateTimePickers.tsx
│   │   ├── tables/
│   │   │   ├── RequestsDataGrid.tsx
│   │   │   ├── UsersDataGrid.tsx
│   │   │   └── SessionsDataGrid.tsx
│   │   ├── cards/
│   │   │   ├── DashboardCards.tsx
│   │   │   ├── RequestCard.tsx
│   │   │   └── SessionCard.tsx
│   │   └── navigation/
│   │       ├── AppBar.tsx
│   │       ├── Sidebar.tsx
│   │       └── BreadcrumbNav.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   └── LogoutPage.tsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── MyRequests.tsx
│   │   │   ├── MyInvitations.tsx
│   │   │   └── MySchedule.tsx
│   │   ├── professor/
│   │   │   ├── ProfessorDashboard.tsx
│   │   │   ├── PendingRequests.tsx
│   │   │   ├── MyAvailability.tsx
│   │   │   ├── CreateSession.tsx
│   │   │   └── ManageSessions.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── UserManagement.tsx
│   │       ├── SubjectManagement.tsx
│   │       ├── VenueManagement.tsx
│   │       └── EmailTemplates.tsx
│   │
│   ├── store/
│   │   ├── authStore.ts           # Zustand auth store
│   │   ├── notificationStore.ts   # Global notifications
│   │   └── uiStore.ts             # UI state (sidebar, theme, etc.)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts             # Authentication logic
│   │   ├── useNotifications.ts    # Toast notifications
│   │   ├── useLocalStorage.ts     # Local storage hook
│   │   └── usePermissions.ts      # Role-based permissions
│   │
│   ├── utils/
│   │   ├── constants.ts           # App constants and enums
│   │   ├── dateUtils.ts           # Date formatting and validation
│   │   ├── formatters.ts          # Data formatting utilities
│   │   ├── validators.ts          # Form validation schemas
│   │   └── apiHelpers.ts          # API utility functions
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Authentication context
│   │   ├── ThemeContext.tsx       # MUI theme provider
│   │   └── QueryContext.tsx       # React Query provider
│   │
│   ├── theme/
│   │   ├── index.ts               # MUI theme configuration
│   │   ├── colors.ts              # Color palette
│   │   └── typography.ts          # Typography settings
│   │
│   ├── types/
│   │   ├── api.ts                 # API-specific types
│   │   ├── components.ts          # Component prop types
│   │   └── common.ts              # Shared types
│   │
│   ├── config/
│   │   ├── environment.ts         # Environment configuration
│   │   └── api.ts                 # API configuration
│   │
│   └── __tests__/                 # Test files
│       ├── components/
│       ├── pages/
│       └── utils/
│
├── .env.development
├── .env.production
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
└── README.md
```

---

## ⚙️ **CRITICAL CONFIGURATION FILES**

### **1. Vite Configuration (vite.config.ts)**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@api': resolve(__dirname, 'src/api'),
      '@types': resolve(__dirname, 'src/types'),
      '@store': resolve(__dirname, 'src/store')
    }
  },
  define: {
    'process.env': process.env
  }
});
```

### **2. TypeScript Configuration (tsconfig.json)**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@pages/*": ["src/pages/*"],
      "@utils/*": ["src/utils/*"],
      "@api/*": ["src/api/*"],
      "@types/*": ["src/types/*"],
      "@store/*": ["src/store/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### **3. Environment Variables (.env.development)**
```env
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=10000

# JWT Configuration  
VITE_JWT_STORAGE_KEY=auth_token
VITE_REFRESH_TOKEN_KEY=refresh_token
VITE_TOKEN_EXPIRY_BUFFER=300000

# App Configuration
VITE_APP_NAME=School Advisories System
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=development

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REAL_TIME=false
VITE_ENABLE_ANALYTICS=false
VITE_DEBUG_MODE=true

# MUI Configuration
VITE_THEME_MODE=light
VITE_THEME_PRIMARY_COLOR=#1976d2
VITE_THEME_SECONDARY_COLOR=#dc004e
```

### **4. Production Environment (.env.production)**
```env
VITE_API_BASE_URL=https://api.school-advisories.com
VITE_API_TIMEOUT=15000
VITE_JWT_STORAGE_KEY=auth_token
VITE_REFRESH_TOKEN_KEY=refresh_token
VITE_TOKEN_EXPIRY_BUFFER=300000
VITE_APP_NAME=School Advisories System
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false
VITE_THEME_MODE=light
VITE_THEME_PRIMARY_COLOR=#1976d2
VITE_THEME_SECONDARY_COLOR=#dc004e
```

---

## 🔧 **ESSENTIAL SETUP IMPLEMENTATIONS**

### **1. MUI Theme Provider (src/theme/index.ts)**
```typescript
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const theme = createTheme({
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
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default theme;
```

### **2. API Client with JWT Interceptors (src/api/client.ts)**
```typescript
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          const { accessToken } = response.data;
          localStorage.setItem(import.meta.env.VITE_JWT_STORAGE_KEY, accessToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY);
        localStorage.removeItem(import.meta.env.VITE_REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle different error types
    if (error.response?.status === 400) {
      toast.error('Error de validación');
    } else if (error.response?.status === 403) {
      toast.error('No tienes permisos para esta acción');
    } else if (error.response?.status === 404) {
      toast.error('Recurso no encontrado');
    } else if (error.response?.status >= 500) {
      toast.error('Error del servidor. Intenta nuevamente.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

### **3. React Query Provider (src/contexts/QueryContext.tsx)**
```typescript
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors except 408 (timeout)
        if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 408) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.VITE_DEBUG_MODE && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export { queryClient };
```

### **4. Date Utilities (src/utils/dateUtils.ts)**
```typescript
import { format, parseISO, isValid, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj) ? format(dateObj, formatStr, { locale: es }) : 'Fecha inválida';
  } catch {
    return 'Fecha inválida';
  }
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatTime = (date: Date | string): string => {
  return formatDate(date, 'HH:mm');
};

export const getWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
};

export const isBusinessDay = (date: Date): boolean => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday to Friday
};

export const addBusinessDays = (date: Date, days: number): Date => {
  let result = new Date(date);
  let addedDays = 0;
  
  while (addedDays < days) {
    result = addDays(result, 1);
    if (isBusinessDay(result)) {
      addedDays++;
    }
  }
  
  return result;
};

export const isDateInFuture = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj > new Date();
};

export const getMinSelectableDate = (): Date => {
  // Minimum date for scheduling (next business day)
  return addBusinessDays(new Date(), 1);
};

export const getMaxSelectableDate = (): Date => {
  // Maximum date for scheduling (6 months from now)
  return addDays(new Date(), 180);
};
```

---

## 🚀 **MIGRATION STEP-BY-STEP GUIDE**

### **Phase 1: Project Setup (Day 1)**
```bash
# 1. Create project
npm create vite@latest school-advisories-frontend -- --template react-ts
cd school-advisories-frontend

# 2. Install core dependencies
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install @mui/x-date-pickers @mui/x-data-grid
npm install date-fns @tanstack/react-query axios zustand

# 3. Setup project structure
mkdir -p src/{api,components,pages,store,hooks,utils,contexts,theme,types,config}

# 4. Copy documentation files
# Copy backend-types.ts to src/api/types.ts
# Copy api-client-examples.ts to src/api/examples.ts for reference
```

### **Phase 2: Core Setup (Day 2-3)**
```bash
# 1. Install remaining dependencies
npm install react-router-dom react-hot-toast js-cookie
npm install -D @types/js-cookie

# 2. Setup providers and configuration files
# - Create theme provider
# - Setup API client with interceptors  
# - Configure React Query
# - Setup authentication context

# 3. Create basic layout and routing
```

### **Phase 3: Authentication (Day 4-5)**
```bash
# Focus on login/logout functionality
# - Login form with MUI components
# - JWT storage and refresh logic
# - Protected route component
# - Basic navigation structure
```

### **Phase 4: Student Features (Week 2)**
```bash
# Implement student-specific features:
# - Student dashboard
# - Advisory request form
# - My requests list
# - My invitations
# - Session calendar
```

### **Phase 5: Professor Features (Week 3)**
```bash
# Implement professor-specific features:
# - Professor dashboard
# - Pending requests management
# - Session creation
# - Availability management
# - Attendance recording
```

### **Phase 6: Admin Features (Week 4)**
```bash
# Implement admin-specific features:
# - Admin dashboard with statistics
# - User management (DataGrid)
# - Subject management
# - Venue management
# - Email template editor
```

### **Phase 7: Polish & Testing (Week 5)**
```bash
# Final touches:
# - Error boundaries
# - Loading states
# - Toast notifications
# - Responsive design
# - Unit testing
# - End-to-end testing
```

---

## 💡 **COMPONENT EXAMPLES FOR ADVISORY SYSTEM**

### **1. Advisory Request Form with MUI Components**
```tsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';

interface AdvisoryRequestFormProps {
  subjects: Subject[];
  professors: User[];
  onSubmit: (data: CreateAdvisoryRequestDto) => void;
}

export function AdvisoryRequestForm({ subjects, professors, onSubmit }: AdvisoryRequestFormProps) {
  const { control, handleSubmit, watch } = useForm<CreateAdvisoryRequestDto>();
  const selectedSubject = watch('subjectId');

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Solicitar Asesoría Académica
        </Typography>
        
        <Stepper activeStep={0} sx={{ mb: 3 }}>
          <Step><StepLabel>Seleccionar Materia</StepLabel></Step>
          <Step><StepLabel>Elegir Profesor</StepLabel></Step>
          <Step><StepLabel>Detalles de la Solicitud</StepLabel></Step>
        </Stepper>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Materia</InputLabel>
            <Controller
              name="subjectId"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Materia">
                  {subjects.map((subject) => (
                    <MenuItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Profesor</InputLabel>
            <Controller
              name="professorId"
              control={control}
              render={({ field }) => (
                <Select {...field} label="Profesor" disabled={!selectedSubject}>
                  {professors
                    .filter(prof => prof.subjects?.some(s => s.id === selectedSubject))
                    .map((professor) => (
                      <MenuItem key={professor.id} value={professor.id}>
                        {`${professor.firstName} ${professor.lastName}`}
                      </MenuItem>
                    ))}
                </Select>
              )}
            />
          </FormControl>

          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                rows={4}
                label="Describe qué necesitas en esta asesoría"
                placeholder="Ejemplo: Tengo dudas sobre derivadas parciales del tema 3..."
                sx={{ mb: 2 }}
              />
            )}
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button type="submit" variant="contained" size="large">
              Enviar Solicitud
            </Button>
            <Button variant="outlined" size="large">
              Cancelar
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
```

### **2. Professor Dashboard with Real-time Data**
```tsx
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Badge,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { formatDateTime } from '@utils/dateUtils';

export function ProfessorDashboard() {
  const { data: pendingRequests } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: () => api.get('/advisory-requests/pending'),
    refetchInterval: 10000 // Auto-refresh every 10 seconds
  });

  const { data: todaySessions } = useQuery({
    queryKey: ['todaySessions'],
    queryFn: () => api.get('/advisories/today'),
    refetchInterval: 30000
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard - Profesor
      </Typography>

      <Grid container spacing={3}>
        {/* Pending Requests Widget */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  <Badge badgeContent={pendingRequests?.length || 0} color="primary">
                    Solicitudes Pendientes
                  </Badge>
                </Typography>
              </Box>
              <Typography variant="h3" color="primary" sx={{ my: 2 }}>
                {pendingRequests?.length || 0}
              </Typography>
              <Button variant="contained" size="small">
                Revisar Todas
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Sessions */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sesiones de Hoy
              </Typography>
              {todaySessions?.length > 0 ? (
                <List>
                  {todaySessions.map((session: Advisory) => (
                    <ListItem key={session.id}>
                      <ListItemText
                        primary={session.topic}
                        secondary={`${formatDateTime(session.scheduledStartTime)} - ${session.venue.name}`}
                      />
                      <Chip
                        label={session.status}
                        color={getSessionStatusColor(session.status)}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="textSecondary">
                  No tienes sesiones programadas para hoy
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
```

### **3. Advanced DataGrid for Admin**
```tsx
import React from 'react';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { Chip, IconButton } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { formatDateTime } from '@utils/dateUtils';

interface RequestsDataGridProps {
  requests: AdvisoryRequest[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (id: number) => void;
}

export function RequestsDataGrid({ requests, onEdit, onDelete, onView }: RequestsDataGridProps) {
  const columns: GridColDef[] = [
    {
      field: 'student',
      headerName: 'Estudiante',
      width: 200,
      valueGetter: (params) => `${params.row.student.firstName} ${params.row.student.lastName}`
    },
    {
      field: 'professor',
      headerName: 'Profesor',
      width: 200,
      valueGetter: (params) => `${params.row.professor.firstName} ${params.row.professor.lastName}`
    },
    {
      field: 'subject',
      headerName: 'Materia',
      width: 150,
      valueGetter: (params) => params.row.subject.name
    },
    {
      field: 'createdAt',
      headerName: 'Fecha de Solicitud',
      width: 180,
      valueFormatter: (params) => formatDateTime(params.value)
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getRequestStatusColor(params.value)}
          size="small"
        />
      )
    },
    {
      field: 'message',
      headerName: 'Mensaje',
      width: 300,
      renderCell: (params) => (
        <div style={{ 
          whiteSpace: 'normal', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          maxHeight: '60px' 
        }}>
          {params.value}
        </div>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Acciones',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="Ver"
          onClick={() => onView(params.id as number)}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Editar"
          onClick={() => onEdit(params.id as number)}
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Eliminar"
          onClick={() => onDelete(params.id as number)}
        />
      ]
    }
  ];

  return (
    <div style={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={requests}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
        disableSelectionOnClick
        autoHeight
        getRowHeight={() => 'auto'}
        sx={{
          '& .MuiDataGrid-cell': {
            py: 1,
          }
        }}
      />
    </div>
  );
}

function getRequestStatusColor(status: string): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'error';
    case 'CANCELLED': return 'default';
    default: return 'default';
  }
}
```

---

## 🎯 **NEXT STEPS AFTER DEPENDENCIES INSTALLATION**

### **Immediate Actions**
1. **Copy this file** to your React project root as `DEPENDENCIES_GUIDE.md`
2. **Copy backend documentation** files to appropriate locations
3. **Run installation commands** in the order specified
4. **Setup configuration files** (vite.config.ts, tsconfig.json, .env files)

### **Development Workflow**
1. **Start with authentication** - It's the foundation
2. **Build one role at a time** - Student → Professor → Admin
3. **Use backend-types.ts** for all component interfaces
4. **Reference user-flows.md** when building components
5. **Test with real backend** from day one

### **GitHub Copilot Integration**
- With this setup, Copilot will understand your project perfectly
- Use specific prompts referencing the backend types
- Mention MUI components explicitly in your prompts
- Reference the user flows when asking for component creation

---

This guide provides everything needed to start React development with full context for GitHub Copilot! 🚀