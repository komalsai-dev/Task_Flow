import React from 'react';
import './Skeleton.css';

// reusable loading placeholder
export const SkeletonBlock = ({ width, height, borderRadius, style }) => (
  <div 
    className="skeleton-pulse" 
    style={{ width: width || '100%', height: height || '16px', borderRadius: borderRadius || '6px', ...style }}
  />
);

// project list loading cards
export const ProjectCardSkeleton = () => (
  <div className="skeleton-card glass-panel">
    <div className="skeleton-card-header">
      <SkeletonBlock width="60%" height="18px" />
      <SkeletonBlock width="70px" height="24px" borderRadius="999px" />
    </div>
    <SkeletonBlock width="90%" height="14px" style={{ marginTop: '12px' }} />
    <SkeletonBlock width="70%" height="14px" style={{ marginTop: '6px' }} />
    <div className="skeleton-card-footer">
      <SkeletonBlock width="80px" height="14px" />
      <SkeletonBlock width="100px" height="14px" />
    </div>
    <SkeletonBlock width="100%" height="6px" borderRadius="999px" style={{ marginTop: '12px' }} />
  </div>
);

export const ProjectListSkeleton = () => (
  <div className="projects-grid">
    {[1, 2, 3].map(i => <ProjectCardSkeleton key={i} />)}
  </div>
);

// kanban task card placeholder
export const TaskCardSkeleton = () => (
  <div className="skeleton-task-card glass-panel">
    <SkeletonBlock width="80%" height="16px" />
    <SkeletonBlock width="60%" height="12px" style={{ marginTop: '8px' }} />
    <div className="skeleton-card-footer" style={{ marginTop: '12px' }}>
      <SkeletonBlock width="60px" height="22px" borderRadius="4px" />
      <SkeletonBlock width="80px" height="22px" borderRadius="4px" />
    </div>
  </div>
);

export const KanbanSkeleton = () => (
  <div className="kanban-board">
    {[1, 2, 3].map(col => (
      <div key={col} className="kanban-column" style={{ opacity: 1 }}>
        <div className="column-header">
          <SkeletonBlock width="80px" height="18px" />
          <SkeletonBlock width="24px" height="24px" borderRadius="50%" />
        </div>
        <div className="column-tasks">
          {Array.from({ length: col === 1 ? 3 : col === 2 ? 2 : 1 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// analytics stat card placeholder
export const StatCardSkeleton = () => (
  <div className="stat-card glass-panel">
    <SkeletonBlock width="48px" height="48px" borderRadius="12px" />
    <div style={{ flex: 1 }}>
      <SkeletonBlock width="80px" height="12px" />
      <SkeletonBlock width="50px" height="28px" style={{ marginTop: '6px' }} />
    </div>
  </div>
);

export const AnalyticsSkeleton = () => (
  <>
    <div className="stats-grid">
      {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
    </div>
    <div className="analytics-grid" style={{ marginTop: '28px' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="chart-card glass-panel">
          <SkeletonBlock width="140px" height="16px" />
          <SkeletonBlock width="100%" height="120px" borderRadius="8px" style={{ marginTop: '20px' }} />
        </div>
      ))}
    </div>
  </>
);

// my tasks table loading rows
export const MyTasksSkeleton = () => (
  <div className="tasks-table glass-panel">
    <div className="tasks-table-header">
      <span>Task</span><span>Project</span><span>Priority</span><span>Due Date</span><span>Status</span>
    </div>
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} className="skeleton-table-row">
        <SkeletonBlock width="70%" height="14px" />
        <SkeletonBlock width="60%" height="14px" />
        <SkeletonBlock width="60px" height="22px" borderRadius="4px" />
        <SkeletonBlock width="70px" height="14px" />
        <SkeletonBlock width="80px" height="28px" borderRadius="6px" />
      </div>
    ))}
  </div>
);
