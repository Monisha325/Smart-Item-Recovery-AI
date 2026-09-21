const router = require('express').Router();
const authController    = require('../controllers/authController');
const authenticate      = require('../middleware/authenticate');
const validateRequest   = require('../middleware/validateRequest');
const { authLimiter }   = require('../middleware/rateLimiter');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resendVerificationSchema,
} = require('../validators/authValidators');

router.post('/register',              authLimiter, validateRequest(registerSchema),             authController.register);
router.post('/resend-verification',   authLimiter, validateRequest(resendVerificationSchema),   authController.resendVerification);
router.post('/login',            authLimiter, validateRequest(loginSchema),            authController.login);
router.get( '/verify-email',                                                           authController.verifyEmail);
router.post('/forgot-password',  authLimiter, validateRequest(forgotPasswordSchema),   authController.forgotPassword);
router.post('/reset-password',   authLimiter, validateRequest(resetPasswordSchema),    authController.resetPassword);
router.get( '/me',               authenticate,                                         authController.getMe);
router.put( '/profile',          authenticate,                                         authController.updateProfile);
router.put( '/change-password',  authenticate,                                         authController.changePassword);
router.get( '/my-stats',         authenticate,                                         authController.getMyStats);

module.exports = router;
