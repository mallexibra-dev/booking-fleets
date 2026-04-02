# 🚗 Fleet Booking System

A fullstack web application for managing vehicle bookings with multi-level approval workflow. Built with modern JavaScript stack and containerized using Docker.

---

## 📌 Overview

This system allows employees to request vehicle bookings, which go through an approval process before being assigned and executed. It also provides monitoring and reporting features.

---

## ⚙️ Tech Stack

### 🧠 Backend

* Node.js (Express)
* Prisma ORM
* PostgreSQL
* ExcelJS

### 🎨 Frontend

* Next.js (App Router)
* TypeScript
* TanStack Query
* React Hook Form
* Yup
* shadcn/ui

### 🐳 DevOps

* Docker
* Docker Compose
* Bun (runtime & package manager)

---

## 🚀 Features

* ✅ Vehicle booking system
* ✅ Multi-level approval workflow
* ✅ Admin assignment (vehicle & driver)
* ✅ Conflict detection (no double booking)
* ✅ Dashboard with statistics
* ✅ Export reports to Excel
* ✅ Role-based access (Admin, Approver, Employee)

---

## 🔄 System Flow

1. Employee creates booking request
2. Admin assigns vehicle and driver
3. Approval Level 1 → Approval Level 2
4. Booking is approved only if all approvals pass
5. If any approval rejects → booking rejected

---

## 📁 Project Structure

```bash
booking/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

---

## 🐳 Running with Docker

### 1. Clone repository

```bash
git clone https://github.com/your-username/booking-fleets.git
cd booking-fleets
```

### 2. Run project

```bash
docker-compose up --build
```

---

## 🌐 Access Application

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:3001 |
| Backend  | http://localhost:3000 |
| Database | localhost:5432        |

---

## ⚙️ Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://postgres:password@postgres:5432/fleet
PORT=3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## 📡 API Endpoints

* `POST /bookings`
* `GET /bookings`
* `POST /bookings/:id/assign`
* `POST /approvals/:id/approve`
* `POST /approvals/:id/reject`
* `GET /dashboard`
* `GET /reports/export`

---

## 🔐 Roles

| Role     | Access                   |
| -------- | ------------------------ |
| EMPLOYEE | Create booking           |
| ADMIN    | Assign vehicle & driver  |
| APPROVER | Approve / reject booking |

---

## 🧠 Key Implementation Details

* Multi-level approval system (dynamic, not hardcoded)
* Conflict validation for vehicle booking
* Clean architecture (controller → service → prisma)
* Separation of concerns (frontend hooks, services, components)
* Dockerized for easy setup

---

## 📦 Development

### Backend

```bash
cd backend
bun install
bun dev
```

### Frontend

```bash
cd frontend
bun install
bun dev
```

---

## 🎯 Future Improvements

* Authentication (JWT)
* Role & permission management
* Real-time notifications
* Deployment (VPS / Cloud)

---

## 👨‍💻 Author

**Malik**
Software Engineer | Indie Hacker

---

## ⭐ Notes

This project is built as a technical test to demonstrate:

* System design thinking
* Fullstack development skills
* DevOps awareness

---