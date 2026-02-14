// middleware/auth.js
const authService = require('../services/authService');

const authMiddleware = {
  verifyToken: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token de acesso não fornecido'
        });
      }

      const user = await authService.verifyToken(token);
      
      req.userId = user.id;
      req.user = user;
      next();

    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  },

  requireAdmin: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso restrito para administradores'
      });
    }
    next();
  }
};

module.exports = authMiddleware;