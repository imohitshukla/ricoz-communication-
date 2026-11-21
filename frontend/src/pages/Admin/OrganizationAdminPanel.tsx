import React, { useState, useEffect } from 'react';
import {
  Shield,
  Building2,
  Users,
  UserCheck,
  UserPlus,
  Clock,
  Lock,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Sparkles,
  Key,
  Globe,
  Sliders,
  Bell,
  RefreshCw,
  MoreVertical,
  Trash2,
  Edit3,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Send,
  X,
  Plus
} from 'lucide-react';
import { api } from '@/lib/api';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  reportingManager: string;
  workMode: string;
  shiftTiming: string;
  status: 'Active' | 'On Leave' | 'Onboarding' | 'Suspended';
  dutyStatus: string;
  joinedDate: string;
  lastActive: string;
  permissions: string[];
}

interface Department {
  id: string;
  name: string;
  code: string;
  headName: string;
  headEmail: string;
  headcount: number;
  budgetAllocated: string;
  channelPermissions: string[];
  description: string;
}

interface ShiftPolicy {
  id: string;
  name: string;
  timing: string;
  timezone: string;
  gracePeriodMins: number;
  breakDurationMins: number;
  workingDays: string[];
  activeEmployeesCount: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorEmail: string;
  role: string;
  action: string;
  category: string;
  resource: string;
  ipAddress: string;
  location: string;
  status: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface OrgSettings {
  companyName: string;
  legalEntity: string;
  registrationNumber: string;
  industry: string;
  headquarters: string;
  domain: string;
  primaryHrEmail: string;
  primaryHrPhone: string;
  timezone: string;
  fiscalYear: string;
  currency: string;
  totalSeats: number;
  tier: string;
  security: {
    enforce2FA: boolean;
    sessionTimeoutMins: number;
    ipWhitelisting: boolean;
    allowedIpRanges: string[];
    ssoEnabled: boolean;
    ssoProvider: string;
    dataRetentionDays: number;
    strictPasswordPolicy: boolean;
    auditLogRetentionDays: number;
  };
  announcements: {
    id: string;
    title: string;
    message: string;
    sender: string;
    createdAt: string;
    priority: 'NORMAL' | 'URGENT' | 'CRITICAL';
  }[];
}

interface RoleDef {
  id: string;
  name: string;
  tagline: string;
  badgeColor: string;
  usersCount: number;
  permissions: { module: string; access: string }[];
}

export function OrganizationAdminPanel() {
  const [activeTab, setActiveTab] = useState<'employees' | 'rbac' | 'departments' | 'shifts' | 'security' | 'profile'>('employees');
  const [isLoading, setIsLoading] = useState(true);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Data states
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [shifts, setShifts] = useState<ShiftPolicy[]>([]);
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isEditEmployeeModalOpen, setIsEditEmployeeModalOpen] = useState(false);
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form states for onboarding
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Support Agent',
    department: 'Customer Experience & Omnichannel Support',
    designation: 'Customer Success Specialist',
    reportingManager: 'Mohit Shukla',
    workMode: 'Hybrid',
    shiftTiming: 'General Corporate Shift (09:30 AM - 06:30 PM)',
    employeeId: ''
  });

  // Announcement state
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    message: '',
    priority: 'NORMAL' as 'NORMAL' | 'URGENT' | 'CRITICAL'
  });

  // Department state
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    headName: '',
    headEmail: '',
    headcount: 5,
    budgetAllocated: '$30,000 / mo',
    description: '',
    channelPermissions: ['WhatsApp', 'Email']
  });

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({
    companyName: '',
    legalEntity: '',
    registrationNumber: '',
    headquarters: '',
    domain: '',
    primaryHrEmail: '',
    primaryHrPhone: '',
    timezone: '',
    currency: '',
    totalSeats: 30
  });

  useEffect(() => {
    fetchOrgOverview();
  }, []);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  const fetchOrgOverview = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/api/organization/overview');
      if (data) {
        setSettings(data.settings);
        setEmployees(data.employees || []);
        setDepartments(data.departments || []);
        setShifts(data.shifts || []);
        setRoles(data.roles || []);
        setAuditLogs(data.auditLogs || []);
        setStats(data.stats || {});
        if (data.settings) {
          setProfileForm({
            companyName: data.settings.companyName || '',
            legalEntity: data.settings.legalEntity || '',
            registrationNumber: data.settings.registrationNumber || '',
            headquarters: data.settings.headquarters || '',
            domain: data.settings.domain || '',
            primaryHrEmail: data.settings.primaryHrEmail || '',
            primaryHrPhone: data.settings.primaryHrPhone || '',
            timezone: data.settings.timezone || '',
            currency: data.settings.currency || '',
            totalSeats: data.settings.totalSeats || 30
          });
        }
      }
    } catch (err) {
      console.error('Failed to load organization overview:', err);
      notify('Failed to load organization data. Using offline cache.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Onboard Employee
  const handleOnboardEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name || !newEmp.email) {
      notify('Please fill in both employee name and work email', 'error');
      return;
    }

    try {
      const res = await api.post('/api/organization/employees', newEmp);
      if (res && res.success) {
        notify(`Employee ${newEmp.name} onboarded! Temp Password: ${res.tempPassword || 'Sent via email'}`);
        setIsOnboardModalOpen(false);
        setNewEmp({
          name: '',
          email: '',
          phone: '',
          role: 'Support Agent',
          department: 'Customer Experience & Omnichannel Support',
          designation: 'Customer Success Specialist',
          reportingManager: 'Mohit Shukla',
          workMode: 'Hybrid',
          shiftTiming: 'General Corporate Shift (09:30 AM - 06:30 PM)',
          employeeId: ''
        });
        fetchOrgOverview();
      }
    } catch (err: any) {
      notify(err.response?.data?.error || 'Failed to onboard employee', 'error');
    }
  };

  // Handle Edit Employee
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      await api.put(`/api/organization/employees/${selectedEmployee.id}`, selectedEmployee);
      notify(`Updated employee record for ${selectedEmployee.name}`);
      setIsEditEmployeeModalOpen(false);
      setSelectedEmployee(null);
      fetchOrgOverview();
    } catch (err: any) {
      notify(err.response?.data?.error || 'Failed to update employee', 'error');
    }
  };

  // Handle Offboard Employee
  const handleOffboardEmployee = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to offboard ${name}? This will permanently revoke their corporate access and credentials.`)) {
      return;
    }

    try {
      await api.delete(`/api/organization/employees/${id}`);
      notify(`Employee ${name} has been offboarded successfully`);
      fetchOrgOverview();
    } catch (err: any) {
      notify(err.response?.data?.error || 'Failed to offboard employee', 'error');
    }
  };

  // Handle Broadcast Announcement
  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.message) {
      notify('Please provide title and message', 'error');
      return;
    }

    try {
      await api.post('/api/organization/announcements', announcementForm);
      notify('Organizational announcement broadcasted to all staff');
      setIsAnnouncementModalOpen(false);
      setAnnouncementForm({ title: '', message: '', priority: 'NORMAL' });
      fetchOrgOverview();
    } catch (err: any) {
      notify(err.response?.data?.error || 'Failed to broadcast announcement', 'error');
    }
  };

  // Handle Add Department
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name || !deptForm.code) {
      notify('Department name and code are required', 'error');
      return;
    }

    try {
      await api.post('/api/organization/departments', deptForm);
      notify(`Department "${deptForm.name}" created successfully`);
      setIsAddDeptModalOpen(false);
      setDeptForm({
        name: '',
        code: '',
        headName: '',
        headEmail: '',
        headcount: 5,
        budgetAllocated: '$30,000 / mo',
        description: '',
        channelPermissions: ['WhatsApp', 'Email']
      });
      fetchOrgOverview();
    } catch (err: any) {
      notify(err.response?.data?.error || 'Failed to create department', 'error');
    }
  };

  // Handle Update Security Policy
  const handleToggle2FA = async () => {
    if (!settings) return;
    const nextVal = !settings.security.enforce2FA;
    try {
      await api.put('/api/organization/security', { enforce2FA: nextVal });
      setSettings(prev => prev ? { ...prev, security: { ...prev.security, enforce2FA: nextVal } } : null);
      notify(`Organization 2FA enforcement is now ${nextVal ? 'ENABLED (Mandatory for all staff)' : 'DISABLED (Optional)'}`);
    } catch (err) {
      notify('Failed to update 2FA policy', 'error');
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/organization/settings', profileForm);
      notify('Organization profile details saved successfully');
      fetchOrgOverview();
    } catch (err) {
      notify('Failed to save profile settings', 'error');
    }
  };

  // CSV Export of Staff Directory
  const handleExportCSV = () => {
    if (!employees.length) return;
    const headers = ['Employee ID', 'Name', 'Email', 'Phone', 'Role', 'Department', 'Designation', 'Status', 'Work Mode', 'Shift', 'Joined Date'];
    const rows = employees.map(e => [
      e.employeeId,
      `"${e.name}"`,
      e.email,
      e.phone,
      e.role,
      `"${e.department}"`,
      `"${e.designation}"`,
      e.status,
      e.workMode,
      `"${e.shiftTiming}"`,
      e.joinedDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ricoz_Staff_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Staff directory CSV exported successfully');
  };

  // Filtered employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.department === deptFilter;
    const matchesRole = roleFilter === 'ALL' || emp.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border transition-all animate-slide-up ${
          notificationMsg.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 backdrop-blur-md'
            : 'bg-rose-950/90 text-rose-300 border-rose-500/40 backdrop-blur-md'
        }`}>
          {notificationMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-rose-400" />}
          <span>{notificationMsg.text}</span>
        </div>
      )}

      {/* Top Banner: Corporate Identity & Compliance */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-emerald-500/20 ring-1 ring-emerald-400/30">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  {settings?.companyName || 'Ricoz Technologies Global Inc.'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Admin Access Panel
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {settings?.tier || 'Enterprise Scale Edition'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span>Domain: <strong className="text-slate-200">{settings?.domain || 'ricoz.io'}</strong></span>
                <span>•</span>
                <span>CIN: <strong className="text-slate-200">{settings?.registrationNumber || 'CIN-U72900DL2024'}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> SOC2 Type II & GDPR Assured
                </span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsAnnouncementModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/80 shadow-sm transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Broadcast Notice</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700/80 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard Employee</span>
            </button>
          </div>

        </div>

        {/* Live HR Announcement Pill */}
        {settings?.announcements && settings.announcements.length > 0 && (
          <div className="max-w-7xl mx-auto mt-4 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                {settings.announcements[0].priority}
              </span>
              <strong className="text-amber-200 truncate">{settings.announcements[0].title}:</strong>
              <span className="text-amber-300/80 truncate hidden md:inline">{settings.announcements[0].message}</span>
            </div>
            <span className="text-[10px] text-amber-400/80 shrink-0 font-medium">
              By {settings.announcements[0].sender}
            </span>
          </div>
        )}
      </div>

      {/* KPI Metric Cards */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: License Seats */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">License Seats</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stats?.occupiedSeats || employees.length}</span>
              <span className="text-xs text-slate-400 font-semibold">/ {stats?.totalSeatsAllocated || 30} Allocated</span>
            </div>
            <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, ((stats?.occupiedSeats || employees.length) / (stats?.totalSeatsAllocated || 30)) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-2 inline-block">
              {stats?.availableSeats || (30 - employees.length)} seats available for onboarding
            </span>
          </div>

          {/* Card 2: Active Departments */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Divisions & Teams</span>
              <Layers className="w-4 h-4 text-teal-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{departments.length}</span>
              <span className="text-xs text-slate-400 font-semibold">Active Departments</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 truncate">
              HR, CX Support, Sales, Tech & Mktg
            </p>
            <span className="text-[10px] text-teal-400 font-semibold mt-1 inline-block">
              All 6 omnichannel channels active
            </span>
          </div>

          {/* Card 3: Staff Presence Status */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Real-time Presence</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stats?.activeStaff || employees.filter(e => e.status === 'Active').length}</span>
              <span className="text-xs text-emerald-400 font-bold">On Duty Now</span>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
              <span>•</span>
              <span className="text-amber-400">{stats?.onLeaveStaff || 0} On Leave</span>
            </div>
            <span className="text-[10px] text-indigo-400 font-semibold mt-1 inline-block">
              {shifts.length} active shift rotas
            </span>
          </div>

          {/* Card 4: Security Posture */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security & Governance</span>
              <Shield className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stats?.securityPostureScore || 96}%</span>
              <span className="text-xs text-emerald-400 font-bold">High Assurance</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Mandatory 2FA:</span>
              <button
                onClick={handleToggle2FA}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                  settings?.security.enforce2FA 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {settings?.security.enforce2FA ? 'ENFORCED' : 'OFF'}
              </button>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold mt-1 inline-block">
              SOC2 Type II & GDPR Verified
            </span>
          </div>

        </div>
      </div>

      {/* Main Content Area with Navigation Tabs */}
      <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 flex flex-col">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'employees', label: 'Staff Directory & Access', icon: Users, count: employees.length },
            { id: 'rbac', label: 'RBAC & Permission Matrix', icon: Lock, count: roles.length },
            { id: 'departments', label: 'Departments & Hierarchy', icon: Layers, count: departments.length },
            { id: 'shifts', label: 'Shifts & SLA Policies', icon: Clock, count: shifts.length },
            { id: 'security', label: 'Security & Audit Trail', icon: Shield, count: auditLogs.length },
            { id: 'profile', label: 'Organizational Profile', icon: Building2 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                  activeTab === tab.id ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Staff Directory & Access Control (HR Portal) */}
        {activeTab === 'employees' && (
          <div className="mt-5 space-y-4">
            
            {/* Search & Filter Bar */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, employee ID, email or designation..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Department filter */}
                <select
                  value={deptFilter}
                  onChange={e => setDeptFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                {/* Role filter */}
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="ALL">All Roles</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Employee Data Table */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Employee</th>
                      <th className="py-3.5 px-4">Department & Designation</th>
                      <th className="py-3.5 px-4">Role & Access</th>
                      <th className="py-3.5 px-4">Work Mode / Shift</th>
                      <th className="py-3.5 px-4">Status & Presence</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          No employees found matching the filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Col 1: Employee */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center font-bold text-emerald-400 text-xs border border-slate-700 shadow-sm shrink-0">
                                {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-white truncate">{emp.name}</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                    {emp.employeeId}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 truncate block">{emp.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Department & Designation */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-200 font-semibold">{emp.designation}</div>
                            <span className="text-[11px] text-slate-400">{emp.department}</span>
                          </td>

                          {/* Col 3: Role & Access */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              emp.role.includes('Admin') 
                                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                : emp.role.includes('Director') || emp.role.includes('HR')
                                ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                : emp.role.includes('Manager')
                                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            }`}>
                              {emp.role}
                            </span>
                          </td>

                          {/* Col 4: Work Mode / Shift */}
                          <td className="py-3.5 px-4">
                            <div className="text-slate-300 font-medium">{emp.workMode}</div>
                            <span className="text-[10px] text-slate-400 truncate block max-w-xs">{emp.shiftTiming}</span>
                          </td>

                          {/* Col 5: Status & Presence */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                emp.status === 'Active' ? 'bg-emerald-400 animate-pulse' : emp.status === 'On Leave' ? 'bg-amber-400' : 'bg-slate-500'
                              }`} />
                              <span className={`font-semibold text-xs ${
                                emp.status === 'Active' ? 'text-emerald-400' : emp.status === 'On Leave' ? 'text-amber-400' : 'text-slate-400'
                              }`}>
                                {emp.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-0.5">{emp.dutyStatus}</span>
                          </td>

                          {/* Col 6: Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedEmployee(emp);
                                  setIsEditEmployeeModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                                title="Edit Role & Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOffboardEmployee(emp.id, emp.name)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
                                title="Offboard Employee"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Role-Based Access Control (RBAC) & Permissions Matrix */}
        {activeTab === 'rbac' && (
          <div className="mt-5 space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Enterprise RBAC Matrix & Governance Policies</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Permissions are strictly enforced across API routes, customer CRM data, broadcast channels, and audit logs according to role tier.
              </p>

              {/* Roles Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                {roles.map(role => (
                  <div key={role.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${role.badgeColor}`}>
                          {role.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {employees.filter(e => e.role === role.id).length} Active Staff
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mb-3">{role.tagline}</p>
                      
                      {/* Permission Modules List */}
                      <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
                        {role.permissions.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 truncate pr-2">{p.module}</span>
                            <span className="font-semibold text-slate-200 text-right truncate text-[10px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              {p.access}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Departments & Organizational Hierarchy */}
        {activeTab === 'departments' && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>Departments & Divisional Allocations</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Organize team units, manage department heads, assign budget quotas, and control channel permissions.
                </p>
              </div>
              <button
                onClick={() => setIsAddDeptModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Department</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map(dept => {
                const assignedStaffCount = employees.filter(e => e.department === dept.name).length;
                return (
                  <div key={dept.id} className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-teal-400 font-bold border border-slate-700">
                          {dept.code}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          {assignedStaffCount || dept.headcount} Staff Members
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-white">{dept.name}</h3>
                      <p className="text-xs text-slate-400 mt-1">{dept.description}</p>
                      
                      <div className="mt-4 space-y-2 border-t border-slate-800 pt-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Head of Department:</span>
                          <span className="text-slate-200 font-semibold">{dept.headName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Contact Email:</span>
                          <span className="text-teal-400 font-mono text-[11px]">{dept.headEmail}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Budget Quota:</span>
                          <span className="text-emerald-400 font-bold">{dept.budgetAllocated}</span>
                        </div>
                      </div>

                      {/* Channels badge */}
                      <div className="mt-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Allowed Channels:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {dept.channelPermissions.map((ch, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                              {ch}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Shifts, Attendance & SLA Governance */}
        {activeTab === 'shifts' && (
          <div className="mt-5 space-y-5">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Organizational Work Shifts & Working Hours</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure corporate shifts, timezones, break allowances, and working day schedules across global regional offices.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {shifts.map(shift => (
                  <div key={shift.id} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-white">{shift.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        {shift.timezone}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Timing Window</span>
                        <strong className="text-white text-xs">{shift.timing}</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Grace Period</span>
                        <strong className="text-emerald-400 text-xs">{shift.gracePeriodMins} Minutes</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Break Duration</span>
                        <strong className="text-slate-200 text-xs">{shift.breakDurationMins} Minutes</strong>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-semibold">Active Rota</span>
                        <strong className="text-indigo-300 text-xs">{shift.activeEmployeesCount} Staff Assigned</strong>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Working Days:</span>
                      {shift.workingDays.map(day => (
                        <span key={day} className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* SLA Targets Policy */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <span>SLA Response & Escalation Thresholds</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold block">First Response Target</span>
                    <p className="text-base font-extrabold text-emerald-400 mt-1">Within 15 minutes</p>
                    <span className="text-[10px] text-slate-500">Auto-routes to AI bot if unassigned</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold block">Resolution Target</span>
                    <p className="text-base font-extrabold text-indigo-400 mt-1">Within 2 hours</p>
                    <span className="text-[10px] text-slate-500">Escalates to Dept Manager if breached</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-bold block">Human Handoff Fallback</span>
                    <p className="text-base font-extrabold text-amber-400 mt-1">Immediate (0s latency)</p>
                    <span className="text-[10px] text-slate-500">Agent collision avoidance enabled</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Security, 2FA & Audit Trail */}
        {activeTab === 'security' && (
          <div className="mt-5 space-y-5">
            
            {/* Security Controls */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Enterprise Security Policies & Compliance</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">Mandatory Two-Factor Auth</span>
                      <button
                        onClick={handleToggle2FA}
                        className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                          settings?.security.enforce2FA ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-all ${
                          settings?.security.enforce2FA ? 'right-1' : 'left-1'
                        }`} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Requires TOTP (Authenticator App) or SMS verification on all employee logins.
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold mt-2 ${settings?.security.enforce2FA ? 'text-emerald-400' : 'text-slate-400'}`}>
                    Status: {settings?.security.enforce2FA ? 'Enforced Workspace-Wide' : 'Optional'}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block mb-1">Single Sign-On (SSO / SAML 2.0)</span>
                    <p className="text-[11px] text-slate-400">
                      Google Workspace & Microsoft Azure AD active for corporate @ricoz.io domain.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 mt-2">
                    Status: Connected & Verified
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block mb-1">Session Inactivity Timeout</span>
                    <p className="text-[11px] text-slate-400">
                      Auto-terminates idle staff sessions after {settings?.security.sessionTimeoutMins || 60} minutes.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 mt-2">
                    SOC2 Compliance Approved
                  </span>
                </div>
              </div>
            </div>

            {/* Live Immutable Audit Logs */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Real-time Organizational Audit Trail</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Captures role changes, employee onboardings, policy updates, and privileged access events.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {auditLogs.length} Events Recorded
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Actor & Role</th>
                      <th className="py-2.5 px-3">Action & Resource</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">IP Address / Geo</th>
                      <th className="py-2.5 px-3">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-slate-200 font-bold block">{log.actor}</span>
                          <span className="text-[10px] text-slate-500">{log.role}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-emerald-300 font-semibold block">{log.action}</span>
                          <span className="text-[10px] text-slate-400">{log.resource}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          <span>{log.ipAddress}</span>
                          <span className="text-[10px] text-slate-500 block">{log.location}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                            log.riskLevel === 'HIGH' 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : log.riskLevel === 'MEDIUM'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {log.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab 6: Organizational Profile */}
        {activeTab === 'profile' && (
          <div className="mt-5 max-w-4xl">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Organizational Entity Profile & Master Governance</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Official corporate registration, legal entity details, primary HR communications, and license seat allocations.
              </p>

              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Company Legal Name</label>
                    <input
                      type="text"
                      value={profileForm.companyName}
                      onChange={e => setProfileForm({ ...profileForm, companyName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Legal Entity Type</label>
                    <input
                      type="text"
                      value={profileForm.legalEntity}
                      onChange={e => setProfileForm({ ...profileForm, legalEntity: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Registration / CIN / Tax ID</label>
                    <input
                      type="text"
                      value={profileForm.registrationNumber}
                      onChange={e => setProfileForm({ ...profileForm, registrationNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Corporate Domain</label>
                    <input
                      type="text"
                      value={profileForm.domain}
                      onChange={e => setProfileForm({ ...profileForm, domain: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 font-bold mb-1">Headquarters Address</label>
                    <input
                      type="text"
                      value={profileForm.headquarters}
                      onChange={e => setProfileForm({ ...profileForm, headquarters: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Primary HR Email</label>
                    <input
                      type="email"
                      value={profileForm.primaryHrEmail}
                      onChange={e => setProfileForm({ ...profileForm, primaryHrEmail: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Primary HR Phone</label>
                    <input
                      type="text"
                      value={profileForm.primaryHrPhone}
                      onChange={e => setProfileForm({ ...profileForm, primaryHrPhone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Corporate Timezone</label>
                    <input
                      type="text"
                      value={profileForm.timezone}
                      onChange={e => setProfileForm({ ...profileForm, timezone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Total License Seats Allocated</label>
                    <input
                      type="number"
                      value={profileForm.totalSeats}
                      onChange={e => setProfileForm({ ...profileForm, totalSeats: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer"
                  >
                    Save Master Profile Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* ──────────────── MODAL 1: ONBOARD EMPLOYEE ──────────────── */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Onboard New Employee</h3>
                  <p className="text-[11px] text-slate-400">Issues corporate credentials, assigns department & RBAC role.</p>
                </div>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOnboardEmployee} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyansh Saxena"
                    value={newEmp.name}
                    onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="priyansh@ricoz.io"
                    value={newEmp.email}
                    onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={newEmp.phone}
                    onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Employee ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank (e.g. RCZ-109)"
                    value={newEmp.employeeId}
                    onChange={e => setNewEmp({ ...newEmp, employeeId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department</label>
                  <select
                    value={newEmp.department}
                    onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Access Role (RBAC)</label>
                  <select
                    value={newEmp.role}
                    onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Support Executive"
                    value={newEmp.designation}
                    onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Work Mode</label>
                  <select
                    value={newEmp.workMode}
                    onChange={e => setNewEmp({ ...newEmp, workMode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Hybrid (Gurugram HQ)">Hybrid (Gurugram HQ)</option>
                    <option value="In-Office (New Delhi)">In-Office (New Delhi)</option>
                    <option value="Remote (Global)">Remote (Global)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-lg cursor-pointer"
                >
                  Confirm & Send Onboarding Invite
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ──────────────── MODAL 2: EDIT EMPLOYEE RECORD ──────────────── */}
      {isEditEmployeeModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <h3 className="text-sm font-extrabold text-white">Edit Employee: {selectedEmployee.name}</h3>
                <p className="text-[11px] text-slate-400 font-mono">ID: {selectedEmployee.employeeId} · {selectedEmployee.email}</p>
              </div>
              <button
                onClick={() => setIsEditEmployeeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Role & Permissions</label>
                  <select
                    value={selectedEmployee.role}
                    onChange={e => setSelectedEmployee({ ...selectedEmployee, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Employment Status</label>
                  <select
                    value={selectedEmployee.status}
                    onChange={e => setSelectedEmployee({ ...selectedEmployee, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department</label>
                  <select
                    value={selectedEmployee.department}
                    onChange={e => setSelectedEmployee({ ...selectedEmployee, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Designation</label>
                  <input
                    type="text"
                    value={selectedEmployee.designation}
                    onChange={e => setSelectedEmployee({ ...selectedEmployee, designation: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Work Mode</label>
                  <input
                    type="text"
                    value={selectedEmployee.workMode}
                    onChange={e => setSelectedEmployee({ ...selectedEmployee, workMode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Shift Timing</label>
                  <input
                    type="text"
                    value={selectedEmployee.shiftTiming}
                    onChange={e => setSelectedEmployee({ ...selectedEmployee, shiftTiming: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black cursor-pointer shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ──────────────── MODAL 3: BROADCAST HR NOTICE ──────────────── */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">Broadcast Organizational Notice</h3>
              </div>
              <button
                onClick={() => setIsAnnouncementModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBroadcastAnnouncement} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Notice Headline *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Performance Reviews & Shift Timings Update"
                  value={announcementForm.title}
                  onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Priority Level</label>
                <select
                  value={announcementForm.priority}
                  onChange={e => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="NORMAL">NORMAL (Informational banner)</option>
                  <option value="URGENT">URGENT (Highlighted alert)</option>
                  <option value="CRITICAL">CRITICAL (Action required)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Message Content *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the message to be displayed to all staff members..."
                  value={announcementForm.message}
                  onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-lg"
                >
                  Broadcast Notice Now
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ──────────────── MODAL 4: ADD DEPARTMENT ──────────────── */}
      {isAddDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
            
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-extrabold text-white">Create New Department</h3>
              </div>
              <button
                onClick={() => setIsAddDeptModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDepartment} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Strategic Partnerships"
                    value={deptForm.name}
                    onChange={e => setDeptForm({ ...deptForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STR-PRT"
                    value={deptForm.code}
                    onChange={e => setDeptForm({ ...deptForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Head of Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Sneha Patel"
                    value={deptForm.headName}
                    onChange={e => setDeptForm({ ...deptForm, headName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Head Email</label>
                  <input
                    type="email"
                    placeholder="sneha.partnerships@ricoz.io"
                    value={deptForm.headEmail}
                    onChange={e => setDeptForm({ ...deptForm, headEmail: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Monthly Budget Allocation</label>
                <input
                  type="text"
                  placeholder="$35,000 / mo"
                  value={deptForm.budgetAllocated}
                  onChange={e => setDeptForm({ ...deptForm, budgetAllocated: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Scope of work and responsibilities..."
                  value={deptForm.description}
                  onChange={e => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddDeptModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black cursor-pointer shadow-lg"
                >
                  Create Department
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
export default OrganizationAdminPanel;
