# HRMS Server

Backend for the HRMS project. The implementation is based on the supplied HRMS specification and preserves the existing `/auth`, `/hr`, `/employee` API areas while adding modular APIs for the remaining functional modules.

## Stack

- Node.js + Express (ES modules)
- MongoDB + Mongoose
- JWT + bcryptjs
- Multer
- Nodemailer (optional email notifications)
- Built-in dependency-free text PDF generation for payslips
- Existing face-api.js/canvas support retained for face-related functionality

## 1. Install

```bash
cd hrms-server
npm install
```

Do not commit `node_modules/` or `.env`.

## 2. Environment

Copy `.env.example` to `.env` and set at least:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/hrms
JWT_SECRET=use-a-long-random-secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
APP_TIMEZONE=Asia/Kolkata
WORKING_HOURS_PER_DAY=9
```

Email variables are optional. If they are empty, core HRMS APIs continue to work and email delivery is skipped.

## 3. Start MongoDB

Local MongoDB:

```bash
mongod
```

or use the supplied Docker Compose file:

```bash
docker compose up -d mongodb
```

## 4. Start the backend

Development:

```bash
npm run dev
```

Production-style local run:

```bash
npm start
```

Health check:

```text
GET http://localhost:5000/health
```

## 5. Docker

Create `.env` first with `JWT_SECRET`, then:

```bash
docker compose up --build
```

## Authentication

Login uses the employee ID and password as specified by the project. Send the returned token on protected calls:

```http
Authorization: Bearer <JWT>
```

JWT logout invalidates the current token through the user's token version.

## Consistent response format

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Paginated success also contains `meta`.

Error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {}
}
```

## API Contract

Base URL: `http://localhost:5000`

### Authentication

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/auth/login` | No | `{ empId, password }` |
| POST | `/auth/logout` | JWT | none |
| GET | `/auth/profile` | JWT | none |
| PATCH | `/auth/change-password/:empId` | JWT | Employee itself or HR for direct reports | `{ password, firstName?, lastName? }` |
| POST | `/auth/register` | No for employee creation; HR can create under session | `{ name,email,password,mobile,empId,... }` |

Login response includes `token`, `role`, and `user` for direct Redux authentication state.

### Employee dashboard

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/dashboard/employee` | JWT | employee/manager |

### HR dashboard

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| GET | `/dashboard/hr` | JWT | HR |

Returns organization metrics including employee counts, present/absent/late, leave approvals and payroll totals, plus recent employees and leave requests.

### Employee management

| Method | Endpoint | Auth | Role | Body/query |
|---|---|---|---|---|
| GET | `/employees` | JWT | HR | `page,limit,search,department,designation,status` |
| GET | `/employees/:id` | JWT | HR | none |
| POST | `/employees` | JWT | HR | employee onboarding data; password required |
| PATCH | `/employees/:id` | JWT | HR | permitted employee fields |
| PATCH | `/employees/:id/status` | JWT | HR | `{ status: "active"|"inactive"|"offboarding" }` |
| PUT | `/employees/:id/address` | JWT | HR | address fields |
| POST | `/employees/:id/emergency-contact` | JWT | HR | contact fields |
| GET | `/employees/departments/list` | JWT | HR | none |
| POST | `/employees/departments` | JWT | HR | `{ title }` |
| PATCH | `/employees/departments/:id` | JWT | HR | `{ title }` |
| DELETE | `/employees/departments/:id` | JWT | HR | none |

Legacy-compatible HR employee endpoints remain under `/hr/employees` and `/hr/add-new-employee`.

### Attendance

| Method | Endpoint | Auth | Role | Body/query |
|---|---|---|---|---|
| POST | `/attendance/check-in` | JWT | employee/manager | none |
| POST | `/attendance/check-out` | JWT | employee/manager | none |
| GET | `/attendance/today` | JWT | any authenticated user | none |
| GET | `/attendance/history` | JWT | employee/manager | `startDate?,endDate?,status?,page?,limit?` |
| GET | `/attendance/monthly-summary` | JWT | employee/manager | `year?,month?` |
| GET | `/attendance/hr` | JWT | HR | `date?,startDate?,endDate?,department?,employeeId?,status?,search?,page?,limit?` |

Working hours are calculated from check-in/check-out. The existing project behavior uses `WORKING_HOURS_PER_DAY=9` by default; change that environment value if the project owner specifies another threshold.

Legacy aliases remain: `/auth/checkin`, `/auth/checkout`, `/auth/today-attendace`.

### Leave

Leave types supported by the specification are casual, sick, annual, emergency, maternity, paternity and unpaid. The legacy `anual` spelling is also accepted for compatibility.

| Method | Endpoint | Auth | Role | Body/query |
|---|---|---|---|---|
| POST | `/leaves` | JWT | employee/manager | multipart: `leaveType,startDate,endDate,reason,document?` |
| GET | `/leaves` | JWT | employee/manager | `page,limit,status,leaveType` |
| GET | `/leaves/balance` | JWT | employee/manager | `year?` |
| GET | `/leaves/hr` | JWT | HR | `page,limit,status,leaveType,startDate,endDate,search` |
| PATCH | `/leaves/:id/review` | JWT | HR | `{ status: "Approved"|"Rejected", message? }` |

The specification defines leave balance but does not provide quota values, so the balance endpoint reports approved usage by leave type without inventing annual allocations.

### Payroll and payslips

| Method | Endpoint | Auth | Role | Body/query |
|---|---|---|---|---|
| POST | `/payroll` | JWT | HR | salary fields + `empId,month,year?,calendarDays?,paidDays?,lossDays?` |
| GET | `/payroll` | JWT | HR | `month?,year?,status?,employeeId?` |
| GET | `/payroll/my` | JWT | employee/manager | `month?,year?` |
| GET | `/payroll/payslips/:id` | JWT | owner/HR | none |
| GET | `/payroll/payslips/:id/pdf` | JWT | owner/HR | none; returns PDF |

Calculation:

```text
Basic Salary + Allowances + Bonus + Overtime = Gross Salary
Gross Salary - Deductions = Net Salary
```

Supported deduction fields include `pf`, `tds`, `professionalTax`, and `otherDeductions`. The supplied specification does not define tax/PF formulas, so the backend does not invent them.

Legacy payroll endpoints remain under `/hr/pay-slip`, `/hr/monthwise-pay-slip`, and `/hr/uploadpayslip/:userId`.

### Profile

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| GET | `/profile` | JWT | none |
| PATCH | `/profile` | JWT | permitted personal fields |
| PUT | `/profile/address` | JWT | address fields |
| PUT | `/profile/emergency-contact` | JWT | emergency contact fields |

### Documents

Multipart upload field: `file`.

| Method | Endpoint | Auth | Role | Body/query |
|---|---|---|---|---|
| POST | `/documents` | JWT | employee/manager/HR | `file`, `documentType`, `documentName?`, HR additionally `userId` |
| GET | `/documents/my` | JWT | authenticated | `documentType?` |
| GET | `/documents/employee/:userId` | JWT | HR | `documentType?` |
| GET | `/documents/:id/download` | JWT | owner/HR | none |
| PUT | `/documents/:id` | JWT | owner/HR | multipart `file` |
| DELETE | `/documents/:id` | JWT | owner/HR | none |

Document types: `resume`, `id-proof`, `certificate`, `offer-joining`, `experience-letter`, `profile-photo`, `other`.

### Notifications

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| GET | `/notifications` | JWT | query: `page,limit` |
| PATCH | `/notifications/:id/read` | JWT | none |
| PATCH | `/notifications/read-all` | JWT | none |

Notifications are generated for specified HRMS events such as new leave requests, leave decisions and generated payslips. Email delivery is optional.

### Reports

All report endpoints require HR authentication. Add `export=csv` to return CSV.

| Method | Endpoint | Query |
|---|---|---|
| GET | `/reports/employees` | `department,status,search,export` |
| GET | `/reports/attendance` | `startDate,endDate,status,export` |
| GET | `/reports/leave` | `startDate,endDate,status,leaveType,export` |
| GET | `/reports/payroll` | `month,year,export` |
| GET | `/reports/overtime` | `startDate,endDate,export` |
| GET | `/reports/late-absence` | `startDate,endDate,export` |

### Settings

The specification identifies application/user preferences but does not define individual preference fields. The backend therefore stores an extensible `preferences` object without imposing invented preference semantics.

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| GET | `/settings` | JWT | none |
| PATCH | `/settings` | JWT | `{ preferences: { ... } }` or preference object |

### Existing compatibility endpoints

The original project endpoint families remain available:

- `/auth/*`
- `/hr/*`
- `/employee/*`
- `/mail/*`

They are protected by the same JWT/role middleware where applicable. The task/timesheet endpoints are retained because they existed in the submitted backend, even though they are not part of the supplied HRMS functional scope.

## Postman test order

1. `POST /auth/login` and copy `token`.
2. Call `GET /auth/profile` with `Authorization: Bearer <token>`.
3. HR: create/list employees.
4. Employee: `POST /attendance/check-in`.
5. Employee: `POST /attendance/check-out`.
6. Employee: submit a leave with `POST /leaves`.
7. HR: `GET /leaves/hr` and approve/reject it.
8. HR: create payroll with `POST /payroll`.
9. Employee: `GET /payroll/my`.
10. Employee/HR: `GET /payroll/payslips/:id/pdf`.
11. Upload a document with `POST /documents`.
12. Check notifications with `GET /notifications`.
13. HR: test each `/reports/*` endpoint and `export=csv`.

## Important security notes

- Never put `.env` in Git.
- Never send the real JWT secret or SMTP password to the frontend.
- Passwords are bcrypt-hashed. A legacy plain-text password is migrated to bcrypt on the next successful login.
- HR routes are restricted to the logged-in HR's employee hierarchy (`head` relationship).
- Document download/delete/replace operations verify ownership/HR scope.
- Uploaded files are restricted to JPG/JPEG/PNG/PDF and have a configurable size limit.
- The backend does not expose the logs directory as a public static directory.
