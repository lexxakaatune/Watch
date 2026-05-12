const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');

router.get('/dashboard', authenticate, requireRole('admin', 'superadmin'), adminController.getDashboard);
router.get('/users', authenticate, requireRole('admin', 'superadmin'), adminController.getUsers);
router.put('/users/:id/role', authenticate, requireRole('admin', 'superadmin'), adminController.updateUserRole);
router.post('/users/:id/suspend', authenticate, requireRole('admin', 'superadmin'), adminController.suspendUser);
router.get('/creators/applications', authenticate, requireRole('admin', 'superadmin'), adminController.getCreatorApplications);
router.post('/creators/:id/approve', authenticate, requireRole('admin', 'superadmin'), adminController.approveCreator);
router.get('/reports', authenticate, requireRole('admin', 'superadmin'), adminController.getReports);
router.put('/reports/:id/resolve', authenticate, requireRole('admin', 'superadmin'), adminController.resolveReport);

module.exports = router;
