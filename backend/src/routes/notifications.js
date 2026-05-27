const router = require('express').Router();
const notificationController = require('../controllers/notificationController');
const authenticate = require('../middleware/authenticate');

router.get( '/',             authenticate, notificationController.getNotifications);
router.get( '/unread-count', authenticate, notificationController.getUnreadCount);
router.put( '/read-all',     authenticate, notificationController.markAllAsRead);
router.put( '/:id/read',     authenticate, notificationController.markAsRead);

module.exports = router;
