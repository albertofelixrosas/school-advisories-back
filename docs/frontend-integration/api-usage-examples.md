# 🚀 API Usage Examples - School Advisories System

> **Purpose**: This document provides copy-paste ready code examples for GitHub Copilot to understand how to interact with your backend API in React.

---

## 📋 Table of Contents

1. [Setup & Configuration](#setup--configuration)
2. [Authentication](#authentication)
3. [Advisory Requests](#advisory-requests)
4. [Sessions Management](#sessions-management)
5. [Professor Availability](#professor-availability)
6. [Student Invitations](#student-invitations)
7. [Notifications](#notifications)
8. [Error Handling](#error-handling)

---

## 🔧 Setup & Configuration

### Install Dependencies
```bash
npm install axios @tanstack/react-query
```

### API Client Setup (src/api/client.ts)

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          
          localStorage.setItem('access_token', data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          
          return apiClient(originalRequest);
        } catch (refreshError) {
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔐 Authentication

### 1. Login

```typescript
// src/api/auth.ts
import apiClient from './client';
import type { LoginDto, LoginResponse } from './types';

export const authAPI = {
  async login(credentials: LoginDto): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    
    return data;
  },
  
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.clear();
      window.location.href = '/login';
    }
  },
  
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken });
    return data;
  }
};
```

### Usage in React Component

```tsx
// src/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(credentials);
      toast.success(`¡Bienvenido ${response.user.name}!`);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        value={credentials.username}
        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
        placeholder="Usuario"
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        placeholder="Contraseña"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

---

## 📝 Advisory Requests (Student → Professor)

### API Functions

```typescript
// src/api/advisoryRequests.ts
import apiClient from './client';
import type {
  CreateAdvisoryRequestDto,
  AdvisoryRequestResponseDto,
  UpdateAdvisoryRequestDto
} from './types';

export const advisoryRequestsAPI = {
  // Student: Create new request
  async create(data: CreateAdvisoryRequestDto): Promise<AdvisoryRequestResponseDto> {
    const response = await apiClient.post('/advisory-requests', data);
    return response.data;
  },

  // Student: Get my requests
  async getMyRequests(): Promise<AdvisoryRequestResponseDto[]> {
    const response = await apiClient.get('/advisory-requests/my-requests');
    return response.data;
  },

  // Professor: Get pending requests
  async getPending(): Promise<AdvisoryRequestResponseDto[]> {
    const response = await apiClient.get('/advisory-requests/pending');
    return response.data;
  },

  // Professor: Approve request
  async approve(id: number, responseMessage?: string): Promise<AdvisoryRequestResponseDto> {
    const response = await apiClient.patch(`/advisory-requests/${id}/approve`, {
      professor_response: responseMessage
    });
    return response.data;
  },

  // Professor: Reject request
  async reject(id: number, reason: string): Promise<AdvisoryRequestResponseDto> {
    const response = await apiClient.patch(`/advisory-requests/${id}/reject`, {
      professor_response: reason
    });
    return response.data;
  },

  // Student: Cancel request
  async cancel(id: number): Promise<void> {
    await apiClient.delete(`/advisory-requests/${id}`);
  }
};
```

### React Component Example: Request Advisory Form

```tsx
// src/components/student/RequestAdvisoryForm.tsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advisoryRequestsAPI } from '../../api/advisoryRequests';
import { subjectsAPI } from '../../api/subjects';
import { usersAPI } from '../../api/users';
import toast from 'react-hot-toast';

export function RequestAdvisoryForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    subject_detail_id: 0,
    student_message: ''
  });

  // Fetch subjects
  const { data: subjects } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectsAPI.getAll
  });

  // Fetch professors for selected subject
  const { data: professors } = useQuery({
    queryKey: ['professors', formData.subject_detail_id],
    queryFn: () => usersAPI.getProfessors(),
    enabled: !!formData.subject_detail_id
  });

  // Create request mutation
  const createMutation = useMutation({
    mutationFn: advisoryRequestsAPI.create,
    onSuccess: () => {
      toast.success('¡Solicitud enviada correctamente!');
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
      setFormData({ subject_detail_id: 0, student_message: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al enviar solicitud');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={formData.subject_detail_id}
        onChange={(e) => setFormData({ ...formData, subject_detail_id: Number(e.target.value) })}
        required
      >
        <option value="">Selecciona una materia</option>
        {subjects?.map(subject => (
          <option key={subject.subject_id} value={subject.subject_id}>
            {subject.name}
          </option>
        ))}
      </select>

      <textarea
        value={formData.student_message}
        onChange={(e) => setFormData({ ...formData, student_message: e.target.value })}
        placeholder="Describe qué necesitas en esta asesoría..."
        required
      />

      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Enviando...' : 'Solicitar Asesoría'}
      </button>
    </form>
  );
}
```

### React Component Example: Professor Pending Requests

```tsx
// src/components/professor/PendingRequests.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { advisoryRequestsAPI } from '../../api/advisoryRequests';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function PendingRequests() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: advisoryRequestsAPI.getPending,
    refetchInterval: 10000 // Auto-refresh every 10 seconds
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, message }: { id: number; message: string }) =>
      advisoryRequestsAPI.approve(id, message),
    onSuccess: () => {
      toast.success('Solicitud aprobada');
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      setSelectedRequest(null);
      setResponseMessage('');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      advisoryRequestsAPI.reject(id, reason),
    onSuccess: () => {
      toast.success('Solicitud rechazada');
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      setSelectedRequest(null);
      setResponseMessage('');
    }
  });

  if (isLoading) return <div>Cargando solicitudes...</div>;

  return (
    <div>
      <h2>Solicitudes Pendientes ({requests?.length || 0})</h2>
      
      {requests?.map(request => (
        <div key={request.request_id} className="request-card">
          <h3>{request.student.name} {request.student.last_name}</h3>
          <p><strong>Materia:</strong> {request.subject_detail.subject.name}</p>
          <p><strong>Mensaje:</strong> {request.student_message}</p>
          <p><strong>Fecha:</strong> {new Date(request.created_at).toLocaleDateString()}</p>

          {selectedRequest === request.request_id ? (
            <div>
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Mensaje de respuesta (opcional)"
              />
              <button
                onClick={() => approveMutation.mutate({
                  id: request.request_id,
                  message: responseMessage
                })}
                disabled={approveMutation.isPending}
              >
                ✅ Aprobar
              </button>
              <button
                onClick={() => {
                  if (responseMessage.trim()) {
                    rejectMutation.mutate({
                      id: request.request_id,
                      reason: responseMessage
                    });
                  } else {
                    toast.error('Debes proporcionar una razón para rechazar');
                  }
                }}
                disabled={rejectMutation.isPending}
              >
                ❌ Rechazar
              </button>
              <button onClick={() => setSelectedRequest(null)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setSelectedRequest(request.request_id)}>
              Responder
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 📅 Sessions Management

### API Functions

```typescript
// src/api/advisories.ts
import apiClient from './client';
import type {
  CreateDirectSessionDto,
  AdvisoryResponseDto,
  InviteStudentsDto,
  BulkAttendanceDto
} from './types';

export const advisoriesAPI = {
  // Professor: Create direct session
  async createDirectSession(data: CreateDirectSessionDto): Promise<AdvisoryResponseDto> {
    const response = await apiClient.post('/advisories/direct-session', data);
    return response.data;
  },

  // Get my sessions (student or professor)
  async getMySessions(): Promise<AdvisoryResponseDto[]> {
    const response = await apiClient.get('/advisories/my-sessions');
    return response.data;
  },

  // Get session details
  async getSessionDetails(id: number): Promise<AdvisoryResponseDto> {
    const response = await apiClient.get(`/advisories/sessions/${id}`);
    return response.data;
  },

  // Professor: Invite students to session
  async inviteStudents(sessionId: number, data: InviteStudentsDto): Promise<void> {
    await apiClient.post(`/advisories/sessions/${sessionId}/invite`, data);
  },

  // Professor: Record attendance
  async recordAttendance(sessionId: number, data: BulkAttendanceDto): Promise<void> {
    await apiClient.patch(`/advisories/sessions/${sessionId}/attendance`, data);
  },

  // Professor: Complete session
  async completeSession(sessionId: number, notes?: string): Promise<AdvisoryResponseDto> {
    const response = await apiClient.patch(`/advisories/sessions/${sessionId}/complete`, {
      notes
    });
    return response.data;
  },

  // Cancel session
  async cancelSession(sessionId: number, reason: string): Promise<void> {
    await apiClient.patch(`/advisories/sessions/${sessionId}/cancel`, { reason });
  }
};
```

### React Component: Session Calendar

```tsx
// src/components/common/SessionCalendar.tsx
import { useQuery } from '@tanstack/react-query';
import { advisoriesAPI } from '../../api/advisories';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function SessionCalendar() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['mySessions'],
    queryFn: advisoriesAPI.getMySessions
  });

  if (isLoading) return <div>Cargando calendario...</div>;

  const groupedByDate = sessions?.reduce((acc, session) => {
    const date = format(new Date(session.advisory_dates[0].date), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(session);
    return acc;
  }, {} as Record<string, typeof sessions>);

  return (
    <div className="calendar">
      {Object.entries(groupedByDate || {}).map(([date, sessions]) => (
        <div key={date} className="calendar-day">
          <h3>{format(new Date(date), 'EEEE, d MMMM', { locale: es })}</h3>
          {sessions.map(session => (
            <div key={session.advisory_id} className="session-card">
              <p><strong>{session.subject_detail.subject.name}</strong></p>
              <p>Profesor: {session.professor.name}</p>
              <p>Hora: {format(new Date(session.advisory_dates[0].date), 'HH:mm')}</p>
              <p>Lugar: {session.advisory_dates[0].venue.name}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

---

## 👨‍🏫 Professor Availability

### API Functions

```typescript
// src/api/availability.ts
import apiClient from './client';
import type {
  CreateAvailabilitySlotDto,
  AvailabilitySlotResponseDto,
  UpdateAvailabilitySlotDto
} from './types';

export const availabilityAPI = {
  // Get my availability
  async getMyAvailability(): Promise<AvailabilitySlotResponseDto[]> {
    const response = await apiClient.get('/professor-availability/my-availability');
    return response.data;
  },

  // Create availability slot
  async create(data: CreateAvailabilitySlotDto): Promise<AvailabilitySlotResponseDto> {
    const response = await apiClient.post('/professor-availability', data);
    return response.data;
  },

  // Update availability slot
  async update(id: number, data: UpdateAvailabilitySlotDto): Promise<AvailabilitySlotResponseDto> {
    const response = await apiClient.patch(`/professor-availability/${id}`, data);
    return response.data;
  },

  // Delete availability slot
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/professor-availability/${id}`);
  },

  // Toggle active status
  async toggleActive(id: number): Promise<AvailabilitySlotResponseDto> {
    const response = await apiClient.patch(`/professor-availability/${id}/toggle-active`);
    return response.data;
  }
};
```

---

## 💌 Student Invitations

### API Functions

```typescript
// src/api/invitations.ts
import apiClient from './client';
import type { InvitationResponseDto, RespondInvitationDto } from './types';

export const invitationsAPI = {
  // Student: Get my invitations
  async getMyInvitations(): Promise<InvitationResponseDto[]> {
    const response = await apiClient.get('/student-invitations/my-invitations');
    return response.data;
  },

  // Student: Respond to invitation
  async respond(id: number, data: RespondInvitationDto): Promise<InvitationResponseDto> {
    const response = await apiClient.post(`/student-invitations/${id}/respond`, data);
    return response.data;
  }
};
```

### React Component: My Invitations

```tsx
// src/components/student/MyInvitations.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationsAPI } from '../../api/invitations';
import { useState } from 'react';
import toast from 'react-hot-toast';

export function MyInvitations() {
  const queryClient = useQueryClient();
  const [selectedInvitation, setSelectedInvitation] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const { data: invitations } = useQuery({
    queryKey: ['myInvitations'],
    queryFn: invitationsAPI.getMyInvitations
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, accepted, message }: { id: number; accepted: boolean; message?: string }) =>
      invitationsAPI.respond(id, { accepted, message }),
    onSuccess: (_, variables) => {
      toast.success(variables.accepted ? 'Invitación aceptada' : 'Invitación rechazada');
      queryClient.invalidateQueries({ queryKey: ['myInvitations'] });
      setSelectedInvitation(null);
      setMessage('');
    }
  });

  const pendingInvitations = invitations?.filter(inv => inv.status === 'PENDING');

  return (
    <div>
      <h2>Mis Invitaciones ({pendingInvitations?.length || 0})</h2>
      
      {pendingInvitations?.map(invitation => (
        <div key={invitation.invitation_id}>
          <h3>Invitación de {invitation.advisory.professor.name}</h3>
          <p>Materia: {invitation.advisory.subject_detail.subject.name}</p>
          <p>Fecha: {new Date(invitation.advisory.advisory_dates[0].date).toLocaleDateString()}</p>
          <p>Mensaje: {invitation.invitation_message}</p>

          {selectedInvitation === invitation.invitation_id ? (
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mensaje de respuesta (opcional)"
              />
              <button
                onClick={() => respondMutation.mutate({
                  id: invitation.invitation_id,
                  accepted: true,
                  message
                })}
              >
                ✅ Aceptar
              </button>
              <button
                onClick={() => respondMutation.mutate({
                  id: invitation.invitation_id,
                  accepted: false,
                  message
                })}
              >
                ❌ Rechazar
              </button>
            </div>
          ) : (
            <button onClick={() => setSelectedInvitation(invitation.invitation_id)}>
              Responder
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🔔 Notifications

### API Functions

```typescript
// src/api/notifications.ts
import apiClient from './client';
import type {
  NotificationPreferencesDto,
  UpdateNotificationPreferencesDto
} from './types';

export const notificationsAPI = {
  // Get my preferences
  async getMyPreferences(): Promise<NotificationPreferencesDto> {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  // Update preferences
  async updatePreferences(data: UpdateNotificationPreferencesDto): Promise<NotificationPreferencesDto> {
    const response = await apiClient.patch('/notifications/preferences', data);
    return response.data;
  },

  // Get notification history
  async getHistory(): Promise<any[]> {
    const response = await apiClient.get('/notifications/history');
    return response.data;
  }
};
```

---

## ⚠️ Error Handling

### Global Error Handler

```typescript
// src/utils/errorHandler.ts
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export interface ApiError {
  message: string | string[];
  error?: string;
  statusCode: number;
}

export function handleApiError(error: unknown): void {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;

    if (apiError?.message) {
      const messages = Array.isArray(apiError.message) 
        ? apiError.message 
        : [apiError.message];
      
      messages.forEach(msg => toast.error(msg));
    } else {
      toast.error('Error de conexión con el servidor');
    }

    // Handle specific status codes
    switch (error.response?.status) {
      case 401:
        localStorage.clear();
        window.location.href = '/login';
        break;
      case 403:
        toast.error('No tienes permisos para esta acción');
        break;
      case 404:
        toast.error('Recurso no encontrado');
        break;
      case 422:
        // Validation errors already handled above
        break;
      case 500:
        toast.error('Error del servidor. Intenta nuevamente.');
        break;
    }
  } else {
    toast.error('Error desconocido');
  }
}
```

### Usage in Components

```tsx
import { handleApiError } from '../utils/errorHandler';
import { useMutation } from '@tanstack/react-query';

const mutation = useMutation({
  mutationFn: someAPIFunction,
  onError: handleApiError
});
```

---

## 🎯 React Query Setup

### Query Client Configuration

```typescript
// src/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

---

## 💡 Tips for GitHub Copilot

When working with GitHub Copilot on this project:

1. **Always mention the specific API**: 
   - "Use advisoryRequestsAPI.create to submit the form"
   - "Call advisoriesAPI.getMySessions for the calendar"

2. **Reference the types**:
   - "Use CreateAdvisoryRequestDto for form validation"
   - "Return AdvisoryResponseDto[] from this query"

3. **Specify the user role**:
   - "Create a professor dashboard component"
   - "Build a student request form"

4. **Use React Query patterns**:
   - "Create a useQuery hook for fetching pending requests"
   - "Add a useMutation for approving requests with optimistic updates"

5. **Error handling**:
   - "Use handleApiError for error toasts"
   - "Show loading spinner while mutation is pending"

This documentation provides everything GitHub Copilot needs to build your React frontend! 🚀
