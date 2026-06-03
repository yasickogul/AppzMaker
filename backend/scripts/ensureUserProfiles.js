/**
 * Links existing User accounts to Employee/HR/Company records by email.
 * Runs after seed on every startup when employees already exist.
 */
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import LeaveBalance from '../models/LeaveBalance.js';
import { getSettings } from '../services/settingsService.js';
import { getEmployeeLegacyId } from '../utils/entityLookup.js';

export const ensureUserProfiles = async () => {
  const users = await User.find();
  const settings = await getSettings();

  for (const user of users) {
    const email = user.email.toLowerCase();

    if (user.role === 'employee') {
      let emp = await Employee.findOne({ email });
      if (!emp) {
        const count = await Employee.countDocuments();
        emp = await Employee.create({
          legacyId: `emp${String(count + 1).padStart(3, '0')}`,
          name: user.name,
          email,
          position: 'Staff',
          department: 'General',
          company: 'Our Company',
          avatar: user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2),
          userId: user._id,
        });
        await LeaveBalance.create({
          employeeId: getEmployeeLegacyId(emp),
          annual: { total: settings.leaveAllocations?.annual || 15, used: 0 },
          casual: { total: settings.leaveAllocations?.casual || 10, used: 0 },
          personal: { total: settings.leaveAllocations?.personal || 10, used: 0 },
        });
      }
      user.profileId = getEmployeeLegacyId(emp);
      await user.save();
    }
  }
};
