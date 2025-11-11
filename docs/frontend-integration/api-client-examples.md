# API Client Examples for React + TypeScript

> 💡 **Note**: This file contains example code snippets for your React project.
> Copy these examples to your React project as needed when building components.

## 📋 Quick Reference

This document shows GitHub Copilot exactly how to interact with your backend API.
All examples use TypeScript and the types from `backend-types.ts`.

---

## 🔧 Base Configuration

```typescript
// Copy backend-types.ts to your React project: src/api/types.ts
import {
  LoginDto,
  LoginResponse,
  CreateAdvisoryRequestDto,
  AdvisoryRequestResponseDto,
  CreateDirectSessionDto,
  CreateAvailabilitySlotDto,
  RespondInvitationDto,
  BulkAttendanceDto,
  UpdateNotificationPreferencesDto,
  SubjectDetailDto,
  PublicUserDto,
  InvitationResponseDto,
  AvailabilitySlotResponseDto,
  ApiErrorResponse,
} from './types'; // Adjust path as needed

// Base configuration
const API_BASE_URL = 'http://localhost:3000';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};
```

---

// Helper function for authenticated requests
const createAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API response handler
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error: ApiErrorResponse = await response.json();
    throw new Error((error.message as string) || 'API request failed');
  }
  return response.json();
};

// ===== AUTHENTICATION API =====

export const authApi = {
  /**
   * Login user and get tokens + dashboard data
   * @example
   * const result = await authApi.login({ username: 'john_doe', password: 'password123' });
   * localStorage.setItem('access_token', result.access_token);
   */
  async login(credentials: LoginDto): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    return handleApiResponse<LoginResponse>(response);
  },

  /**
   * Get current user profile with role-specific data
   * @example
   * const profile = await authApi.getProfile();
   * console.log(`Welcome ${profile.user_info.name}!`);
   */
  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: createAuthHeaders(),
    });

    return handleApiResponse(response);
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    return handleApiResponse<LoginResponse>(response);
  },
};

// ===== ADVISORY REQUESTS API =====

export const advisoryRequestsApi = {
  /**
   * Create new advisory request (Student only)
   * @example
   * const request = await advisoryRequestsApi.create({
   *   subject_detail_id: 1,
   *   student_message: "Need help with React hooks",
   *   preferred_schedule: "Monday 10:00 AM"
   * });
   */
  async create(
    data: CreateAdvisoryRequestDto,
  ): Promise<AdvisoryRequestResponseDto> {
    const response = await fetch(`${API_BASE_URL}/advisory-requests`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleApiResponse<AdvisoryRequestResponseDto>(response);
  },

  /**
   * Get student's own advisory requests
   * @example
   * const requests = await advisoryRequestsApi.getMyRequests('PENDING');
   * console.log(`You have ${requests.length} pending requests`);
   */
  async getMyRequests(status?: string): Promise<AdvisoryRequestResponseDto[]> {
    const url = new URL(`${API_BASE_URL}/advisory-requests/my-requests`);
    if (status) url.searchParams.append('status', status);

    const response = await fetch(url.toString(), {
      headers: createAuthHeaders(),
    });

    return handleApiResponse<AdvisoryRequestResponseDto[]>(response);
  },

  /**
   * Get pending requests for professor
   * @example
   * const pendingRequests = await advisoryRequestsApi.getPendingRequests();
   * // Show notification badge if pendingRequests.length > 0
   */
  async getPendingRequests(): Promise<AdvisoryRequestResponseDto[]> {
    const response = await fetch(`${API_BASE_URL}/advisory-requests/pending`, {
      headers: createAuthHeaders(),
    });

    return handleApiResponse<AdvisoryRequestResponseDto[]>(response);
  },

  /**
   * Approve advisory request (Professor only)
   * @example
   * await advisoryRequestsApi.approve(123, {
   *   professor_response: "I'll help you with React hooks on Monday at 10 AM"
   * });
   */
  async approve(requestId: number, data: { professor_response?: string }) {
    const response = await fetch(
      `${API_BASE_URL}/advisory-requests/${requestId}/approve`,
      {
        method: 'PATCH',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    return handleApiResponse(response);
  },

  /**
   * Reject advisory request (Professor only)
   */
  async reject(requestId: number, data: { rejection_reason: string }) {
    const response = await fetch(
      `${API_BASE_URL}/advisory-requests/${requestId}/reject`,
      {
        method: 'PATCH',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    return handleApiResponse(response);
  },

  /**
   * Cancel advisory request (Student or Professor)
   */
  async cancel(requestId: number, data: { cancellation_reason: string }) {
    const response = await fetch(
      `${API_BASE_URL}/advisory-requests/${requestId}/cancel`,
      {
        method: 'PATCH',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    return handleApiResponse(response);
  },
};

// ===== ADVISORIES API =====

export const advisoriesApi = {
  /**
   * Create direct advisory session (Professor only)
   * @example
   * const session = await advisoriesApi.createDirectSession({
   *   subject_detail_id: 1,
   *   venue_id: 1,
   *   session_date: "2024-12-15T10:00:00.000Z",
   *   topic: "React Hooks Deep Dive",
   *   max_students: 5
   * });
   */
  async createDirectSession(data: CreateDirectSessionDto) {
    const response = await fetch(`${API_BASE_URL}/advisories/direct-session`, {
      method: 'POST',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleApiResponse(response);
  },

  /**
   * Get all advisories by professor
   * @example
   * const advisories = await advisoriesApi.getByProfessor(professorId);
   * // Display in professor's dashboard
   */
  async getByProfessor(professorId: number) {
    const response = await fetch(
      `${API_BASE_URL}/advisories/professor/${professorId}`,
      {
        headers: createAuthHeaders(),
      },
    );

    return handleApiResponse(response);
  },

  /**
   * Invite students to session (Professor only)
   * @example
   * await advisoriesApi.inviteStudents(sessionId, {
   *   student_ids: [1, 2, 3],
   *   invitation_message: "Join us for an exciting React session!"
   * });
   */
  async inviteStudents(
    sessionId: number,
    data: { student_ids: number[]; invitation_message?: string },
  ) {
    const response = await fetch(
      `${API_BASE_URL}/advisories/sessions/${sessionId}/invite`,
      {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    return handleApiResponse(response);
  },
};

// ===== SUBJECTS API =====

export const subjectsApi = {
  /**
   * Get all available subjects
   * @example
   * const subjects = await subjectsApi.getAll();
   * // Populate dropdown in request form
   */
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/subjects`, {
      headers: createAuthHeaders(),
    });

    return handleApiResponse(response);
  },

  /**
   * Get subject details by professor
   * @example
   * const professorSubjects = await subjectsApi.getByProfessor(professorId);
   * // Show what subjects this professor teaches
   */
  async getByProfessor(professorId: number): Promise<SubjectDetailDto[]> {
    const response = await fetch(
      `${API_BASE_URL}/subject-details/professor/${professorId}`,
      {
        headers: createAuthHeaders(),
      },
    );

    return handleApiResponse<SubjectDetailDto[]>(response);
  },

  /**
   * Get current professor's subjects
   */
  async getMySubjects(): Promise<SubjectDetailDto[]> {
    const response = await fetch(
      `${API_BASE_URL}/subject-details/my-subjects`,
      {
        headers: createAuthHeaders(),
      },
    );

    return handleApiResponse<SubjectDetailDto[]>(response);
  },
};

// ===== USERS API =====

export const usersApi = {
  /**
   * Get all professors
   * @example
   * const professors = await usersApi.getProfessors();
   * // Populate professor selection dropdown
   */
  async getProfessors(): Promise<PublicUserDto[]> {
    const response = await fetch(`${API_BASE_URL}/users/professors`, {
      headers: createAuthHeaders(),
    });

    return handleApiResponse<PublicUserDto[]>(response);
  },

  /**
   * Get all students
   */
  async getStudents(): Promise<PublicUserDto[]> {
    const response = await fetch(`${API_BASE_URL}/users/students`, {
      headers: createAuthHeaders(),
    });

    return handleApiResponse<PublicUserDto[]>(response);
  },

  /**
   * Get users by specific role
   */
  async getByRole(
    role: 'student' | 'professor' | 'admin',
  ): Promise<PublicUserDto[]> {
    const response = await fetch(`${API_BASE_URL}/users/role/${role}`, {
      headers: createAuthHeaders(),
    });

    return handleApiResponse<PublicUserDto[]>(response);
  },
};

// ===== PROFESSOR AVAILABILITY API =====

export const availabilityApi = {
  /**
   * Create availability slot (Professor only)
   * @example
   * await availabilityApi.createSlot({
   *   subject_detail_id: 1,
   *   day_of_week: 'MONDAY',
   *   start_time: '10:00',
   *   end_time: '12:00',
   *   is_recurring: true,
   *   max_students_per_slot: 3
   * });
   */
  async createSlot(
    data: CreateAvailabilitySlotDto,
  ): Promise<AvailabilitySlotResponseDto> {
    const response = await fetch(
      `${API_BASE_URL}/professor-availability/slots`,
      {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    return handleApiResponse<AvailabilitySlotResponseDto>(response);
  },

  /**
   * Get available slots for booking
   * @example
   * const slots = await availabilityApi.getAvailableSlots(professorId, subjectId, '2024-12-15');
   * // Show available time slots to student
   */
  async getAvailableSlots(
    professorId: number,
    subjectDetailId: number,
    date: string,
  ) {
    const response = await fetch(
      `${API_BASE_URL}/professor-availability/available-slots/${professorId}/${subjectDetailId}?date=${date}`,
      { headers: createAuthHeaders() },
    );

    return handleApiResponse(response);
  },

  /**
   * Get current professor's availability
   */
  async getMyAvailability(): Promise<AvailabilitySlotResponseDto[]> {
    const response = await fetch(
      `${API_BASE_URL}/professor-availability/my-availability`,
      {
        headers: createAuthHeaders(),
      },
    );

    return handleApiResponse<AvailabilitySlotResponseDto[]>(response);
  },
};

// ===== INVITATIONS API =====

export const invitationsApi = {
  /**
   * Get student's invitations
   * @example
   * const invitations = await invitationsApi.getMyInvitations('PENDING');
   * // Show pending invitations to student
   */
  async getMyInvitations(status?: string): Promise<InvitationResponseDto[]> {
    const url = new URL(`${API_BASE_URL}/student-invitations/my-invitations`);
    if (status) url.searchParams.append('status', status);

    const response = await fetch(url.toString(), {
      headers: createAuthHeaders(),
    });

    return handleApiResponse<InvitationResponseDto[]>(response);
  },

  /**
   * Respond to invitation (Student only)
   * @example
   * await invitationsApi.respond(invitationId, {
   *   response: 'accept',
   *   response_message: 'Looking forward to the session!'
   * });
   */
  async respond(invitationId: number, data: RespondInvitationDto) {
    const response = await fetch(
      `${API_BASE_URL}/student-invitations/${invitationId}/respond`,
      {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    return handleApiResponse(response);
  },
};

// ===== NOTIFICATIONS API =====

export const notificationsApi = {
  /**
   * Get notification preferences
   * @example
   * const preferences = await notificationsApi.getPreferences();
   * // Populate settings form
   */
  async getPreferences() {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      headers: createAuthHeaders(),
    });

    return handleApiResponse(response);
  },

  /**
   * Update notification preferences
   * @example
   * await notificationsApi.updatePreferences({
   *   email_enabled: true,
   *   reminder_24h: true,
   *   reminder_1h: false
   * });
   */
  async updatePreferences(data: UpdateNotificationPreferencesDto) {
    const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
      method: 'PATCH',
      headers: createAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleApiResponse(response);
  },

  /**
   * Get notification history
   */
  async getHistory() {
    const response = await fetch(`${API_BASE_URL}/notifications/history`, {
      headers: createAuthHeaders(),
    });

    return handleApiResponse(response);
  },
};

// ===== ATTENDANCE API =====

export const attendanceApi = {
  /**
   * Register bulk attendance (Professor only)
   * @example
   * await attendanceApi.registerBulkAttendance(sessionId, {
   *   attendances: [
   *     { student_id: 1, attendance_status: 'PRESENT', notes: 'Active participation' },
   *     { student_id: 2, attendance_status: 'ABSENT' }
   *   ]
   * });
   */
  async registerBulkAttendance(sessionId: number, data: BulkAttendanceDto) {
    const response = await fetch(
      `${API_BASE_URL}/advisory-attendance/session/${sessionId}/bulk-attendance`,
      {
        method: 'POST',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    return handleApiResponse(response);
  },

  /**
   * Complete session (Professor only)
   */
  async completeSession(
    sessionId: number,
    data: { session_notes: string; topics_covered?: string[] },
  ) {
    const response = await fetch(
      `${API_BASE_URL}/advisory-attendance/session/${sessionId}/complete`,
      {
        method: 'PATCH',
        headers: createAuthHeaders(),
        body: JSON.stringify(data),
      },
    );

    return handleApiResponse(response);
  },
};

// ===== HELPER FUNCTIONS =====

/**
 * Check if user is authenticated
 * @example
 * if (!isAuthenticated()) {
 *   navigate('/login');
 * }
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Logout user by clearing tokens
 * @example
 * const handleLogout = () => {
 *   logout();
 *   navigate('/login');
 * };
 */
export const logout = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_data');
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
};

// ===== ERROR HANDLING =====

/**
 * Handle API errors consistently
 * @example
 * try {
 *   await authApi.login(credentials);
 * } catch (error) {
 *   handleApiError(error, 'Login failed');
 * }
 */
export const handleApiError = (error: any, context: string = 'API request') => {
  console.error(`${context}:`, error);

  // Handle specific error types
  if (
    error.message?.includes('401') ||
    error.message?.includes('Unauthorized')
  ) {
    // Token expired, redirect to login
    logout();
    window.location.href = '/login';
  }

  // Return user-friendly message
  return error.message || 'Something went wrong. Please try again.';
};

// ===== EXAMPLE USAGE IN REACT COMPONENTS =====

/*
// Example: Login Component
import { authApi } from '../services/api-client.example';

const LoginComponent = () => {
  const [credentials, setCredentials] = useState<LoginDto>({ username: '', password: '' });
  
  const handleLogin = async () => {
    try {
      const result = await authApi.login(credentials);
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('user_data', JSON.stringify(result.user));
      // Redirect to dashboard
    } catch (error) {
      setError(handleApiError(error, 'Login'));
    }
  };
};

// Example: Advisory Request Form
const RequestForm = () => {
  const createRequest = async (formData: CreateAdvisoryRequestDto) => {
    try {
      const request = await advisoryRequestsApi.create(formData);
      toast.success('Advisory request sent successfully!');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };
};

// Example: Professor Dashboard
const ProfessorDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  
  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const requests = await advisoryRequestsApi.getPendingRequests();
        setPendingRequests(requests);
      } catch (error) {
        console.error('Failed to load requests:', error);
      }
    };
    
    loadPendingRequests();
  }, []);
};
*/
