# UniEvents - University Event Planning, Management and Digital Archive Platform

A full-stack MERN platform for managing the complete lifecycle of university events, from draft creation and approval workflows to participation tracking and long-term digital archiving.

## Live Demo

- Frontend: https://unievents-portal.vercel.app/
- Backend API: Hosted on Render (private/internal)

## Overview

UniEvents centralizes event operations that are often split across chat apps, forms, and spreadsheets. The system provides role-aware workflows so students, organizers, and administrators can collaborate in one place with clear accountability.

The platform enables:

- Organizers to create and manage events
- Admins to review and approve publishing workflows
- Students to discover, register, review, and bookmark events
- Institutions to preserve archived event history as read-only records

## Key Features

### Authentication and Security

- JWT-based authentication
- Role-Based Access Control (Student, Organizer, Admin)
- Password hashing using bcryptjs
- Protected API routes and centralized auth middleware
- Security hardening with Helmet, CORS controls, and rate limiting

### Event Management

- Create, edit, and manage events
- Admin approval pipeline for publishing
- Lifecycle-driven state transitions
  - Draft -> Pending Approval -> Published -> Archived
  - Rejected -> Edit -> Resubmit
- Soft delete and restore support

### Participation System

- Event registration with capacity constraints
- Cancel registration
- Organizer attendee visibility
- Eligibility checks using academic/profile rules:
  - Department
  - Semester
  - Year
  - CGPA
  - Skills

### User Interaction

- Save/bookmark events
- Mark interest
- Event reviews and ratings

### User Profiles

- Profile dashboard with activity summary
- Academic profile management (CGPA, skills, etc.)
- Password update flow

### Public and Institutional Modules

- Public landing page with dynamic statistics
- FAQ module
- Contact module
- Public stats and informational APIs

## Architecture

UniEvents follows a layered architecture:

Frontend (React + Tailwind CSS)
-> Backend (Node.js + Express REST API)
-> Database (MongoDB + Mongoose)
-> Media Storage (Cloudinary)

Responsibilities by layer:

- Frontend: UI, client-side routing, and role-based UX
- Backend: business logic, validation, and secure API handling
- Database: persistent storage for users, events, registrations, and reviews
- Cloudinary: media upload and asset hosting

## Tech Stack

| Layer          | Technology                                     |
| -------------- | ---------------------------------------------- |
| Frontend       | React, Vite, Tailwind CSS, Axios, React Router |
| Backend        | Node.js, Express                               |
| Database       | MongoDB, Mongoose                              |
| Validation     | Zod                                            |
| Authentication | JWT, bcryptjs                                  |
| Security       | Helmet, CORS, express-rate-limit               |
| Media Storage  | Cloudinary                                     |
| Deployment     | Vercel, Render, MongoDB Atlas                  |

## System Design Summary

### Use Cases

Primary actors:

- Student
- Organizer
- Admin

### Core Data Model

Key entities:

- User
- Event
- Registration
- EventReview
- FAQ
- ContactMessage

### Event Lifecycle

Draft -> Pending -> Published -> Archived
Rejected -> Edit -> Resubmit
Soft Delete -> Trash -> Restore

## Project Structure

```text
MERN/
|- backend/
|  |- config/
|  |- controllers/
|  |- middleware/
|  |- models/
|  |- routes/
|  |- validators/
|  |- utils/
|  |- server.js
|  |- seed-admin.js
|- frontend/
|  |- src/
|  |  |- components/
|  |  |- context/
|  |  |- pages/
|  |  |- routes/
|  |  |- services/
|  |- index.html
|- README.md
```

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/unievents.git
cd unievents
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a .env file in backend/:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run backend in development mode:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a .env file in frontend/:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Run frontend:

```bash
npm run dev
```

## API and Health Check

- Base API path: /api/v1
- Health endpoint: /api/v1/health

## Available Scripts

### Backend

- npm run dev -> Start server with nodemon
- npm start -> Start server with node

### Frontend

- npm run dev -> Start Vite dev server
- npm run build -> Build production assets
- npm run preview -> Preview production build locally
- npm run lint -> Run ESLint

## Testing

Current validation is primarily manual and API-centric.

- API testing with Postman
- End-to-end behavior checks for:
  - Authentication and RBAC
  - Event lifecycle transitions
  - Registration and cancellation logic
  - Eligibility validation
  - Reviews and ratings

## Challenges Solved

- Designing a robust lifecycle-based event workflow
- Implementing role-based authorization across multiple modules
- Enforcing eligibility constraints for participation
- Structuring MongoDB schema relationships for consistency and scale
- Integrating Cloudinary for upload management
- Deploying split frontend/backend infrastructure

## Future Improvements

- Admin analytics dashboard
- Email and notification workflows
- Certificate generation for participants
- Advanced search and filtering
- Mobile application support

## Contributors

- Shafin Nigamana (D25DIT094)
- Meet Thacker (D25DIT102)
- Rudra Maiyariya (D25DIT081)

## Contact

- Email: shafin.nigamana@gmail.com
- LinkedIn: https://linkedin.com/in/shafin_nigamana

## License

This project is licensed under the MIT License.

```text
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Support

If this project helps you:

- Star the repository
- Fork and contribute
