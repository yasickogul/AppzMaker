import express from 'express';
import * as authController from '../controllers/authController.js';
import * as employeeController from '../controllers/employeeController.js';
import * as hrController from '../controllers/hrController.js';
import * as companyController from '../controllers/companyController.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/login', authController.login);

// ==========================================
// EMPLOYEE ROUTES
// ==========================================
router.get('/employees/:id', employeeController.getProfile);
router.get('/employees/:id/attendance', employeeController.getAttendance);
router.post('/employees/:id/attendance', employeeController.logAttendance);
router.get('/employees/:id/leaves', employeeController.getLeaves);
router.post('/employees/:id/leaves', employeeController.createLeaveRequest);
router.put('/employees/:id/client', employeeController.updateClient);

// ==========================================
// HR / MANAGER ROUTES
// ==========================================
router.get('/hr/leaves', hrController.getLeaves);
router.post('/hr/leaves/:id/review', hrController.reviewLeave);
router.get('/hr/employees', hrController.getEmployees);
router.post('/hr/employees', hrController.createEmployee);

// ==========================================
// HIRING COMPANY ROUTES
// ==========================================
router.get('/companies/:id/dashboard', companyController.getDashboard);

// ==========================================
// SUPERADMIN ROUTES
// ==========================================
router.get('/admin/dashboard', adminController.getDashboard);
router.post('/admin/hr', adminController.createHR);
router.post('/admin/companies', adminController.createCompany);
router.get('/admin/settings', adminController.getSettings);
router.post('/admin/settings', adminController.updateSettings);

export default router;
