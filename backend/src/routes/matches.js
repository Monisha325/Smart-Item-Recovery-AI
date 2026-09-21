const router          = require('express').Router();
const matchController = require('../controllers/matchController');
const authenticate    = require('../middleware/authenticate');
const requireRole     = require('../middleware/requireRole');

// GET /api/matches/mine — all matches involving the current user's items
router.get('/mine', authenticate, matchController.getMyMatches);

// GET /api/matches/item/:itemId — all matches for a specific item
router.get('/item/:itemId', authenticate, matchController.getMatchesForItem);

// POST /api/matches/:id/accept|reject
router.post('/:id/accept', authenticate, matchController.acceptMatch);
router.post('/:id/reject', authenticate, matchController.rejectMatch);

// Admin — manually trigger matching for an item
router.post('/trigger', authenticate, requireRole('admin'), matchController.triggerMatching);

module.exports = router;
