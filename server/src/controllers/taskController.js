const prisma = require('../lib/prisma');

// GET /api/tasks/project/:projectId
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, projectId, assigneeId, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: 'Title and Project ID are required' });
    }

    if (title.trim().length === 0) {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }

    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        projectId,
        assigneeId: assigneeId || null, // Fix: Handle empty string as null
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create Task Error:', error.message);
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assigneeId, priority, dueDate } = req.body;

    // Check task exists
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Validate enums if provided
    const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE'];
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
    }
    if (title !== undefined && title.trim().length === 0) {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }), // Fix: Handle empty string as null
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
      include: {
        assignee: { select: { id: true, name: true } }
      }
    });

    res.json(task);
  } catch (error) {
    console.error('Update Task Error:', error.message);
    res.status(500).json({ error: 'Server Error', message: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
