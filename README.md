# TaskFlow — Full-Stack Project Management Application

A modern, full-featured project management dashboard built with **React**, **Node.js/Express**, **Prisma ORM**, and **Supabase (PostgreSQL)**. Designed and developed as part of the ETHARA AI Full-Stack Developer Assessment.

---

## 🚀 Live Features

| Feature | Description |
|---------|-------------|
| **Authentication** | JWT-based Register & Login with bcrypt password hashing |
| **Role-Based Access** | Admin sees all data system-wide; Members see only their own |
| **Projects CRUD** | Create, Read, Update, Delete projects with status tracking |
| **Tasks CRUD** | Full task management with Kanban board (To Do → In Progress → Done) |
| **Task View Popup** | Click any task card to see full details in a modal |
| **Due Dates** | Date picker in task modals — tasks appear on the calendar |
| **Calendar** | Monthly grid calendar with color-coded priority cells |
| **My Tasks** | Unified view of all tasks across all projects with filters |
| **Analytics** | Stats cards, completion ring, status/priority bar charts |
| **Settings** | Edit profile name, email, and change password |
| **Dark/Light Theme** | Full theme toggle with persistent preference |
| **Skeleton Loading** | Shimmer loading states for all pages |
| **Toast Notifications** | Success/error toasts for every CRUD action |
| **Responsive Design** | Mobile-friendly sidebar, grid layouts, and navigation |

---

## 🏗️ Tech Stack

### Frontend
- **React 19** with React Router v7
- **Vanilla CSS** with CSS variables for theming
- **Lucide React** for consistent iconography
- **React Hot Toast** for notifications
- **Axios** for API communication
- **Vite** for fast development & build

### Backend
- **Node.js** + **Express.js** REST API
- **Prisma ORM** for type-safe database access
- **Supabase PostgreSQL** (hosted cloud database)
- **JWT** for authentication
- **bcryptjs** for password hashing

---

## 📁 Project Structure

```
ETHARA_AI_Full_Stack_Assessment/
├── client/                      # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/            # AuthForms, login/register
│   │   │   ├── Dashboard/       # All dashboard pages
│   │   │   │   ├── Dashboard.jsx     # Main layout with sidebar
│   │   │   │   ├── ProjectList.jsx   # Projects grid
│   │   │   │   ├── ProjectDetails.jsx # Kanban board
│   │   │   │   ├── CalendarView.jsx  # Monthly calendar
│   │   │   │   ├── MyTasks.jsx       # Unified task list
│   │   │   │   ├── Analytics.jsx     # Charts & stats
│   │   │   │   └── Settings.jsx      # Profile & password
│   │   │   ├── Skeleton.jsx     # Reusable skeleton components
│   │   │   └── ThemeToggle.jsx  # Dark/Light theme switch
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Auth state & Axios instance
│   │   ├── App.jsx              # Routes & layout
│   │   └── App.css              # Global styles & theme tokens
│   ├── .env.example
│   └── package.json
│
├── server/                      # Node.js Backend (Express)
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register & Login
│   │   │   ├── projectController.js # Project CRUD
│   │   │   ├── taskController.js    # Task CRUD
│   │   │   └── userController.js    # Profile, Analytics, Calendar
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     → JWT verify + adminOnly guard
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── lib/
│   │   │   └── prisma.js            # Prisma client singleton
│   │   └── index.js                 # Express app entry point
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── .env.example
│   └── package.json
│
└── README.md                    # This file
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- A **Supabase** project (free tier works)

### 1. Clone the repository
```bash
git clone <repository-url>
cd ETHARA_AI_Full_Stack_Assessment
```

### 2. Set up the Backend
```bash
cd server
npm install

# Copy environment template and fill in your values
cp .env.example .env
# Edit .env with your Supabase DATABASE_URL and a JWT_SECRET

# Generate Prisma client & push schema to database
npx prisma generate
npx prisma db push

# Start the development server
npm run dev
```

### 3. Set up the Frontend
```bash
cd client
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your Supabase URL and API URL

# Start the development server
npm run dev
```

### 4. Open the app
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 🔑 Environment Variables

### Server (`server/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Server port (default: 5000) |

### Client (`client/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:5000/api`) |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key |

---

## 🔄 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| POST | `/api/auth/reset-password` | Reset password (demo mode) |

### Projects (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all user's projects |
| POST | `/api/projects` | Create a new project |
| PUT | `/api/projects/:id` | Update a project |
| DELETE | `/api/projects/:id` | Delete a project + tasks |

### Tasks (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/project/:projectId` | Get tasks for a project |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

### User (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile or password |
| GET | `/api/users/my-tasks` | Get all tasks across projects |
| GET | `/api/users/analytics` | Get analytics data |
| GET | `/api/users/calendar-tasks` | Get tasks with due dates |

---

## 🎨 Design Decisions

- **CSS Variables** for theming — enables instant dark/light mode toggle without any library
- **Glassmorphism** design language for a modern, premium aesthetic
- **Skeleton loading** provides perceived performance and prevents layout shift
- **Toast notifications** via `react-hot-toast` for non-intrusive feedback
- **Prisma ORM** for type-safe, auto-generated database queries
- **Cascade deletes** — deleting a project automatically removes all associated tasks

---

## 🔐 Role-Based Access Control (RBAC)

| Feature | MEMBER | ADMIN |
|---------|--------|-------|
| View Projects | Own projects only | All projects in the system |
| Edit/Delete Projects | Own projects only | Any project |
| My Tasks | Tasks from own projects | Tasks across all projects |
| Analytics | Personal stats | System-wide stats |
| Calendar | Own due dates | All due dates |

**How to create an Admin account:**  
Register with any email ending in `@admin.taskflow.com`  
Example: `admin@admin.taskflow.com` / password: `Admin1234`

---

## 👤 User Flow

```
Register/Login
    ↓
Dashboard (Projects List)
    ↓
Create Project → Click Project Card
    ↓
Kanban Board (Add/Edit/Delete Tasks)
    ↓
Navigate via Sidebar:
  ├── My Tasks    → All tasks across all projects (filterable)
  ├── Calendar    → Tasks with due dates on monthly grid
  ├── Analytics   → Charts, stats, and completion tracking
  └── Settings    → Profile & password management
```

---

## 📝 License

This project was built for the ETHARA AI Full-Stack Assessment.

---

**Built with ❤️ using React, Node.js, Prisma & Supabase**
