const jwt      = require('jsonwebtoken');
const { error } = require('../utils/apiResponse');
const userRepo  = require('../repositories/userRepo');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return error(res, 'Authentication required', 401);
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await userRepo.findById(payload.userId);

    if (!user)           return error(res, 'User not found', 401);
    if (!user.isVerified) return error(res, 'Email not verified', 403);
    if (user.isBanned)   return error(res, 'Account is banned', 403);

    // Attach minimal identity — role always fresh from DB
    req.user = { userId: user._id, role: user.role };
    next();
  } catch {
    return error(res, 'Invalid or expired token', 401);
  }
}

module.exports = authenticate;
