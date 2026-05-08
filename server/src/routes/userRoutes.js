const express = require('express');
const { getMe, updateMe, getMyTasks, getAnalytics, getCalendarTasks } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/me')
  .get(getMe)
  .put(updateMe);

router.get('/my-tasks', getMyTasks);
router.get('/analytics', getAnalytics);
router.get('/calendar-tasks', getCalendarTasks);

module.exports = router;
