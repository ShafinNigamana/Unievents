# UniEvents

UniEvents is a MERN-based platform built for university event workflows.

The main goal was simple: stop managing events across random Google Forms, chats, and sheets, and move everything into one structured system with proper roles and approvals.

## Live Links

- Frontend: https://unievents-portal.vercel.app/
- Backend API: hosted on Render (private/internal)

## What This Project Does

UniEvents supports the full event journey:

- Organizers create and manage events
- Admins review and approve events before publishing
- Students browse events, register, save, and review them
- The university keeps archived events as long-term records

## Core Features

### Auth and Access

- JWT authentication
- Role-based access (Student, Organizer, Admin)
- Password hashing with bcryptjs
- Protected routes and middleware-based authorization
- Security middleware: Helmet, CORS policy, rate limiting

### Event Workflow

- Create and edit events
- Approval flow handled by admin
- Lifecycle support:
  - Draft -> Pending -> Published -> Archived
  - Rejected -> Edited -> Resubmitted
- Soft delete and restore

### Participation

- Registration with seat/capacity checks
- Registration cancellation
- Organizer attendee view
- Eligibility filters by:
  - Department
  - Semester
  - Year
  - CGPA
  - Skills

### Interaction

- Save/bookmark events
- Mark interest
- Ratings and reviews

### Public Modules

- Landing page with dynamic stats
- FAQ system
- Contact form + admin-side message access

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- Validation: Zod
- Auth: JWT, bcryptjs
- Media: Cloudinary
- Deployment: Vercel, Render, MongoDB Atlas

## Architecture (High Level)

Frontend (React + Tailwind)
-> Backend API (Express)
-> MongoDB (Mongoose)
-> Cloudinary (media assets)

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

## Local Setup

### 1) Clone

```bash
git clone https://github.com/your-username/unievents.git
cd unievents
```

### 2) Backend

```bash
cd backend
npm install
```

Create backend .env:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run backend:

```bash
npm run dev
```

### 3) Frontend

```bash
cd ../frontend
npm install
```

Create frontend .env:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Run frontend:

```bash
npm run dev
```

## Useful Endpoints

- Base API: /api/v1
- Health check: /api/v1/health

## Scripts

### Backend

- npm run dev
- npm start

### Frontend

- npm run dev
- npm run build
- npm run preview
- npm run lint

## Testing Approach

Testing for this project has mainly been API-focused and system-level:

- Postman API testing
- Flow validation for:
  - authentication and RBAC
  - event lifecycle transitions
  - registration and cancellation
  - eligibility logic
  - reviews/ratings

## Challenges Faced

- Designing a practical event lifecycle and keeping transitions safe
- Applying RBAC consistently across routes/controllers
- Eligibility validation without overcomplicating schema logic
- Managing relations cleanly in MongoDB
- Cloudinary media integration
- Separate frontend/backend deployment setup

## Future Scope

- Admin analytics dashboard
- Email notifications
- Event certificate generation
- Better filters and search
- Mobile app version

## Contributors

- Shafin Nigamana (D25DIT094)
- Meet Thacker (D25DIT102)
- Rudra Maiyariya (D25DIT081)

## Contact

- Email: shafin.nigamana@gmail.com
- LinkedIn: https://linkedin.com/in/shafin_nigamana

## License

MIT License
