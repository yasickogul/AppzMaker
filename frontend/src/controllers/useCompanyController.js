import { useState, useEffect } from 'react';

const BACKEND_URL = 'http://localhost:5001/api';

export function useCompanyController(companyId) {
  const [company, setCompany] = useState({
    name: 'Loading...',
    industry: '',
    contact: '',
    email: '',
    phone: '',
    employeeCount: 0,
    status: 'active',
  });
  const [myEmployees, setMyEmployees] = useState([]);
  const [todayRecs, setTodayRecs] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchData = async () => {
    if (!companyId) return;
    try {
      const res = await fetch(`${BACKEND_URL}/companies/${companyId}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setCompany(data.company);
        setMyEmployees(data.employees || []);
        setTodayRecs(data.todayRecs || []);
        setWeeklyData(data.weeklyData || []);
        setPresentCount(data.stats?.presentCount || 0);
        setAbsentCount(data.stats?.absentCount || 0);
        setPendingLeaves(data.stats?.pendingLeaves || 0);
        setTotalHours(data.stats?.totalHours || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const filteredEmployees = myEmployees.filter((emp) => {
    const matchSearch =
      searchQuery === '' ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return {
    company,
    myEmployees,
    todayRecs,
    weeklyData,
    presentCount,
    absentCount,
    pendingLeaves,
    totalHours,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    filteredEmployees,
  };
}
