/**
 * Restrict route access by role
 *
 * Example:
 * roleMiddleware("instructor")
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {

    // User info comes from authMiddleware
    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden. Insufficient permissions."
      });
    }

    next();
  };
};

module.exports = roleMiddleware;