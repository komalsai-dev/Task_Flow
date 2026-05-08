const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

// GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// PUT /api/users/me
const updateMe = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Password change logic
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new one' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.json(updated);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// GET /api/users/my-tasks
const getMyTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';

    let projectIds;
    if (isAdmin) {
      // Admins see all projects
      const allProjects = await prisma.project.findMany({ select: { id: true } });
      projectIds = allProjects.map(p => p.id);
    } else {
      // Get all projects owned by this user
      const userProjects = await prisma.project.findMany({
        where: { ownerId: userId },
        select: { id: true }
      });
      projectIds = userProjects.map(p => p.id);
    }

    // Get all tasks in those projects
    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds }
      },
      include: {
        project: { select: { id: true, name: true } }
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// GET /api/users/analytics
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';

    let projects;
    if (isAdmin) {
      projects = await prisma.project.findMany({
        include: { _count: { select: { tasks: true } } }
      });
    } else {
      projects = await prisma.project.findMany({
        where: { ownerId: userId },
        include: { _count: { select: { tasks: true } } }
      });
    }

    const projectIds = projects.map(p => p.id);
    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } }
    });

    const projectStatusCounts = {
      PLANNED: projects.filter(p => p.status === 'PLANNED').length,
      ACTIVE: projects.filter(p => p.status === 'ACTIVE').length,
      COMPLETED: projects.filter(p => p.status === 'COMPLETED').length,
    };

    const taskStatusCounts = {
      TODO: tasks.filter(t => t.status === 'TODO').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      DONE: tasks.filter(t => t.status === 'DONE').length,
    };

    const taskPriorityCounts = {
      LOW: tasks.filter(t => t.priority === 'LOW').length,
      MEDIUM: tasks.filter(t => t.priority === 'MEDIUM').length,
      HIGH: tasks.filter(t => t.priority === 'HIGH').length,
    };

    // Tasks due in the next 7 days
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const upcomingTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= nextWeek);

    res.json({
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks: taskStatusCounts.DONE,
      upcomingTasksCount: upcomingTasks.length,
      projectStatusCounts,
      taskStatusCounts,
      taskPriorityCounts,
      isAdmin
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// GET /api/users/calendar-tasks
const getCalendarTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'ADMIN';

    let projectIds;
    if (isAdmin) {
      const allProjects = await prisma.project.findMany({ select: { id: true } });
      projectIds = allProjects.map(p => p.id);
    } else {
      const userProjects = await prisma.project.findMany({ where: { ownerId: userId }, select: { id: true } });
      projectIds = userProjects.map(p => p.id);
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        dueDate: { not: null }
      },
      include: {
        project: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = { getMe, updateMe, getMyTasks, getAnalytics, getCalendarTasks };
