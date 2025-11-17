# Server Directory Structure

## Overview
This directory contains the backend implementation of the Job Application Portal using Node.js, Express, and MongoDB.

## Directory Structure
```
server/
├── config/                 # Configuration files
│   ├── db.js              # Database connection
│   └── auth.js            # Authentication configuration
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── jobController.js
│   ├── applicationController.js
│   ├── employerController.js
│   └── adminController.js
├── middleware/            # Custom middleware
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── models/                # Mongoose models
│   ├── User.js
│   ├── Job.js
│   └── Application.js
├── routes/                # API routes
│   ├── authRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   ├── employerRoutes.js
│   └── adminRoutes.js
├── uploads/               # File uploads directory
├── utils/                 # Utility functions
├── app.js                 # Express app configuration
└── server.js              # Server entry point
```

## Setup Instructions
1. Install dependencies: `npm install`
2. Create a `.env` file based on `.env.example`
3. Run the development server: `npm run dev`

## API Endpoints
### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Jobs
- `GET /api/jobs` - List all jobs (supports search & filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job posting (Employer/Admin)
- `PUT /api/jobs/:id` - Update job posting (Employer/Admin)
- `DELETE /api/jobs/:id` - Delete job posting (Employer/Admin)

### Applications
- `POST /api/applications` - Apply for job (Applicant)
- `GET /api/applications` - Get user's applications (Applicant)
- `GET /api/employer/applications/:jobId` - Employer views applicants for job (Employer)
- `PUT /api/admin/applications/:id` - Update application status (Admin)

### Employer
- `GET /api/employer/jobs` - Get employer's jobs (Employer)
- `GET /api/employer/applications` - Get applications for employer's jobs (Employer)

### Admin
- `GET /api/admin/users` - List all users (Admin)
- `PUT /api/admin/users/:id` - Update user (Admin)
- `DELETE /api/admin/users/:id` - Delete user (Admin)
- `GET /api/admin/jobs` - List all jobs (Admin)
- `GET /api/admin/applications` - List all applications (Admin)