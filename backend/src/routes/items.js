const router  = require('express').Router();
const multer  = require('multer');
const { error } = require('../utils/apiResponse');
const itemController  = require('../controllers/itemController');
const authenticate    = require('../middleware/authenticate');
const validateRequest = require('../middleware/validateRequest');
const { createItemSchema, updateItemSchema } = require('../validators/itemValidators');

// ── Multer ────────────────────────────────────────────────────────────────────

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.has(file.mimetype)) return cb(null, true);
    cb(new Error(`Unsupported type "${file.mimetype}". Use JPEG, PNG, or WebP.`));
  },
});

function handleUpload(req, res, next) {
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      return error(res, err.message, 400);
    }
    next();
  });
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Order matters: /mine must be declared before /:id to avoid being swallowed as a param.
router.get(   '/',      itemController.getItems);
router.get(   '/mine',  authenticate, itemController.getMyItems);
router.get(   '/:id',   itemController.getItemById);
router.post(  '/',      authenticate, handleUpload, validateRequest(createItemSchema), itemController.createItem);
router.put(   '/:id',   authenticate, validateRequest(updateItemSchema), itemController.updateItem);
router.delete('/:id',   authenticate, itemController.deleteItem);

module.exports = router;
