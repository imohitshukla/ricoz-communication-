import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export const organizationRouter = Router();
organizationRouter.use(authenticate);

// Persistent storage file for Organization HR metadata (departments, policies, shifts, audit logs)
const DATA_FILE = path.join(__dirname, '../../uploads/organization_data.json');

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
  category: 'AUTH' | 'ROLE_CHANGE' | 'ONBOARDING' | 'POLICY' | 'SECURITY' | 'DATA_EXPORT';
  resource: string;
  ipAddress: string;
  location: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
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

const DEFAULT_ORG_SETTINGS: OrgSettings = {
  companyName: 'Ricoz Technologies Global Inc.',
  legalEntity: 'Private Limited / Enterprise Entity',
  registrationNumber: 'CIN-U72900DL2024PTC398210',
  industry: 'Omnichannel Enterprise SaaS & Artificial Intelligence',
  headquarters: 'Connaught Place, New Delhi, India & Wilmington, DE, USA',
  domain: 'ricoz.io',
  primaryHrEmail: 'hr@ricoz.io',
  primaryHrPhone: '+91 98765 43210',
  timezone: 'Asia/Kolkata (GMT +05:30)',
  fiscalYear: 'April - March',
  currency: 'INR (₹) / USD ($)',
  totalSeats: 30,
  tier: 'Enterprise Scale Edition',
  security: {
    enforce2FA: true,
    sessionTimeoutMins: 60,
    ipWhitelisting: false,
    allowedIpRanges: ['103.21.244.0/22', '141.101.64.0/18'],
    ssoEnabled: true,
    ssoProvider: 'Google Workspace & Azure AD SAML 2.0',
    dataRetentionDays: 365,
    strictPasswordPolicy: true,
    auditLogRetentionDays: 730
  },
  announcements: [
    {
      id: 'ann-1',
      title: 'Q3 Enterprise Security Audit & SOC2 Review Completed',
      message: 'All department managers and agents must verify their 2FA settings by Friday 5:00 PM. New SLA benchmarks are now in effect.',
      sender: 'HR Director & Compliance Team',
      createdAt: new Date().toISOString(),
      priority: 'URGENT'
    }
  ]
};

const DEFAULT_DEPARTMENTS: Department[] = [
  {
    id: 'dept-hr',
    name: 'Human Resources & People Operations',
    code: 'HR-OPS',
    headName: 'Ananya Sharma',
    headEmail: 'hr-head@ricoz.io',
    headcount: 5,
    budgetAllocated: '$25,000 / mo',
    channelPermissions: ['Email', 'Internal Broadcast', 'SMS Notification'],
    description: 'Manages employee lifecycles, payroll, compliance, and organizational access rights.'
  },
  {
    id: 'dept-cx',
    name: 'Customer Experience & Omnichannel Support',
    code: 'CX-SUP',
    headName: 'Rahul Verma',
    headEmail: 'cx-lead@ricoz.io',
    headcount: 12,
    budgetAllocated: '$48,000 / mo',
    channelPermissions: ['WhatsApp', 'RCS', 'Instagram', 'Voice AI', 'Inbox'],
    description: 'Handles 24/7 client inquiries, live human handoffs, and AI agent monitoring.'
  },
  {
    id: 'dept-sales',
    name: 'Enterprise Growth & Business Development',
    code: 'SLS-ENT',
    headName: 'Vikram Malhotra',
    headEmail: 'vikram.sales@ricoz.io',
    headcount: 8,
    budgetAllocated: '$65,000 / mo',
    channelPermissions: ['WhatsApp Broadcast', 'Cold Calling Hub', 'RCS Studio', 'CRM'],
    description: 'Outbound sales campaigns, cold call automation, and lead pipeline conversions.'
  },
  {
    id: 'dept-tech',
    name: 'Platform Engineering & Integrations',
    code: 'ENG-PLT',
    headName: 'Mohit Shukla',
    headEmail: 'mohit@ricoz.io',
    headcount: 6,
    budgetAllocated: '$80,000 / mo',
    channelPermissions: ['API Hub', 'Webhooks', 'Workflow Builder', 'AI Models', 'All Channels'],
    description: 'Core backend, WhatsApp Cloud API webhooks, AI RAG infrastructure, and security.'
  },
  {
    id: 'dept-mktg',
    name: 'Marketing & Digital Communication',
    code: 'MKT-DIG',
    headName: 'Pooja Iyer',
    headEmail: 'pooja.mktg@ricoz.io',
    headcount: 4,
    budgetAllocated: '$32,000 / mo',
    channelPermissions: ['Instagram Studio', 'Email Marketing', 'RCS Broadcast', 'Analytics'],
    description: 'Brand campaigns, automated newsletter broadcasts, and audience retargeting.'
  }
];

const DEFAULT_SHIFTS: ShiftPolicy[] = [
  {
    id: 'shift-gen',
    name: 'General Corporate Shift',
    timing: '09:30 AM - 06:30 PM',
    timezone: 'IST (UTC +5:30)',
    gracePeriodMins: 15,
    breakDurationMins: 60,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    activeEmployeesCount: 18
  },
  {
    id: 'shift-morning',
    name: 'APAC Early Morning Support',
    timing: '06:00 AM - 03:00 PM',
    timezone: 'SGT / IST',
    gracePeriodMins: 10,
    breakDurationMins: 45,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    activeEmployeesCount: 6
  },
  {
    id: 'shift-emea',
    name: 'EMEA Evening Coverage',
    timing: '02:00 PM - 11:00 PM',
    timezone: 'GMT / IST',
    gracePeriodMins: 15,
    breakDurationMins: 60,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    activeEmployeesCount: 5
  },
  {
    id: 'shift-night',
    name: 'US / Global Night On-Call',
    timing: '09:00 PM - 06:00 AM',
    timezone: 'EST / UTC',
    gracePeriodMins: 15,
    breakDurationMins: 60,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    activeEmployeesCount: 3
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    actor: 'Mohit Shukla',
    actorEmail: 'mohit@ricoz.io',
    role: 'Super Admin',
    action: 'Workspace 2FA Policy Enforced',
    category: 'SECURITY',
    resource: 'Org Security Governance',
    ipAddress: '103.21.244.18',
    location: 'New Delhi, IN',
    status: 'SUCCESS',
    riskLevel: 'MEDIUM'
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actor: 'Ananya Sharma',
    actorEmail: 'hr-head@ricoz.io',
    role: 'HR Director',
    action: 'New Employee Onboarded (RCZ-108: Priyansh Saxena)',
    category: 'ONBOARDING',
    resource: 'Staff Directory',
    ipAddress: '182.73.120.44',
    location: 'Gurugram, IN',
    status: 'SUCCESS',
    riskLevel: 'LOW'
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    actor: 'Vikram Malhotra',
    actorEmail: 'vikram.sales@ricoz.io',
    role: 'Department Manager',
    action: 'Cold Calling Voice Campaign Initiated (1,200 leads)',
    category: 'POLICY',
    resource: 'Voice Hub',
    ipAddress: '49.36.182.201',
    location: 'Mumbai, IN',
    status: 'SUCCESS',
    riskLevel: 'LOW'
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    actor: 'Rahul Verma',
    actorEmail: 'cx-lead@ricoz.io',
    role: 'Department Manager',
    action: 'Permission Elevation Requested for CX Agent',
    category: 'ROLE_CHANGE',
    resource: 'RBAC Matrix',
    ipAddress: '103.88.232.12',
    location: 'Bengaluru, IN',
    status: 'SUCCESS',
    riskLevel: 'MEDIUM'
  },
  {
    id: 'log-105',
    timestamp: new Date(Date.now() - 1000 * 60 * 380).toISOString(),
    actor: 'System Compliance Guard',
    actorEmail: 'system@ricoz.io',
    role: 'System Daemon',
    action: 'Automated SOC2 Weekly Access Credential Scan',
    category: 'SECURITY',
    resource: 'API Credentials Hub',
    ipAddress: '127.0.0.1',
    location: 'Cloud Server',
    status: 'SUCCESS',
    riskLevel: 'LOW'
  }
];

// Helper to read persistent org data
function getOrgData(): {
  settings: OrgSettings;
  departments: Department[];
  shifts: ShiftPolicy[];
  auditLogs: AuditLog[];
  employeeDetails: Record<string, any>;
} {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        settings: { ...DEFAULT_ORG_SETTINGS, ...parsed.settings },
        departments: parsed.departments?.length ? parsed.departments : DEFAULT_DEPARTMENTS,
        shifts: parsed.shifts?.length ? parsed.shifts : DEFAULT_SHIFTS,
        auditLogs: parsed.auditLogs?.length ? parsed.auditLogs : DEFAULT_AUDIT_LOGS,
        employeeDetails: parsed.employeeDetails || {}
      };
    }
  } catch (err) {
    console.error('Error reading organization data file, using defaults:', err);
  }
  return {
    settings: DEFAULT_ORG_SETTINGS,
    departments: DEFAULT_DEPARTMENTS,
    shifts: DEFAULT_SHIFTS,
    auditLogs: DEFAULT_AUDIT_LOGS,
    employeeDetails: {}
  };
}

// Helper to save org data
function saveOrgData(data: {
  settings: OrgSettings;
  departments: Department[];
  shifts: ShiftPolicy[];
  auditLogs: AuditLog[];
  employeeDetails: Record<string, any>;
}) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save organization data file:', err);
  }
}

// Pre-defined enterprise roles & permissions definitions
export const ENTERPRISE_ROLES = [
  {
    id: 'Super Admin',
    name: 'Super Admin / Owner',
    tagline: 'Complete organizational control, governance & billing authority',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    usersCount: 1,
    permissions: [
      { module: 'User & Staff Directory', access: 'Full CRUD + Role Assign' },
      { module: 'HR Governance & Shifts', access: 'Manage Shifts, Policies & Leave' },
      { module: 'Omnichannel Broadcasts', access: 'Uncapped (WhatsApp, RCS, Voice, IG, Email)' },
      { module: 'Customer CRM & Data Export', access: 'Full Read/Write + Sensitive Data Export' },
      { module: 'AI Agents & Automation', access: 'Full Model Config, System Prompt & Train' },
      { module: 'API Hub & Webhooks', access: 'View, Rotate, Generate & Delete Keys' },
      { module: 'Billing, License & Quotas', access: 'Full Plan Upgrade, Invoices & Payment Methods' },
      { module: 'Security Audit & Compliance', access: 'Full Access Logs + SOC2/GDPR Export' }
    ]
  },
  {
    id: 'HR Director',
    name: 'HR Director & People Ops',
    tagline: 'Staff onboarding, lifecycle management, SLA oversight & shift governance',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    usersCount: 2,
    permissions: [
      { module: 'User & Staff Directory', access: 'Onboard, Edit, Suspend, Offboard' },
      { module: 'HR Governance & Shifts', access: 'Create Schedules, Shifts & SLA Policies' },
      { module: 'Omnichannel Broadcasts', access: 'Internal Staff Broadcasts Only' },
      { module: 'Customer CRM & Data Export', access: 'View Staff Directory & Metrics Only' },
      { module: 'AI Agents & Automation', access: 'View Agent Performance Analytics' },
      { module: 'API Hub & Webhooks', access: 'No Direct Key Access' },
      { module: 'Billing, License & Quotas', access: 'View License Seat Utilization' },
      { module: 'Security Audit & Compliance', access: 'View HR Activity & Attendance Logs' }
    ]
  },
  {
    id: 'Department Manager',
    name: 'Department / Team Manager',
    tagline: 'Supervises department members, campaigns, lead routing & SLA metrics',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    usersCount: 4,
    permissions: [
      { module: 'User & Staff Directory', access: 'View Department Members & Status' },
      { module: 'HR Governance & Shifts', access: 'Assign Department Shifts & Timesheets' },
      { module: 'Omnichannel Broadcasts', access: 'Launch Approved Department Campaigns' },
      { module: 'Customer CRM & Data Export', access: 'Department Assigned Leads & Contacts' },
      { module: 'AI Agents & Automation', access: 'Train Department Bot FAQs' },
      { module: 'API Hub & Webhooks', access: 'Read-Only Webhook Status' },
      { module: 'Billing, License & Quotas', access: 'View Department Resource Quota' },
      { module: 'Security Audit & Compliance', access: 'Department Member Audit Trail' }
    ]
  },
  {
    id: 'Senior Agent',
    name: 'Senior Omnichannel Specialist',
    tagline: 'Handles high-priority customer conversations, cold calls & live handoffs',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    usersCount: 8,
    permissions: [
      { module: 'User & Staff Directory', access: 'View Colleagues Online Status' },
      { module: 'HR Governance & Shifts', access: 'View Own Shift & Clock In/Out' },
      { module: 'Omnichannel Broadcasts', access: 'Direct 1-on-1 Messages & Voice Calls' },
      { module: 'Customer CRM & Data Export', access: 'Assigned Conversations & Contacts' },
      { module: 'AI Agents & Automation', access: 'Takeover from AI Bot (Human Handoff)' },
      { module: 'API Hub & Webhooks', access: 'None' },
      { module: 'Billing, License & Quotas', access: 'None' },
      { module: 'Security Audit & Compliance', access: 'Own Activity Log Only' }
    ]
  },
  {
    id: 'Support Agent',
    name: 'Customer Support Staff',
    tagline: 'Standard inbox operations, ticket resolutions & contact updates',
    badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    usersCount: 11,
    permissions: [
      { module: 'User & Staff Directory', access: 'View Team Directory' },
      { module: 'HR Governance & Shifts', access: 'View Own Shift' },
      { module: 'Omnichannel Broadcasts', access: 'Reply to Assigned Tickets' },
      { module: 'Customer CRM & Data Export', access: 'Assigned Contacts Only' },
      { module: 'AI Agents & Automation', access: 'Suggested AI Replies' },
      { module: 'API Hub & Webhooks', access: 'None' },
      { module: 'Billing, License & Quotas', access: 'None' },
      { module: 'Security Audit & Compliance', access: 'None' }
    ]
  },
  {
    id: 'Compliance Auditor',
    name: 'Security & Compliance Auditor',
    tagline: 'Read-only regulatory oversight, audit trail verification & compliance reports',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    usersCount: 1,
    permissions: [
      { module: 'User & Staff Directory', access: 'Read-Only All Staff Records' },
      { module: 'HR Governance & Shifts', access: 'Read-Only Shift Policies' },
      { module: 'Omnichannel Broadcasts', access: 'Read-Only Delivery Logs' },
      { module: 'Customer CRM & Data Export', access: 'Read-Only Privacy Compliance Logs' },
      { module: 'AI Agents & Automation', access: 'Read-Only Safety Guardrails' },
      { module: 'API Hub & Webhooks', access: 'Read-Only Integration Logs' },
      { module: 'Billing, License & Quotas', access: 'Read-Only Plan & Invoices' },
      { module: 'Security Audit & Compliance', access: 'Full Read & Export of All Audit Logs' }
    ]
  }
];

// 1. GET /api/organization/overview - Complete organizational dashboard payload
organizationRouter.get('/overview', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const org = getOrgData();

    // Fetch live users from database for this workspace
    const dbUsers = await prisma.user.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Merge database users with organizational details
    const employees = dbUsers.map((u, index) => {
      const extra = org.employeeDetails[u.id] || {};
      const deptNames = [
        'Platform Engineering & Integrations',
        'Human Resources & People Operations',
        'Customer Experience & Omnichannel Support',
        'Enterprise Growth & Business Development',
        'Marketing & Digital Communication'
      ];
      const defaultDept = deptNames[index % deptNames.length];
      const defaultEmployeeId = `RCZ-${100 + index + 1}`;

      return {
        id: u.id,
        employeeId: extra.employeeId || defaultEmployeeId,
        name: u.name,
        email: u.email,
        phone: extra.phone || '+91 98' + (76000000 + index * 1337).toString().slice(0, 8),
        role: u.role || 'Senior Agent',
        department: extra.department || defaultDept,
        designation: extra.designation || (u.role === 'Admin' ? 'Lead Administrator & Tech Head' : 'Omnichannel Communications Specialist'),
        reportingManager: extra.reportingManager || (u.email === 'mohit@ricoz.io' ? 'Board of Directors' : 'Mohit Shukla (CTO)'),
        workMode: extra.workMode || (index % 2 === 0 ? 'Hybrid (Gurugram HQ)' : 'Remote (Global)'),
        shiftTiming: extra.shiftTiming || 'General Corporate Shift (09:30 AM - 06:30 PM)',
        status: extra.status || 'Active',
        dutyStatus: extra.dutyStatus || (index % 3 === 0 ? 'Clocked In' : index % 3 === 1 ? 'On Break' : 'Available'),
        joinedDate: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2024-01-15',
        lastActive: 'Just now',
        permissions: extra.permissions || ['Chat', 'WhatsApp', 'Contacts', 'Analytics']
      };
    });

    const activeCount = employees.filter(e => e.status === 'Active').length;
    const onLeaveCount = employees.filter(e => e.status === 'On Leave').length;

    res.json({
      settings: org.settings,
      stats: {
        totalSeatsAllocated: org.settings.totalSeats,
        occupiedSeats: employees.length,
        availableSeats: Math.max(0, org.settings.totalSeats - employees.length),
        activeStaff: activeCount,
        onLeaveStaff: onLeaveCount,
        departmentsCount: org.departments.length,
        securityPostureScore: 96,
        soc2Compliance: 'Compliant · Type II Certified',
        gdprStatus: 'Active & Verified',
        mfaEnforced: org.settings.security.enforce2FA
      },
      departments: org.departments,
      shifts: org.shifts,
      employees,
      roles: ENTERPRISE_ROLES,
      auditLogs: org.auditLogs.slice(0, 20),
      announcements: org.settings.announcements
    });
  } catch (error) {
    console.error('Error fetching organization overview:', error);
    res.status(500).json({ error: 'Failed to fetch organization overview' });
  }
});

// 2. POST /api/organization/employees - Onboard / add a new employee
organizationRouter.post('/employees', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const currentActor = (req as any).user;
    const {
      name,
      email,
      phone,
      role = 'Support Agent',
      department = 'Customer Experience & Omnichannel Support',
      designation = 'Omnichannel Communications Specialist',
      reportingManager = 'Mohit Shukla',
      workMode = 'Hybrid',
      shiftTiming = 'General Corporate Shift (09:30 AM - 06:30 PM)',
      employeeId,
      permissions
    } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Name and email are required to onboard an employee' });
    }

    // Check if user already exists in DB
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'A staff member or user with this email already exists' });
    }

    // Default temporary credentials for employee
    const tempPassword = 'RicozCorpPass@' + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role.includes('Admin') ? 'Admin' : role,
        workspaceId
      }
    });

    const org = getOrgData();
    const generatedEmpId = employeeId || `RCZ-${Math.floor(100 + Math.random() * 899)}`;

    org.employeeDetails[newUser.id] = {
      employeeId: generatedEmpId,
      phone: phone || '+91 98000 00000',
      department,
      designation,
      reportingManager,
      workMode,
      shiftTiming,
      status: 'Active',
      dutyStatus: 'Clocked In',
      permissions: permissions || ['Inbox', 'Contacts', 'Campaigns']
    };

    // Append security audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentActor?.name || 'Administrator',
      actorEmail: currentActor?.email || 'admin@ricoz.io',
      role: currentActor?.role || 'Super Admin',
      action: `Employee Onboarded: ${name} (${generatedEmpId}) to ${department}`,
      category: 'ONBOARDING',
      resource: 'Staff Directory',
      ipAddress: req.ip || '127.0.0.1',
      location: 'Enterprise Portal',
      status: 'SUCCESS',
      riskLevel: 'LOW'
    };
    org.auditLogs.unshift(newLog);

    saveOrgData(org);

    res.status(201).json({
      success: true,
      message: 'Employee onboarded successfully with corporate credentials',
      tempPassword,
      employee: {
        id: newUser.id,
        employeeId: generatedEmpId,
        name: newUser.name,
        email: newUser.email,
        role,
        department,
        designation,
        reportingManager,
        workMode,
        shiftTiming,
        status: 'Active',
        dutyStatus: 'Clocked In'
      }
    });
  } catch (error) {
    console.error('Error onboarding employee:', error);
    res.status(500).json({ error: 'Failed to onboard employee' });
  }
});

// 3. PUT /api/organization/employees/:id - Update employee record / role / status
organizationRouter.put('/employees/:id', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const id = req.params.id as string;
    const workspaceId = (req as any).user.workspaceId;
    const currentActor = (req as any).user;
    const {
      name,
      role,
      department,
      designation,
      phone,
      reportingManager,
      workMode,
      shiftTiming,
      status,
      dutyStatus,
      permissions
    } = req.body;

    // Update Prisma User table if name or role provided
    const updateData: any = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role.includes('Admin') ? 'Admin' : role;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.updateMany({
        where: { id, workspaceId },
        data: updateData
      });
    }

    const org = getOrgData();
    const existingExtra = org.employeeDetails[id] || {};

    org.employeeDetails[id] = {
      ...existingExtra,
      ...(department ? { department } : {}),
      ...(designation ? { designation } : {}),
      ...(phone ? { phone } : {}),
      ...(reportingManager ? { reportingManager } : {}),
      ...(workMode ? { workMode } : {}),
      ...(shiftTiming ? { shiftTiming } : {}),
      ...(status ? { status } : {}),
      ...(dutyStatus ? { dutyStatus } : {}),
      ...(permissions ? { permissions } : {})
    };

    // Log the update
    org.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentActor?.name || 'Administrator',
      actorEmail: currentActor?.email || 'admin@ricoz.io',
      role: currentActor?.role || 'Super Admin',
      action: `Employee Record Updated (ID: ${id}) - Role: ${role || 'Unchanged'}, Status: ${status || 'Active'}`,
      category: 'ROLE_CHANGE',
      resource: 'Staff Directory',
      ipAddress: req.ip || '127.0.0.1',
      location: 'Enterprise Portal',
      status: 'SUCCESS',
      riskLevel: 'LOW'
    });

    saveOrgData(org);

    res.json({ success: true, message: 'Employee record updated successfully' });
  } catch (error) {
    console.error('Error updating employee record:', error);
    res.status(500).json({ error: 'Failed to update employee record' });
  }
});

// 4. DELETE /api/organization/employees/:id - Offboard / remove employee
organizationRouter.delete('/employees/:id', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const id = req.params.id as string;
    const workspaceId = (req as any).user.workspaceId;
    const currentActor = (req as any).user;

    if (currentActor.id === id) {
      return res.status(400).json({ error: 'You cannot offboard your own active administrator account' });
    }

    const targetUser = await prisma.user.findFirst({ where: { id, workspaceId } });
    if (!targetUser) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    await prisma.user.delete({ where: { id } });

    const org = getOrgData();
    delete org.employeeDetails[id];

    org.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentActor?.name || 'Administrator',
      actorEmail: currentActor?.email || 'admin@ricoz.io',
      role: currentActor?.role || 'Super Admin',
      action: `Employee Offboarded & Access Revoked: ${targetUser.name} (${targetUser.email})`,
      category: 'ONBOARDING',
      resource: 'Access Revocation',
      ipAddress: req.ip || '127.0.0.1',
      location: 'Enterprise Portal',
      status: 'WARNING',
      riskLevel: 'MEDIUM'
    });

    saveOrgData(org);

    res.json({ success: true, message: 'Employee offboarded and system access permanently revoked' });
  } catch (error) {
    console.error('Error offboarding employee:', error);
    res.status(500).json({ error: 'Failed to offboard employee' });
  }
});

// 5. PUT /api/organization/settings - Update organization details & governance
organizationRouter.put('/settings', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const org = getOrgData();
    const currentActor = (req as any).user;
    const { companyName, legalEntity, registrationNumber, headquarters, domain, primaryHrEmail, primaryHrPhone, timezone, currency, totalSeats } = req.body;

    org.settings = {
      ...org.settings,
      ...(companyName ? { companyName } : {}),
      ...(legalEntity ? { legalEntity } : {}),
      ...(registrationNumber ? { registrationNumber } : {}),
      ...(headquarters ? { headquarters } : {}),
      ...(domain ? { domain } : {}),
      ...(primaryHrEmail ? { primaryHrEmail } : {}),
      ...(primaryHrPhone ? { primaryHrPhone } : {}),
      ...(timezone ? { timezone } : {}),
      ...(currency ? { currency } : {}),
      ...(totalSeats ? { totalSeats: Number(totalSeats) } : {})
    };

    org.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentActor?.name || 'Administrator',
      actorEmail: currentActor?.email || 'admin@ricoz.io',
      role: currentActor?.role || 'Super Admin',
      action: 'Organizational Profile Details Updated',
      category: 'POLICY',
      resource: 'Org Profile',
      ipAddress: req.ip || '127.0.0.1',
      location: 'Enterprise Portal',
      status: 'SUCCESS',
      riskLevel: 'LOW'
    });

    saveOrgData(org);
    res.json({ success: true, settings: org.settings });
  } catch (error) {
    console.error('Error updating org settings:', error);
    res.status(500).json({ error: 'Failed to update organization settings' });
  }
});

// 6. PUT /api/organization/security - Update security & compliance policies (2FA, session timeout)
organizationRouter.put('/security', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const org = getOrgData();
    const currentActor = (req as any).user;
    const {
      enforce2FA,
      sessionTimeoutMins,
      ipWhitelisting,
      allowedIpRanges,
      ssoEnabled,
      ssoProvider,
      dataRetentionDays,
      strictPasswordPolicy
    } = req.body;

    org.settings.security = {
      ...org.settings.security,
      ...(typeof enforce2FA === 'boolean' ? { enforce2FA } : {}),
      ...(sessionTimeoutMins ? { sessionTimeoutMins: Number(sessionTimeoutMins) } : {}),
      ...(typeof ipWhitelisting === 'boolean' ? { ipWhitelisting } : {}),
      ...(allowedIpRanges ? { allowedIpRanges } : {}),
      ...(typeof ssoEnabled === 'boolean' ? { ssoEnabled } : {}),
      ...(ssoProvider ? { ssoProvider } : {}),
      ...(dataRetentionDays ? { dataRetentionDays: Number(dataRetentionDays) } : {}),
      ...(typeof strictPasswordPolicy === 'boolean' ? { strictPasswordPolicy } : {})
    };

    org.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: currentActor?.name || 'Administrator',
      actorEmail: currentActor?.email || 'admin@ricoz.io',
      role: currentActor?.role || 'Super Admin',
      action: `Security Policy Updated (2FA: ${org.settings.security.enforce2FA ? 'Enforced' : 'Optional'}, Timeout: ${org.settings.security.sessionTimeoutMins}m)`,
      category: 'SECURITY',
      resource: 'Security Governance',
      ipAddress: req.ip || '127.0.0.1',
      location: 'Enterprise Portal',
      status: 'SUCCESS',
      riskLevel: 'HIGH'
    });

    saveOrgData(org);
    res.json({ success: true, security: org.settings.security });
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ error: 'Failed to update security settings' });
  }
});

// 7. POST /api/organization/departments - Add or update a department
organizationRouter.post('/departments', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const org = getOrgData();
    const { name, code, headName, headEmail, headcount, budgetAllocated, channelPermissions, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Department name and code are required' });
    }

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name,
      code,
      headName: headName || 'Unassigned',
      headEmail: headEmail || 'dept@ricoz.io',
      headcount: Number(headcount) || 1,
      budgetAllocated: budgetAllocated || '$20,000 / mo',
      channelPermissions: channelPermissions || ['Email', 'Internal'],
      description: description || 'Department operations and campaign governance'
    };

    org.departments.push(newDept);
    saveOrgData(org);

    res.status(201).json({ success: true, department: newDept });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'Failed to create department' });
  }
});

// 8. PUT /api/organization/shifts - Update shifts & work schedules
organizationRouter.put('/shifts', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const org = getOrgData();
    const { shifts } = req.body;

    if (Array.isArray(shifts)) {
      org.shifts = shifts;
      saveOrgData(org);
    }

    res.json({ success: true, shifts: org.shifts });
  } catch (error) {
    console.error('Error updating shifts:', error);
    res.status(500).json({ error: 'Failed to update shift policies' });
  }
});

// 9. POST /api/organization/announcements - Broadcast HR announcement
organizationRouter.post('/announcements', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const org = getOrgData();
    const currentActor = (req as any).user;
    const { title, message, priority = 'NORMAL' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: 'Announcement title and message are required' });
    }

    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      message,
      sender: currentActor?.name ? `${currentActor.name} (${currentActor.role || 'Admin'})` : 'HR & Administration',
      createdAt: new Date().toISOString(),
      priority: priority as 'NORMAL' | 'URGENT' | 'CRITICAL'
    };

    org.settings.announcements.unshift(newAnnouncement);
    saveOrgData(org);

    res.status(201).json({ success: true, announcement: newAnnouncement });
  } catch (error) {
    console.error('Error posting announcement:', error);
    res.status(500).json({ error: 'Failed to post announcement' });
  }
});
