const router       = require('express').Router();
const qrController = require('../controllers/qrController');
const authenticate = require('../middleware/authenticate');

router.post(  '/generate',        authenticate, qrController.generateQRTag);    // body: { itemId }
router.get(   '/item/:itemId',    authenticate, qrController.getQRTagForItem);   // owner only
router.get(   '/scan/:token',                   qrController.scanQRTag);         // public
router.delete('/item/:itemId',    authenticate, qrController.deleteQRTag);

module.exports = router;
