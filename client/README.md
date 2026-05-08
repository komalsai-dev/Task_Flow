# TaskFlow — Frontend (Client)

React-based frontend for the TaskFlow project management app.

## Tech Used
- React 19 + React Router v7
- Vanilla CSS with CSS variables (dark/light theme)
- Lucide React icons
- React Hot Toast for notifications
- Axios for API calls
- Vite dev server

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` by default.

## Folder Structure

```
src/
├── components/
│   ├── Auth/           → login, register, forgot password forms
│   ├── Dashboard/      → all dashboard pages (projects, kanban, calendar, etc.)
│   ├── Skeleton.jsx    → shimmer loading placeholders
│   └── ThemeToggle.jsx → dark/light mode switch
├── context/
│   ├── AuthContext.jsx → auth state, axios instance, JWT handling
│   └── ThemeContext.jsx → theme state (persisted in localStorage)
├── App.jsx             → routes and layout
└── App.css             → global styles and CSS variables
```

## Pages

| Route | Component | What it does |
|-------|-----------|-------------|
| `/login` | AuthForms | Login / Register / Forgot Password |
| `/dashboard` | ProjectList | Shows all user projects |
| `/dashboard/project/:id` | ProjectDetails | Kanban board with task CRUD |
| `/dashboard/calendar` | CalendarView | Monthly calendar with task due dates |
| `/dashboard/my-tasks` | MyTasks | All tasks in one filterable table |
| `/dashboard/analytics` | Analytics | Stats, charts, completion tracking |
| `/dashboard/settings` | Settings | Profile editing, password change |

## Notes

- All API calls go through the axios instance in `AuthContext.jsx`
- JWT token is stored in localStorage and auto-attached to requests
- Theme preference persists across sessions via localStorage
- Skeleton loaders show on every page while data loads
- Fully responsive — works on mobile, tablet, and desktop
