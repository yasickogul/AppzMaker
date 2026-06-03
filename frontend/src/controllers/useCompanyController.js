import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5001/api';

export function useCompanyController(companyId) {
  const [company, setCompany] = useState({
    name: 'TechVentures Ltd',
    industry: 'Technology',
    contact: 'Mark Reynolds',
    email: 'mark@techventures.com',
    phone: '+1 (555) 100-2000',
    employeeCount: 24,
    status: 'active'
  });
  const [myEmployees, setMyEmployees] = useState([]);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  // Search & filters for Company Employees page
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/companies/${companyId}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setCompany(data.company);
        setMyEmployees(data.employees);

        // Simulated dashboards telemetry derived from employees list
        const activeCount = data.employees.filter(e => e.status === 'active').length;
        setPresentCount(activeCount);
        setAbsentCount(data.employees.length - activeCount);
        setPendingLeaves(2);
        setTotalHours(160);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const filteredEmployees = myEmployees.filter(emp => {
    const matchSearch = searchQuery === '' || 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      emp.position.toLowerCase().includes(searchQuery.toLowerCase()) || 
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return {
    company,
    myEmployees,
    todayRecs: [],
    presentCount,
    absentCount,
    pendingLeaves,
    totalHours,
    
    // Roster search filters
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredEmployees,
  };
}
