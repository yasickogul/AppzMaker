import { 
  employees, 
  leaveRequests, 
  leaveBalances,
  hiringCompanies,
  systemSettings
} from '../models/store.js';

export const getLeaves = (req, res) => {
  res.json(leaveRequests);
};

export const reviewLeave = (req, res) => {
  const { status, note, rejectionReason } = req.body;
  const leave = leaveRequests.find(l => l.id === req.params.id);
  
  if (!leave) return res.status(404).json({ error: 'Leave request not found' });
  
  leave.status = status;
  if (note) leave.hrNote = note;
  if (rejectionReason) leave.rejectionReason = rejectionReason;

  res.json({ message: `Leave request ${status} successfully`, leave });
};

export const getEmployees = (req, res) => {
  res.json(employees);
};

export const createEmployee = (req, res) => {
  const { name, email, position, department, companyId, phone, address } = req.body;
  
  const comp = hiringCompanies.find(c => c.id === companyId);
  const companyName = comp ? comp.name : 'Our Company';
  const finalCompanyId = comp ? comp.id : null;

  const newEmp = {
    id: `emp${String(employees.length + 1).padStart(3, '0')}`,
    name,
    email,
    position,
    department,
    company: companyName,
    companyId: finalCompanyId,
    avatar: name.split(' ').map(n => n[0]).join('').toUpperCase(),
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active',
    phone,
    address
  };

  employees.push(newEmp);

  // Initialize leave balance based on system settings
  leaveBalances.push({
    employeeId: newEmp.id,
    annual: { total: parseInt(systemSettings.leaveAllocations.annual) || 15, used: 0 },
    casual: { total: parseInt(systemSettings.leaveAllocations.casual) || 10, used: 0 },
    personal: { total: parseInt(systemSettings.leaveAllocations.personal) || 10, used: 0 }
  });

  res.json({ message: 'Employee created successfully', employee: newEmp });
};
