# Fleet Management & Vehicle Booking System API

A production-ready backend for managing fleet vehicles, drivers, and booking requests with multi-level approval workflows.

## 🚀 Features

- **Booking System**: Create, manage, and track vehicle bookings
- **Vehicle & Driver Assignment**: Assign vehicles and drivers to approved bookings
- **Multi-Level Approval System**: Dynamic approval chains with configurable levels
- **Conflict Detection**: Automatic detection of double-booking conflicts
- **Dashboard API**: Statistics and analytics for admin dashboard
- **Excel Export**: Generate Excel reports for booking data

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: express-validator
- **Excel Export**: exceljs

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic layer
│   ├── routes/          # API route definitions
│   ├── middlewares/     # Express middleware
│   ├── validations/     # Request validation schemas
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   └── app.js           # Express app setup
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seeder
├── .env                 # Environment variables
├── package.json
└── server.js            # Server entry point
```

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials.

4. **Run Prisma migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

7. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings` | Get all bookings (with filters) |
| GET | `/api/bookings/:id` | Get booking by ID |
| PUT | `/api/bookings/:id` | Update booking |
| DELETE | `/api/bookings/:id` | Delete booking |
| POST | `/api/bookings/:id/assign` | Assign vehicle & driver |
| POST | `/api/bookings/:id/cancel` | Cancel booking |
| POST | `/api/bookings/:id/complete` | Complete booking |

### Approvals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/approvals/:id` | Get approval by ID |
| POST | `/api/approvals/:id/approve` | Approve a booking |
| POST | `/api/approvals/:id/reject` | Reject a booking |
| GET | `/api/approvals/pending/list` | Get pending approvals |
| GET | `/api/approvals/booking/:bookingId` | Get booking approvals |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard statistics |
| GET | `/api/dashboard/recent-bookings` | Get recent bookings |
| GET | `/api/dashboard/trends` | Get booking trends |
| GET | `/api/dashboard/vehicle-utilization` | Get vehicle utilization |
| GET | `/api/dashboard/approver-stats` | Get approver statistics |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/export` | Export bookings to Excel |
| GET | `/api/reports/data` | Get report data |
| GET | `/api/reports/summary` | Get report summary |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | Get all vehicles |
| GET | `/api/vehicles/:id` | Get vehicle by ID |
| POST | `/api/vehicles` | Create vehicle (Admin) |
| PUT | `/api/vehicles/:id` | Update vehicle (Admin) |
| DELETE | `/api/vehicles/:id` | Delete vehicle (Admin) |
| PATCH | `/api/vehicles/:id/status` | Update vehicle status |
| GET | `/api/vehicles/:id/availability` | Check availability |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drivers` | Get all drivers |
| GET | `/api/drivers/:id` | Get driver by ID |
| POST | `/api/drivers` | Create driver (Admin) |
| PUT | `/api/drivers/:id` | Update driver (Admin) |
| DELETE | `/api/drivers/:id` | Delete driver (Admin) |
| PATCH | `/api/drivers/:id/status` | Update driver status |
| GET | `/api/drivers/available/list` | Get available drivers |

## 🔐 Authentication

This API uses a simple header-based authentication for demonstration:

```bash
# Set headers in your requests
x-user-id: <user-id>
x-user-role: <role>
```

In production, implement JWT-based authentication.

## 📊 Database Schema

### Models
- **User**: System users with roles (ADMIN, APPROVER, EMPLOYEE)
- **Vehicle**: Fleet vehicles with status tracking
- **Driver**: Available drivers
- **Booking**: Booking requests with status workflow
- **Approval**: Approval chain with configurable levels

### Enums
- **UserRole**: ADMIN, APPROVER, EMPLOYEE
- **BookingStatus**: DRAFT, PENDING, APPROVED, REJECTED, CANCELLED, IN_PROGRESS, COMPLETED
- **ApprovalStatus**: PENDING, APPROVED, REJECTED
- **VehicleStatus**: AVAILABLE, IN_USE, MAINTENANCE, UNAVAILABLE
- **DriverStatus**: AVAILABLE, ON_DUTY, UNAVAILABLE

## ✅ Approval Flow Logic

1. Booking is created with `PENDING` status
2. Approval chain is created with multiple levels
3. Each level must be approved sequentially
4. **Booking is APPROVED only when ALL approvals are approved**
5. **Any rejection causes the entire booking to be REJECTED**

## 🚫 Conflict Detection

The system automatically detects vehicle conflicts:
- Checks for overlapping time ranges
- Prevents double-booking
- Considers only APPROVED and IN_PROGRESS bookings as conflicts

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run seed` | Seed database with sample data |

## 🧪 Example Requests

### Create a Booking
```bash
POST /api/bookings
Content-Type: application/json
x-user-id: <user-id>

{
  "title": "Client Meeting",
  "purpose": "Meeting with client at their office",
  "startTime": "2026-04-05T09:00:00Z",
  "endTime": "2026-04-05T17:00:00Z",
  "pickupLocation": "Main Office",
  "dropoffLocation": "Client Office",
  "passengerCount": 3,
  "vehicleId": "vehicle-uuid",
  "approvalLevels": ["approver-1-uuid", "approver-2-uuid"]
}
```

### Approve a Booking
```bash
POST /api/approvals/{approval-id}/approve
Content-Type: application/json
x-user-id: <approver-id>
x-user-role: APPROVER

{
  "comments": "Approved - vehicle available"
}
```

### Export Report
```bash
GET /api/reports/export?startDate=2026-04-01&endDate=2026-04-30
x-user-id: <user-id>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC
