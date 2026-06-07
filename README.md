# Aegis AI Proctor

Premium MERN exam proctoring platform with React, Tailwind, Framer Motion, Socket.IO, Monaco Editor, WebRTC-ready live monitoring, JWT auth, and MongoDB-backed proctoring sessions.

## Quick Start

Install dependencies are already installed in both folders.

Backend:

```bash
cd backend
copy .env.example .env
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
copy .env.example .env
npm run dev
```

Open `http://localhost:5173`.

Demo accounts after seeding:

- Admin: `admin@aegis.ai` / `password123`
- Student: `student@aegis.ai` / `password123`

The frontend also includes a demo fallback if the backend or MongoDB is not running.

## Features

- Student portal with secure exam mode, timer, autosave, MCQ, coding, and descriptive questions
- Webcam and microphone capture hooks with AI proctoring signal simulation
- Tab switch, fullscreen exit, copy/paste, and right-click violation detection
- Admin analytics dashboard with charts, heatmaps, live session cards, and violation feed
- Exam and student management screens
- Monaco coding lab with simulated hidden test cases and execution results
- Express MVC backend with JWT, role-based access, Helmet, rate limiting, Mongoose schemas, and Socket.IO events
