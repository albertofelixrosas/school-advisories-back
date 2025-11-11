# User Flows - School Advisories System

## 🎯 Purpose
This document describes the main user flows that GitHub Copilot should understand when building React components for the School Advisories system.

---

## 👨‍🎓 Student User Flows

### 1. **Student Registration & Login**
```
1. Student visits /login
2. Enters username/password
3. System validates credentials
4. Redirects to student dashboard with:
   - Recent advisory requests
   - Upcoming sessions
   - Available professors
   - Notification settings
```

### 2. **Request Advisory Session**
```
🔄 Primary Flow:
1. Student clicks "Request Advisory" 
2. Selects subject from dropdown (populated via GET /subjects)
3. Selects professor from filtered list (GET /users/professors)
4. Chooses preferred time/schedule (optional)
5. Writes message explaining what they need help with
6. Submits form (POST /advisory-requests)
7. Sees confirmation: "Request sent to Professor X"
8. Professor receives email notification automatically

📱 React Components Needed:
- SubjectSelector (dropdown with subjects)
- ProfessorSelector (cards with professor info)
- RequestForm (form with message input)
- ConfirmationModal (success feedback)
```

### 3. **Track Advisory Requests**
```
🔄 Flow:
1. Student goes to "My Requests" section
2. Views list of all requests (GET /advisory-requests/my-requests)
3. Sees status badges: PENDING, APPROVED, REJECTED, CANCELLED
4. Clicks on request to see details and messages
5. Can cancel PENDING requests if needed

📊 Data Display:
- Request date and status
- Professor name and subject
- Student's original message
- Professor's response (if any)
- Session details (if approved)

📱 Components Needed:
- RequestsList (table/cards with requests)
- StatusBadge (color-coded status indicators)
- RequestDetails (modal/page with full info)
- CancelButton (with confirmation dialog)
```

### 4. **Respond to Session Invitations**
```
🔄 Flow:
1. Student receives direct invitation from professor
2. Sees invitation in "My Invitations" (GET /student-invitations/my-invitations)
3. Reviews session details: date, time, location, topic
4. Accepts or declines invitation
5. Writes optional response message
6. Submits response (POST /student-invitations/:id/respond)
7. Professor receives notification of response

📱 Components Needed:
- InvitationsList (pending invitations)
- InvitationCard (session details + action buttons)
- ResponseForm (accept/decline with message)
```

### 5. **View Schedule & Attend Sessions**
```
🔄 Flow:
1. Student views calendar/schedule of approved sessions
2. Gets email reminders 24h and 1h before session
3. Attends session (in-person or via session link)
4. Receives email summary after session completion

📱 Components Needed:
- SessionCalendar (calendar view of sessions)
- SessionCard (individual session details)
- SessionReminders (notification system)
```

---

## 👨‍🏫 Professor User Flows

### 1. **Professor Dashboard**
```
🔄 Dashboard shows:
- Pending advisory requests requiring response
- Today's scheduled sessions
- This week's availability
- Recent notifications

📱 Components Needed:
- PendingRequestsWidget (with count badge)
- TodaysSessionsWidget
- WeeklyScheduleWidget
- NotificationCenter
```

### 2. **Manage Advisory Requests**
```
🔄 Primary Flow:
1. Professor sees notification of new request
2. Goes to "Pending Requests" (GET /advisory-requests/pending)
3. Reviews student's request details
4. Decides to approve or reject:

✅ APPROVE:
   - Writes optional response message
   - Confirms session details (auto-populated)
   - Submits approval (PATCH /advisory-requests/:id/approve)
   - System creates session automatically
   - Student gets confirmation email

❌ REJECT:
   - Writes rejection reason
   - Submits rejection (PATCH /advisory-requests/:id/reject)
   - Student receives email with reason

📱 Components Needed:
- RequestReviewCard (student info, message, subject)
- ApprovalForm (response message input)
- RejectionForm (reason input)
- SessionPreview (auto-generated session details)
```

### 3. **Create Direct Sessions**
```
🔄 Flow:
1. Professor clicks "Create Session"
2. Selects subject they teach (GET /subject-details/my-subjects)
3. Chooses venue from dropdown (GET /venues)
4. Sets date, time, and topic
5. Sets maximum students (optional)
6. Creates session (POST /advisories/direct-session)
7. Optionally invites specific students immediately

📱 Components Needed:
- SessionCreationForm (multi-step form)
- SubjectDropdown (professor's subjects only)
- VenueSelector (available venues)
- DateTimePicker (date and time selection)
- StudentInviteWidget (optional immediate invitations)
```

### 4. **Manage Availability Schedule**
```
🔄 Flow:
1. Professor goes to "My Availability"
2. Views current recurring availability (GET /professor-availability/my-availability)
3. Can add new time slots:
   - Select day of week
   - Set start/end time
   - Choose subject
   - Set max students per slot
   - Mark as recurring (weekly pattern)
4. Can deactivate existing slots
5. Students see this availability when requesting

📱 Components Needed:
- AvailabilityCalendar (weekly view with time slots)
- AddSlotForm (create new availability)
- TimeSlotCard (existing slot with edit/delete)
- RecurringToggle (weekly pattern option)
```

### 5. **Conduct Sessions & Register Attendance**
```
🔄 Session Day Flow:
1. Professor arrives at session location/time
2. Opens session details in app
3. Marks students as present/absent/late
4. Adds notes for each student (optional)
5. Completes session with summary
6. System sends completion emails automatically

📱 Components Needed:
- AttendanceForm (student list with status toggles)
- StudentAttendanceCard (individual student status)
- SessionNotesForm (overall session summary)
- SessionCompletionModal (final confirmation)
```

### 6. **Invite Students to Sessions**
```
🔄 Flow:
1. Professor has existing or newly created session
2. Clicks "Invite Students"
3. Searches/selects students to invite
4. Writes invitation message
5. Sends invitations (POST /advisories/sessions/:id/invite)
6. Tracks student responses

📱 Components Needed:
- StudentSearch (search and select interface)
- InvitationMessageForm (custom message)
- InvitationTracker (who accepted/declined)
```

---

## 👤 Admin User Flows

### 1. **Admin Dashboard**
```
🔄 Overview shows:
- System-wide statistics (total users, active sessions)
- Recent user registrations
- System health metrics
- Configuration alerts

📱 Components Needed:
- SystemStatsWidget
- UserManagementWidget
- SystemHealthWidget
- ConfigurationPanel
```

### 2. **User Management**
```
🔄 Flow:
1. Admin goes to "Users" section
2. Views all users with filters (role, status, date)
3. Can create new users
4. Can edit user details and roles
5. Can activate/deactivate users

📱 Components Needed:
- UserTable (filterable and sortable)
- UserCreationForm (role-specific fields)
- UserEditModal (inline editing)
- RoleSelector (admin, professor, student)
```

### 3. **Subject & Subject Details Management**
```
🔄 Flow:
1. Admin manages subjects (Math, Physics, etc.)
2. Assigns professors to subjects (Subject Details)
3. Sets schedules for each professor-subject combination
4. Manages venues and their capacity

📱 Components Needed:
- SubjectManagementTable
- ProfessorAssignmentForm
- ScheduleBuilder (weekly schedule creator)
- VenueManagement
```

### 4. **Email Template Configuration**
```
🔄 Flow:
1. Admin goes to "Email Templates"
2. Sees list of all notification templates
3. Can edit template content (subject, HTML, variables)
4. Can preview templates with sample data
5. Can activate/deactivate templates

📱 Components Needed:
- TemplateList (with preview thumbnails)
- TemplateEditor (rich text editor with variables)
- TemplatePreview (rendered template view)
- VariableHelper (available template variables)
```

---

## 🔔 Notification Flows (All Users)

### 1. **Configure Notification Preferences**
```
🔄 Flow:
1. User goes to Settings > Notifications
2. Toggles various notification types:
   - Email notifications enabled/disabled
   - 24-hour session reminders
   - 1-hour session reminders
   - Session updates (cancellations, changes)
   - New invitation notifications
3. Saves preferences (PATCH /notifications/preferences)

📱 Components Needed:
- NotificationSettings (toggle switches)
- PreferenceCategory (grouped settings)
- SaveButton (with success feedback)
```

### 2. **View Notification History**
```
🔄 Flow:
1. User goes to "Notification History"
2. Sees list of all sent notifications
3. Can filter by type and date
4. Can see delivery status (sent, failed)

📱 Components Needed:
- NotificationHistory (chronological list)
- DeliveryStatusBadge (sent/failed indicators)
- NotificationFilters (type, date range)
```

---

## ⚡ Real-Time Features

### 1. **Live Notifications**
```
💡 When to show notifications:
- New advisory request (professors)
- Request approved/rejected (students)
- Session invitation received (students)
- Session cancelled (both parties)
- Attendance recorded (students)

📱 Implementation:
- Use toast notifications for immediate feedback
- Update badge counts in navigation
- Refresh relevant data after notifications
```

### 2. **Auto-Refresh Data**
```
💡 Data that should refresh automatically:
- Dashboard widgets every 30 seconds
- Pending requests count every 10 seconds
- Session attendance during active sessions
- Calendar view when viewing current week

📱 Implementation:
- Use React Query or SWR for auto-refresh
- WebSocket connection for real-time updates (future)
```

---

## 🎨 UI/UX Patterns

### 1. **Loading States**
```
📱 Show loading for:
- Form submissions (disable button, show spinner)
- Data fetching (skeleton screens)
- File uploads (progress bars)
- Long operations (progress indicators)
```

### 2. **Error Handling**
```
📱 Error scenarios:
- Network failures (retry button)
- Validation errors (inline field errors)
- Permission errors (redirect to login)
- Not found errors (helpful 404 page)
```

### 3. **Success Feedback**
```
📱 Success patterns:
- Form submissions (toast + redirect)
- Data updates (toast notification)
- Status changes (visual feedback)
- Bulk operations (progress updates)
```

---

## 🔒 Security Considerations

### 1. **Route Protection**
```
📱 Protected routes by role:
- /dashboard/* - All authenticated users
- /admin/* - ADMIN role only
- /professor/* - PROFESSOR and ADMIN roles
- /student/* - STUDENT and ADMIN roles
```

### 2. **Data Filtering**
```
📱 Client-side data filtering:
- Students see only their own requests/sessions
- Professors see only their assigned subjects/students
- Admins see all system data
```

---

This document provides GitHub Copilot with comprehensive context about user journeys, making it easy to generate appropriate React components, API calls, and user interactions for each flow.