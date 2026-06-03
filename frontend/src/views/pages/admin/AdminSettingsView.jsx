import { useState } from 'react';
import { Clock, Shield, CalendarDays, RefreshCw, Check } from 'lucide-react';

export function AdminSettingsView({
  settings,
  handleUpdateSetting,
}) {
  const [localSettings, setLocalSettings] = useState({ ...settings });
  const [saveStatus, setSaveStatus] = useState({});

  const handleLocalChange = (key, val) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleLeaveChange = (key, val) => {
    setLocalSettings(prev => ({
      ...prev,
      leaveAllocations: {
        ...prev.leaveAllocations,
        [key]: val
      }
    }));
  };

  const saveKey = async (key, val) => {
    setSaveStatus(prev => ({ ...prev, [key]: 'saving' }));
    try {
      await handleUpdateSetting(key, val);
      setSaveStatus(prev => ({ ...prev, [key]: 'saved' }));
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [key]: null }));
      }, 1500);
    } catch (err) {
      setSaveStatus(prev => ({ ...prev, [key]: 'error' }));
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div>
        <h1 className="text-slate-800 font-bold" style={{ fontSize: '1.375rem' }}>System Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure system-wide preferences, working times, and leave balance parameters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Configurations Card */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
          <h2 className="text-slate-800 font-semibold flex items-center gap-2 border-b border-border pb-3">
            <Clock className="w-5 h-5 text-indigo-500" /> Working Times & Hours
          </h2>

          <div className="space-y-4">
            {/* Break Time */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Daily Standard Break Time</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.breakTime || ''}
                  onChange={e => handleLocalChange('breakTime', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  placeholder="e.g. 45 minutes"
                />
                <button
                  onClick={() => saveKey('breakTime', localSettings.breakTime)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.breakTime === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.breakTime === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
              <span className="text-slate-400 text-xs">Sets break time automatically deducted for attendance logging</span>
            </div>

            {/* Work Hours */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Standard Daily Work Hours</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.workHours || ''}
                  onChange={e => handleLocalChange('workHours', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  placeholder="e.g. 8 hours"
                />
                <button
                  onClick={() => saveKey('workHours', localSettings.workHours)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.workHours === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.workHours === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
              <span className="text-slate-400 text-xs">Standard daily target shift duration</span>
            </div>

            {/* Late Threshold */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Late Threshold Limit</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.lateThreshold || ''}
                  onChange={e => handleLocalChange('lateThreshold', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  placeholder="e.g. 15 minutes"
                />
                <button
                  onClick={() => saveKey('lateThreshold', localSettings.lateThreshold)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.lateThreshold === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.lateThreshold === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
              <span className="text-slate-400 text-xs">Minutes allowed after check-in window before status logs as "late"</span>
            </div>

            {/* Overtime Rate */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Overtime Multiplier Rate</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.overtimeRate || ''}
                  onChange={e => handleLocalChange('overtimeRate', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                  placeholder="e.g. 1.5x"
                />
                <button
                  onClick={() => saveKey('overtimeRate', localSettings.overtimeRate)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.overtimeRate === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.overtimeRate === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Allocations Card */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
          <h2 className="text-slate-800 font-semibold flex items-center gap-2 border-b border-border pb-3">
            <CalendarDays className="w-5 h-5 text-emerald-500" /> Leave Balance Allocations
          </h2>

          <div className="space-y-4">
            {/* Annual Leaves */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Annual Leave Allocation (Days)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={localSettings.leaveAllocations?.annual || 0}
                  onChange={e => handleLeaveChange('annual', parseInt(e.target.value) || 0)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
                <button
                  onClick={() => saveKey('leaveAllocations.annual', localSettings.leaveAllocations.annual)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus['leaveAllocations.annual'] === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus['leaveAllocations.annual'] === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Sync'}
                </button>
              </div>
            </div>

            {/* Casual Leaves */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Casual Leave Allocation (Days)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={localSettings.leaveAllocations?.casual || 0}
                  onChange={e => handleLeaveChange('casual', parseInt(e.target.value) || 0)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
                <button
                  onClick={() => saveKey('leaveAllocations.casual', localSettings.leaveAllocations.casual)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus['leaveAllocations.casual'] === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus['leaveAllocations.casual'] === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Sync'}
                </button>
              </div>
            </div>

            {/* Personal Leaves */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Personal Leave Allocation (Days)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={localSettings.leaveAllocations?.personal || 0}
                  onChange={e => handleLeaveChange('personal', parseInt(e.target.value) || 0)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
                <button
                  onClick={() => saveKey('leaveAllocations.personal', localSettings.leaveAllocations.personal)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus['leaveAllocations.personal'] === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus['leaveAllocations.personal'] === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Sync'}
                </button>
              </div>
              <span className="text-slate-400 text-xs">Note: Updating allocations automatically synchronizes leave balances for all active employee files.</span>
            </div>
          </div>
        </div>

        {/* Security & System preferences Card */}
        <div className="bg-white rounded-2xl border border-border p-6 space-y-6 lg:col-span-2">
          <h2 className="text-slate-800 font-semibold flex items-center gap-2 border-b border-border pb-3">
            <Shield className="w-5 h-5 text-violet-500" /> Platform & Telemetry
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Session Timeout Duration</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.sessionTimeout || ''}
                  onChange={e => handleLocalChange('sessionTimeout', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
                <button
                  onClick={() => saveKey('sessionTimeout', localSettings.sessionTimeout)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.sessionTimeout === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.sessionTimeout === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-sm font-medium">Database Backup Schedule</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={localSettings.backupSchedule || ''}
                  onChange={e => handleLocalChange('backupSchedule', e.target.value)}
                  className="flex-1 border border-border rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50"
                />
                <button
                  onClick={() => saveKey('backupSchedule', localSettings.backupSchedule)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 min-w-[80px] justify-center"
                >
                  {saveStatus.backupSchedule === 'saving' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> :
                   saveStatus.backupSchedule === 'saved' ? <Check className="w-3.5 h-3.5" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
