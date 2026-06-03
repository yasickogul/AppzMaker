import { 
  hiringCompanies, 
  hrUsers, 
  employees,
  systemSettings,
  leaveBalances
} from '../models/store.js';

export const getDashboard = (req, res) => {
  res.json({
    companies: hiringCompanies,
    hrUsers,
    employees
  });
};

export const createHR = (req, res) => {
  const { name, email, department } = req.body;
  const newHr = {
    id: `hr${String(hrUsers.length + 1).padStart(3, '0')}`,
    name,
    email,
    department,
    status: 'active'
  };
  hrUsers.push(newHr);
  res.json(newHr);
};

export const createCompany = (req, res) => {
  const { name, industry, contact, email, phone } = req.body;
  const newComp = {
    id: `co${String(hiringCompanies.length + 1).padStart(3, '0')}`,
    name,
    industry,
    contact,
    email,
    phone,
    employeeCount: 0,
    status: 'active',
    joinedDate: new Date().toISOString().split('T')[0]
  };
  hiringCompanies.push(newComp);
  res.json(newComp);
};

export const getSettings = (req, res) => {
  res.json(systemSettings);
};

export const updateSettings = (req, res) => {
  const newSettings = req.body;
  
  // Update systemSettings keys
  Object.keys(newSettings).forEach(key => {
    if (key !== 'leaveAllocations') {
      systemSettings[key] = newSettings[key];
    }
  });

  // If leaveAllocations are provided, update them and sync with employees' leaveBalances
  if (newSettings.leaveAllocations) {
    const prevAllocations = systemSettings.leaveAllocations;
    systemSettings.leaveAllocations = {
      ...prevAllocations,
      ...newSettings.leaveAllocations
    };

    // Update leave balances for all employees
    const annualTotal = Number(systemSettings.leaveAllocations.annual);
    const casualTotal = Number(systemSettings.leaveAllocations.casual);
    const personalTotal = Number(systemSettings.leaveAllocations.personal);

    leaveBalances.forEach(balance => {
      if (balance.annual) {
        balance.annual.total = annualTotal;
      } else {
        balance.annual = { total: annualTotal, used: 0 };
      }
      
      if (balance.casual) {
        balance.casual.total = casualTotal;
      } else {
        balance.casual = { total: casualTotal, used: 0 };
      }

      if (balance.personal) {
        balance.personal.total = personalTotal;
      } else {
        balance.personal = { total: personalTotal, used: 0 };
      }
      
      // Clean up legacy keys if they exist
      delete balance.sick;
      delete balance.emergency;
    });
  }

  res.json({ message: 'Settings updated successfully', settings: systemSettings });
};
