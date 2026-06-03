import React from 'react';
import { useAuthController } from './controllers/useAuthController';
import { useEmployeeController } from './controllers/useEmployeeController';
import { useHRController } from './controllers/useHRController';
import { useCompanyController } from './controllers/useCompanyController';
import { useAdminController } from './controllers/useAdminController';

// Import Layout & Login
import { Layout } from './views/components/Layout';
import { Login } from './views/components/Login';

// Import Views
// Employee
import { EmployeeDashboardView } from './views/pages/employee/EmployeeDashboardView';
import { EmployeeAttendanceView } from './views/pages/employee/EmployeeAttendanceView';
import { EmployeeLeaveView } from './views/pages/employee/EmployeeLeaveView';
import { EmployeeProfileView } from './views/pages/employee/EmployeeProfileView';

// HR
import { HRDashboardView } from './views/pages/hr/HRDashboardView';
import { HRLeaveApprovalsView } from './views/pages/hr/HRLeaveApprovalsView';
import { HREmployeesView } from './views/pages/hr/HREmployeesView';
import { HRReportsView } from './views/pages/hr/HRReportsView';

// Company
import { CompanyDashboardView } from './views/pages/company/CompanyDashboardView';
import { CompanyEmployeesView } from './views/pages/company/CompanyEmployeesView';

// Admin
import { AdminDashboardView } from './views/pages/admin/AdminDashboardView';
import { AdminUsersView } from './views/pages/admin/AdminUsersView';
import { AdminReportsView } from './views/pages/admin/AdminReportsView';
import { AdminCompaniesView } from './views/pages/admin/AdminCompaniesView';
import { AdminSettingsView } from './views/pages/admin/AdminSettingsView';

export default function App() {
  const authController = useAuthController();
  const { auth, currentPage, setCurrentPage, handleLogout } = authController;

  if (!auth) {
    return <Login {...authController} />;
  }

  return (
    <Layout
      role={auth.role}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
    >
      <RoleRouter role={auth.role} currentPage={currentPage} userId={auth.userId} />
    </Layout>
  );
}

function RoleRouter({ role, currentPage, userId }) {
  if (role === 'employee') {
    return <EmployeeRouter currentPage={currentPage} userId={userId} />;
  }
  if (role === 'hr') {
    return <HRRouter currentPage={currentPage} />;
  }
  if (role === 'company') {
    return <CompanyRouter currentPage={currentPage} companyId={userId} />;
  }
  if (role === 'superadmin') {
    return <AdminRouter currentPage={currentPage} />;
  }
  return <div className="text-white">Invalid Role</div>;
}

function EmployeeRouter({ currentPage, userId }) {
  const controller = useEmployeeController(userId);
  switch (currentPage) {
    case 'dashboard':
      return <EmployeeDashboardView {...controller} />;
    case 'attendance':
      return <EmployeeAttendanceView {...controller} />;
    case 'leave':
      return <EmployeeLeaveView {...controller} />;
    case 'profile':
      return <EmployeeProfileView {...controller} />;
    default:
      return <EmployeeDashboardView {...controller} />;
  }
}

function HRRouter({ currentPage }) {
  const controller = useHRController();
  switch (currentPage) {
    case 'dashboard':
      return <HRDashboardView {...controller} />;
    case 'leave-approvals':
      return <HRLeaveApprovalsView {...controller} />;
    case 'employees':
      return <HREmployeesView {...controller} />;
    case 'reports':
      return <HRReportsView {...controller} />;
    default:
      return <HRDashboardView {...controller} />;
  }
}

function CompanyRouter({ currentPage, companyId }) {
  const controller = useCompanyController(companyId);
  switch (currentPage) {
    case 'dashboard':
      return <CompanyDashboardView {...controller} />;
    case 'employees':
      return <CompanyEmployeesView {...controller} />;
    default:
      return <CompanyDashboardView {...controller} />;
  }
}

function AdminRouter({ currentPage }) {
  const controller = useAdminController();
  switch (currentPage) {
    case 'dashboard':
      return <AdminDashboardView {...controller} />;
    case 'users':
      return <AdminUsersView {...controller} />;
    case 'reports':
      return <AdminReportsView {...controller} />;
    case 'companies':
      return <AdminCompaniesView {...controller} />;
    case 'settings':
      return <AdminSettingsView {...controller} />;
    default:
      return <AdminDashboardView {...controller} />;
  }
}
