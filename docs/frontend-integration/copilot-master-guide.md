# 🎯 COMPLETE GITHUB COPILOT INTEGRATION GUIDE
# School Advisories System - Backend Documentation Package

---

## 🚀 **INSTANT PROJECT UNDERSTANDING**

This is a **School Advisory Management System** built with:
- **Backend**: NestJS + TypeScript + PostgreSQL + Redis + Bull Queues
- **Frontend**: React + TypeScript (to be built)
- **Purpose**: University students request academic advisory sessions with professors

### 🎯 **Core Business Logic**
1. **Students** request advisory sessions with **Professors** 
2. **Professors** approve/reject requests and manage their availability
3. **Admins** manage users, subjects, and system configuration
4. **Automated email notifications** for all interactions
5. **Session scheduling** with venues and attendance tracking

---

## 📁 **DOCUMENTATION STRUCTURE**

```
docs/frontend-integration/
├── backend-api-reference.md      # Complete API documentation with examples
├── backend-types.ts              # All TypeScript types from backend
├── api-usage-examples.md         # Practical React usage examples  
├── user-flows.md                 # Detailed user journeys for each role
├── react-setup.md                # Complete React project setup
└── copilot-master-guide.md       # This file - complete context
```

---

## 🎭 **USER ROLES & PERMISSIONS**

### 🧑‍🎓 **STUDENT Role**
- **Can do**: Request advisories, view own requests, respond to invitations, view own sessions
- **Cannot do**: Approve requests, create sessions, manage other users
- **Main API endpoints**: `/advisory-requests/*`, `/student-invitations/*`, `/auth/*`

### 👨‍🏫 **PROFESSOR Role**
- **Can do**: Review/approve requests, create sessions, manage availability, invite students
- **Cannot do**: Access admin functions, modify user roles, see other professors' data
- **Main API endpoints**: `/advisory-requests/pending`, `/advisories/*`, `/professor-availability/*`

### 👤 **ADMIN Role**
- **Can do**: Everything - user management, system config, all data access
- **Cannot do**: Nothing - full system access
- **Main API endpoints**: All endpoints, plus admin-specific ones

---

## 🔑 **AUTHENTICATION FLOW**

### JWT Authentication
```typescript
// 1. Login
POST /auth/login
Body: { username: string, password: string }
Response: { accessToken: string, refreshToken: string, user: User }

// 2. Use token in headers
Authorization: Bearer <accessToken>

// 3. Refresh token when expired
POST /auth/refresh
Body: { refreshToken: string }
Response: { accessToken: string, refreshToken: string }
```

### User Roles Enum
```typescript
enum UserRole {
  STUDENT = 'STUDENT',
  PROFESSOR = 'PROFESSOR', 
  ADMIN = 'ADMIN'
}
```

---

## 🗃️ **CORE DATA ENTITIES**

### 🎓 **Advisory Request** (Main Entity)
```typescript
interface AdvisoryRequest {
  id: number;
  message: string;                    // Student's request message
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  responseMessage?: string;           // Professor's response
  createdAt: Date;
  updatedAt: Date;
  
  // Relationships
  student: User;                      // Who requested
  professor: User;                    // Who will teach
  subject: Subject;                   // What subject
  approvedAdvisory?: Advisory;        // Created when approved
}
```

### 📅 **Advisory Session**
```typescript
interface Advisory {
  id: number;
  topic: string;
  scheduledDate: Date;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  maxStudents: number;
  actualStudents: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  
  // Relationships
  professor: User;
  subject: Subject;
  venue: Location;
  students: User[];                   // Enrolled students
  attendanceRecords: AdvisoryStudentAttendance[];
}
```

### 👤 **User Entity**
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  
  // Role-specific data populated based on role
  studentRequests?: AdvisoryRequest[];      // If STUDENT
  professorRequests?: AdvisoryRequest[];    // If PROFESSOR  
  professorAdvisories?: Advisory[];         // If PROFESSOR
}
```

---

## 🔄 **CRITICAL WORKFLOWS**

### 1. **Student Requests Advisory**
```
Student Flow:
POST /advisory-requests → Creates request with PENDING status
→ Professor gets email notification automatically
→ Professor sees request in GET /advisory-requests/pending
→ Professor approves via PATCH /advisory-requests/{id}/approve
→ System auto-creates Advisory session
→ Student gets approval email automatically
```

### 2. **Professor Creates Direct Session**
```
Professor Flow: 
POST /advisories/direct-session → Creates session immediately
→ Optionally invite specific students via POST /advisories/sessions/{id}/invite
→ Students receive invitation emails
→ Students respond via POST /student-invitations/{id}/respond
```

### 3. **Session Management**
```
Session Day:
GET /advisories/sessions/{id} → Get session details
PATCH /advisories/sessions/{id}/attendance → Record attendance
PATCH /advisories/sessions/{id}/complete → Mark completed
→ Completion emails sent automatically
```

---

## 📧 **EMAIL NOTIFICATION SYSTEM**

### Automatic Triggers
- ✅ **New advisory request** → Professor notification
- ✅ **Request approved** → Student confirmation
- ✅ **Request rejected** → Student notification with reason  
- ✅ **Session invitation** → Student invitation
- ✅ **Session reminder** → All participants (24h + 1h before)
- ✅ **Session completed** → All participants with summary

### Email Templates (Admin Configurable)
- `advisory-request-created`
- `advisory-request-approved` 
- `advisory-request-rejected`
- `session-invitation`
- `session-reminder`
- `session-completed`

---

## 🛡️ **SECURITY & VALIDATION**

### Route Guards
```typescript
// Public routes
['/auth/login', '/auth/refresh']

// Authenticated routes (any role)
['/users/profile', '/notifications/*']

// Role-specific routes
['/admin/*']           → ADMIN only
['/advisory-requests/pending'] → PROFESSOR + ADMIN
['/advisory-requests/my-requests'] → STUDENT + ADMIN
```

### Data Filtering
- **Students**: Can only see their own requests/sessions
- **Professors**: Can only see requests for subjects they teach
- **Admins**: Can see all data

---

## 🎨 **FRONTEND INTEGRATION PATTERNS**

### React Components by Role
```typescript
// Student Components
<RequestAdvisoryForm />        // POST /advisory-requests
<MyRequestsList />             // GET /advisory-requests/my-requests  
<MyInvitations />              // GET /student-invitations/my-invitations
<SessionCalendar />            // GET /advisories/my-sessions

// Professor Components  
<PendingRequestsList />        // GET /advisory-requests/pending
<RequestReviewModal />         // PATCH /advisory-requests/{id}/approve|reject
<CreateSessionForm />          // POST /advisories/direct-session
<AvailabilityManager />        // GET/POST /professor-availability/my-availability

// Admin Components
<UserManagementTable />        // GET /users + CRUD operations
<SubjectManagement />          // GET /subjects + CRUD operations  
<EmailTemplateEditor />        // GET /admin/email-templates + updates
<SystemDashboard />            // GET /admin/dashboard/stats
```

### API Client Pattern
```typescript
// Use axios with interceptors for JWT
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Example usage in React components
const { data: requests } = useQuery('myRequests', 
  () => api.get('/advisory-requests/my-requests')
);

const createRequest = useMutation(
  (data: CreateAdvisoryRequestDto) => api.post('/advisory-requests', data),
  { onSuccess: () => queryClient.invalidateQueries('myRequests') }
);
```

---

## 🚨 **ERROR HANDLING PATTERNS**

### Common HTTP Status Codes
- **400**: Validation error (show field-specific messages)
- **401**: Unauthorized (redirect to login)  
- **403**: Forbidden (show "Access denied" message)
- **404**: Not found (show helpful error page)
- **422**: Business logic error (show user-friendly message)
- **500**: Server error (show generic error + retry option)

### Validation Error Response Format
```typescript
{
  "message": ["email must be an email", "firstName should not be empty"],
  "error": "Bad Request", 
  "statusCode": 400
}
```

---

## 💡 **GITHUB COPILOT PROMPTING TIPS**

### ✅ **Effective Prompts**
```
// Good examples:
"Create a React component for students to request advisory sessions using POST /advisory-requests with CreateAdvisoryRequestDto"

"Build a Material-UI form that allows professors to approve advisory requests using PATCH /advisory-requests/{id}/approve"

"Generate a TypeScript interface for the AdvisoryRequest entity with all relationships"

"Create a useQuery hook for fetching student's advisory requests from GET /advisory-requests/my-requests"
```

### ❌ **Avoid These Prompts**
```
// Too vague:
"Create a form" 
"Make a dashboard"
"Add a button"

// Missing context:
"Create user management" (which role? what permissions?)
"Build a request form" (advisory request? user request?)
```

### 🎯 **Best Practices for Copilot**
1. **Always mention the role**: "Create a STUDENT dashboard" vs "Create a dashboard"
2. **Reference specific API endpoints**: "Use GET /advisory-requests/pending"
3. **Include TypeScript types**: "Use CreateAdvisoryRequestDto for form validation"
4. **Specify UI framework**: "Create a Material-UI table" vs "Create a table"
5. **Mention business logic**: "When approved, create Advisory session automatically"

---

## 📊 **DATABASE RELATIONSHIPS**

### Entity Relationship Overview
```
User (1) ←→ (M) AdvisoryRequest ←→ (1) Subject
User (Professor) (1) ←→ (M) Advisory ←→ (1) Subject
Advisory (1) ←→ (1) Location (Venue)
Advisory (1) ←→ (M) AdvisoryStudentAttendance ←→ (1) User (Student)
Subject (1) ←→ (M) SubjectDetails ←→ (1) User (Professor)
```

### Key Foreign Keys
- `advisory_requests.student_id` → `users.id`
- `advisory_requests.professor_id` → `users.id` 
- `advisory_requests.subject_id` → `subjects.id`
- `advisories.professor_id` → `users.id`
- `advisories.venue_id` → `locations.id`

---

## 🎯 **QUICK START FOR COPILOT**

When GitHub Copilot needs to understand this project:

1. **Project Type**: University advisory management system
2. **Backend**: NestJS REST API with JWT auth
3. **Users**: Students request → Professors approve → Sessions happen
4. **Key Entities**: User, AdvisoryRequest, Advisory, Subject, Location
5. **Main Flow**: Request → Approval → Session → Attendance → Completion
6. **Email System**: Automated notifications for all state changes
7. **Roles**: STUDENT (request), PROFESSOR (approve), ADMIN (manage all)

Copy this entire `docs/frontend-integration/` folder to your React project and GitHub Copilot will have complete context! 🚀