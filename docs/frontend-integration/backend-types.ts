/**
 * Backend API Types for School Advisories System
 *
 * Copy this file to your React project: src/types/backend-types.ts
 * This provides full TypeScript support for all backend responses
 */

// ===== ENUMS =====

export enum UserRole {
  ADMIN = 'admin',
  PROFESSOR = 'professor',
  STUDENT = 'student',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

export enum WeekDay {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

export enum AdvisoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// ===== CORE ENTITIES =====

export interface User {
  user_id: number;
  username: string;
  email: string;
  name: string;
  last_name: string;
  phone_number: string;
  photo_url?: string | null;
  school_id?: string | null;
  student_id?: string | null;
  employee_id?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  subject_id: number;
  subject: string;
}

export interface SubjectDetails {
  subject_detail_id: number;
  subject_id: number;
  professor_id: number;
  subject: Subject;
  professor: User;
  schedules: SubjectSchedule[];
}

export interface SubjectSchedule {
  schedule_id: number;
  day_of_week: WeekDay;
  start_time: string; // "HH:MM" format
  end_time: string; // "HH:MM" format
  location: string;
}

export interface Venue {
  venue_id: number;
  name: string;
  location: string;
  capacity: number;
  venue_type: string;
  equipment: string | null;
  is_active: boolean;
}

// ===== ADVISORY SYSTEM =====

export interface AdvisoryRequest {
  request_id: number;
  student_id: number;
  professor_id: number;
  subject_detail_id: number;
  student_message: string | null;
  preferred_schedule: string | null;
  status: RequestStatus;
  professor_response: string | null;
  rejection_reason: string | null;
  cancellation_reason: string | null;
  processed_by_id: number | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;

  // Relations (populated in responses)
  student?: User;
  professor?: User;
  subject_detail?: SubjectDetails;
  processed_by?: User;
}

export interface Advisory {
  advisory_id: number;
  professor_id: number;
  subject_detail_id: number;
  max_students: number;
  status: AdvisoryStatus;
  created_at: string;
  updated_at: string;

  // Relations
  professor?: User;
  subject_detail?: SubjectDetails;
  schedules?: AdvisorySchedule[];
  advisory_dates?: AdvisoryDate[];
}

export interface AdvisoryDate {
  advisory_date_id: number;
  advisory_id: number;
  venue_id: number;
  date: string; // ISO date string
  topic: string;
  notes: string | null;
  session_link: string | null;
  status: string;
  created_at: string;

  // Relations
  advisory?: Advisory;
  venue?: Venue;
  attendances?: AdvisoryAttendance[];
  invitations?: StudentInvitation[];
}

export interface AdvisorySchedule {
  advisory_schedule_id: number;
  advisory_id: number;
  day: WeekDay;
  begin_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  max_students_per_slot: number;
  is_active: boolean;
}

export interface AdvisoryAttendance {
  attendance_id: number;
  advisory_date_id: number;
  student_id: number;
  attendance_status: AttendanceStatus;
  attendance_time: string | null;
  notes: string | null;

  // Relations
  student?: User;
  advisory_date?: AdvisoryDate;
}

// ===== INVITATIONS & AVAILABILITY =====

export interface StudentInvitation {
  invitation_id: number;
  advisory_date_id: number;
  student_id: number;
  invited_by_id: number;
  status: InvitationStatus;
  invitation_message: string | null;
  response_message: string | null;
  responded_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;

  // Relations
  advisory_date?: AdvisoryDate;
  student?: User;
  invited_by?: User;
}

export interface ProfessorAvailability {
  availability_id: number;
  professor_id: number;
  subject_detail_id: number;
  day_of_week: WeekDay;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  max_students_per_slot: number;
  is_recurring: boolean;
  is_active: boolean;
  created_at: string;

  // Relations
  professor?: User;
  subject_detail?: SubjectDetails;
}

// ===== NOTIFICATIONS =====

export interface NotificationPreferences {
  preference_id: number;
  user_id: number;
  email_enabled: boolean;
  reminder_24h: boolean;
  reminder_1h: boolean;
  session_updates: boolean;
  invitation_notifications: boolean;
  request_updates: boolean;

  // Relations
  user?: User;
}

export interface NotificationLogs {
  log_id: number;
  user_id: number;
  notification_type: string;
  recipient_email: string;
  subject: string;
  template_used: string | null;
  status: 'SENT' | 'FAILED' | 'PENDING';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;

  // Relations
  user?: User;
}

export interface EmailTemplate {
  template_id: number;
  template_name: string;
  subject_template: string;
  html_template: string;
  text_template: string | null;
  template_variables: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== API REQUEST/RESPONSE DTOS =====

// Authentication DTOs
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  dashboard_data: DashboardDataDto;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface DashboardDataDto {
  stats: {
    total_requests?: number;
    pending_requests?: number;
    completed_sessions?: number;
    active_advisories?: number;
  };
  recent_activity: RecentActivityItem[];
  notifications_count: number;
}

export interface RecentActivityItem {
  type: string;
  message: string;
  timestamp: string;
  related_id?: number;
}

// Advisory Request DTOs
export interface CreateAdvisoryRequestDto {
  subject_detail_id: number;
  student_message?: string;
  preferred_schedule?: string;
}

export interface AdvisoryRequestResponseDto {
  request_id: number;
  status: RequestStatus;
  student_message: string | null;
  preferred_schedule: string | null;
  professor_response: string | null;
  rejection_reason: string | null;
  cancellation_reason: string | null;
  created_at: string;
  reviewed_at: string | null;

  student: PublicUserDto;
  professor: PublicUserDto;
  subject_detail: SubjectDetailDto;
}

export interface ApproveRequestDto {
  professor_response?: string;
}

export interface RejectRequestDto {
  rejection_reason: string;
}

export interface CancelRequestDto {
  cancellation_reason: string;
}

// User DTOs
export interface PublicUserDto {
  user_id: number;
  name: string;
  last_name: string;
  email: string;
  photo_url: string | null;
  role: UserRole;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  name: string;
  last_name: string;
  phone_number: string;
  photo_url?: string;
  school_id?: string;
  student_id?: string;
  employee_id?: string;
  role: UserRole;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  user_id?: number; // ID of user to update
}

// Subject DTOs
export interface SubjectDetailDto {
  subject_detail_id: number;
  subject: {
    subject_id: number;
    subject: string;
  };
  professor: PublicUserDto;
  schedules: {
    day_of_week: WeekDay;
    start_time: string;
    end_time: string;
    location: string;
  }[];
}

// Advisory DTOs
export interface CreateDirectSessionDto {
  subject_detail_id: number;
  venue_id: number;
  session_date: string; // ISO string
  topic: string;
  notes?: string;
  session_link?: string;
  max_students?: number;
}

export interface InviteStudentsDto {
  student_ids: number[];
  invitation_message?: string;
}

// Availability DTOs
export interface CreateAvailabilitySlotDto {
  subject_detail_id: number;
  day_of_week: WeekDay;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  max_students_per_slot?: number;
  is_recurring?: boolean;
}

export interface AvailabilitySlotResponseDto {
  availability_id: number;
  professor_id: number;
  subject_detail_id: number;
  day_of_week: WeekDay;
  start_time: string;
  end_time: string;
  max_students_per_slot: number;
  is_recurring: boolean;
  is_active: boolean;

  subject_detail?: SubjectDetailDto;
}

// Invitation DTOs
export interface RespondInvitationDto {
  response: 'accept' | 'decline';
  response_message?: string;
}

export interface InvitationResponseDto {
  invitation_id: number;
  status: InvitationStatus;
  invitation_message: string | null;
  response_message: string | null;
  expires_at: string | null;
  created_at: string;
  responded_at: string | null;

  advisory_date: {
    advisory_date_id: number;
    date: string;
    topic: string;
    venue: {
      name: string;
      location: string;
    };
    advisory: {
      subject_detail: SubjectDetailDto;
    };
  };
  invited_by: PublicUserDto;
}

// Attendance DTOs
export interface BulkAttendanceDto {
  attendances: {
    student_id: number;
    attendance_status: AttendanceStatus;
    notes?: string;
  }[];
}

export interface CompleteSessionDto {
  session_notes: string;
  topics_covered?: string[];
  next_steps?: string;
}

// Notification DTOs
export interface UpdateNotificationPreferencesDto {
  email_enabled?: boolean;
  reminder_24h?: boolean;
  reminder_1h?: boolean;
  session_updates?: boolean;
  invitation_notifications?: boolean;
  request_updates?: boolean;
}

// Error Response DTO
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
}

// ===== UTILITY TYPES =====

// For forms and client-side state
export type AdvisoryRequestFormData = Omit<
  CreateAdvisoryRequestDto,
  'subject_detail_id'
> & {
  professor_id: number;
  subject_id: number;
};

export type UsersByRole = {
  [UserRole.STUDENT]: PublicUserDto[];
  [UserRole.PROFESSOR]: PublicUserDto[];
  [UserRole.ADMIN]: PublicUserDto[];
};

// For API client responses
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ===== FILTER TYPES =====

export interface AdvisoryRequestFilters {
  status?: RequestStatus;
  professor_id?: number;
  subject_id?: number;
  date_from?: string;
  date_to?: string;
}

export interface AvailabilityFilters {
  professor_id: number;
  subject_detail_id?: number;
  day_of_week?: WeekDay;
  date?: string; // YYYY-MM-DD
}

export interface InvitationFilters {
  status?: InvitationStatus;
  student_id?: number;
  date_from?: string;
  date_to?: string;
}
