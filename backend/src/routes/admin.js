const router = require('express').Router();
const adminController = require('../controllers/adminController');
const authenticate    = require('../middleware/authenticate');
const requireRole     = require('../middleware/requireRole');

router.use(authenticate, requireRole('admin'));

router.get(   '/stats',         adminController.getStats);
router.get(   '/users',         adminController.getUsers);
router.put(   '/users/:id/ban', adminController.toggleBanUser);
router.get(   '/items',         adminController.getItems);
router.delete('/items/:id',     adminController.deleteItem);
router.get(   '/matches',       adminController.getMatches);

module.exports = router;
