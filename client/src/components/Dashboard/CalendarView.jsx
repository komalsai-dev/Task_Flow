import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { ChevronLeft, ChevronRight, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import './CalendarView.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const CalendarView = () => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [tasks, setTasks] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/users/calendar-tasks');
        setTasks(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Pad grid to full weeks (6 rows × 7 cols = 42 cells)
  const totalCells = 42;
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDay + 1;
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null);
  }

  const getTasksForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.dueDate && t.dueDate.startsWith(dateStr));
  };

  const isToday = (day) => day && day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isPast = (day) => day && new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const selectedTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  // Get the highest priority for the day
  const getHighestPriority = (dayTasks) => {
    if (dayTasks.some(t => t.priority === 'HIGH')) return 'HIGH';
    if (dayTasks.some(t => t.priority === 'MEDIUM')) return 'MEDIUM';
    return 'LOW';
  };

  const priorityColor = (p) => p === 'HIGH' ? 'var(--danger-text)' : p === 'MEDIUM' ? 'var(--warning-text)' : 'var(--success-text)';
  const priorityBg = (p) => p === 'HIGH' ? 'var(--danger-bg)' : p === 'MEDIUM' ? 'var(--warning-bg)' : 'var(--success-bg)';

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <div>
          <h2>{MONTHS[month]} {year}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Your task deadlines at a glance</p>
        </div>
        <div className="calendar-nav">
          <button className="cal-nav-btn" onClick={prevMonth}><ChevronLeft size={20} /></button>
          <button className="cal-nav-btn today-btn" onClick={() => {
            setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
            setSelectedDay(today.getDate());
          }}>Today</button>
          <button className="cal-nav-btn" onClick={nextMonth}><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="calendar-body">
        <div className="calendar-grid-wrapper glass-panel">
          <div className="cal-grid">
            {DAYS.map(d => (
              <div key={d} className="cal-day-header">{d}</div>
            ))}

            {cells.map((day, idx) => {
              const dayTasks = getTasksForDay(day);
              const hasTasks = dayTasks.length > 0;
              const highestPriority = hasTasks ? getHighestPriority(dayTasks) : null;

              return (
                <div
                  key={idx}
                  className={[
                    'cal-cell',
                    !day ? 'empty' : '',
                    isToday(day) ? 'today' : '',
                    selectedDay === day && day ? 'selected' : '',
                    day ? 'has-day' : '',
                    hasTasks ? 'has-tasks' : '',
                    hasTasks ? `priority-${highestPriority.toLowerCase()}` : '',
                    isPast(day) && !hasTasks ? 'past' : ''
                  ].filter(Boolean).join(' ')}
                  onClick={() => day && setSelectedDay(selectedDay === day ? null : day)}
                >
                  {day && (
                    <>
                      <span className="cal-date">{day}</span>
                      {hasTasks && (
                        <div className="cal-task-indicator">
                          <span className="cal-task-count">{dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="calendar-side-panel glass-panel">
          {selectedDay ? (
            <>
              <h3 className="side-panel-title">
                {MONTHS[month]} {selectedDay}, {year}
              </h3>
              {selectedTasks.length === 0 ? (
                <div className="side-panel-empty-day">
                  <div className="empty-day-icon">📋</div>
                  <p>No tasks due on this day.</p>
                  <span>Tasks with due dates will appear here.</span>
                </div>
              ) : (
                <div className="side-tasks-list">
                  {selectedTasks.map(task => (
                    <div key={task.id} className="side-task-card">
                      <div className="side-task-header">
                        <h4>{task.title}</h4>
                        <span className="priority-badge-small" style={{ backgroundColor: priorityBg(task.priority), color: priorityColor(task.priority) }}>
                          {task.priority === 'HIGH' ? <AlertCircle size={12} /> : task.priority === 'MEDIUM' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                          {task.priority}
                        </span>
                      </div>
                      {task.description && <p className="side-task-desc">{task.description}</p>}
                      <p className="side-task-project">📁 {task.project?.name}</p>
                      <span className={`status-chip ${task.status.toLowerCase()}`}>
                        {task.status === 'TODO' ? 'To Do' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="side-panel-empty">
              <div className="empty-cal-icon">📅</div>
              <h4>Task Calendar</h4>
              <p>Click any date to see tasks due on that day.</p>
              <div className="legend">
                <h4>Priority Colors</h4>
                <div className="legend-item"><span className="legend-swatch high"></span> High Priority</div>
                <div className="legend-item"><span className="legend-swatch medium"></span> Medium Priority</div>
                <div className="legend-item"><span className="legend-swatch low"></span> Low Priority</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isLoading && <p style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>Loading tasks...</p>}
    </div>
  );
};

export default CalendarView;
