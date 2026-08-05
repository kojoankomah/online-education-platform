/**
 * Restrict route access by role
 *
 * Example:
 * roleMiddleware("instructor")
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {

    // User info comes from authMiddleware
    if(!req.user){

    return res.status(401).json({

    message:"Authentication required"

    });

    }


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