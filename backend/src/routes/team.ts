import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { sendTeamInviteEmail } from '../services/emailService';
import bcrypt from 'bcryptjs';

export const teamRouter = Router();

teamRouter.use(authenticate);

// GET /api/team - Root alias returning all workspace members
teamRouter.get('/', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const users = await prisma.user.findMany({
      where: { workspaceId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ members: users, total: users.length });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// GET /api/team/members - Fetch all users in workspace
teamRouter.get('/members', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;

    const users = await prisma.user.findMany({
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

    // Real team member workload (clean 0 counts for fresh launch)
    const members = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'Agent',
      status: 'Online',
      assigned: 0,
      resolved: 0,
      createdAt: u.createdAt
    }));

    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// POST /api/team/invite - Invite a new team member (Admins/Owners only)
teamRouter.post('/invite', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { email, role = 'Agent', name } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    let existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user with a known plain-text temp password (sent via email)
    const plainTempPassword = 'Welcome@Ricoz' + Math.floor(100 + Math.random() * 900) + '!';
    const hashedPassword = await bcrypt.hash(plainTempPassword, 10);

    const validRoles = ['Admin', 'Agent', 'Viewer', 'Owner'];
    const assignedRole = validRoles.includes(role) ? role : 'Agent';

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role: assignedRole,
        workspaceId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Fetch workspace name for the email
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    const inviter = (req as any).user;

    // Send invite email with credentials
    let emailSent = false;
    try {
      const emailResult = await sendTeamInviteEmail({
        toEmail: email,
        toName: newUser.name,
        inviterName: inviter?.name || 'Your Admin',
        workspaceName: workspace?.name || 'Ricoz',
        tempPassword: plainTempPassword,
      });
      emailSent = emailResult.success;
    } catch (mailErr) {
      console.warn('Mail dispatch skipped or failed:', mailErr);
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? 'Team member added & invite email sent'
        : 'Team member created with temporary password generated',
      emailSent,
      tempPassword: plainTempPassword,
      user: {
        ...newUser,
        status: 'Online',
        assigned: 0,
        resolved: 0
      }
    });
  } catch (error) {
    console.error('Error inviting team member:', error);
    res.status(500).json({ error: 'Failed to invite team member' });
  }
});

// PUT /api/team/members/:id/role - Update member role (Admins/Owners only)
teamRouter.put('/members/:id/role', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const currentUserId = (req as any).user.id;
    const id = req.params.id as string;
    const { role } = req.body;

    const validRoles = ['Owner', 'Admin', 'Agent', 'Viewer'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Allowed roles: ${validRoles.join(', ')}` });
    }

    // Verify member belongs to this workspace
    const member = await prisma.user.findFirst({
      where: { id, workspaceId }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found in this workspace' });
    }

    // Safety: don't let user demote themselves from Admin if they are the logged in admin
    if (currentUserId === id && role !== 'Admin' && role !== 'Owner') {
      return res.status(400).json({ error: 'You cannot demote yourself from Admin status' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, updatedAt: true }
    });

    res.json({ success: true, user: updated, message: `Role updated to ${role}` });
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// POST /api/team/members/:id/reset-password - Admin reset password for team member
teamRouter.post('/members/:id/reset-password', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const id = req.params.id as string;

    const member = await prisma.user.findFirst({
      where: { id, workspaceId }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found in this workspace' });
    }

    const tempPassword = 'RicozPass#' + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      tempPassword,
      message: `Password reset successfully for ${member.name}. Temporary password generated.`
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Failed to reset team member password' });
  }
});

// DELETE /api/team/members/:id - Remove member (Admins/Owners only)
teamRouter.delete('/members/:id', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const id = req.params.id as string;

    // Prevent removing oneself if current user
    if ((req as any).user.id === id) {
      return res.status(400).json({ error: 'You cannot remove yourself' });
    }

    // Verify member belongs to workspace
    const member = await prisma.user.findFirst({
      where: { id, workspaceId }
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found in this workspace' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ error: 'Failed to remove team member' });
  }
});

// GET /api/team/sla - Get workspace SLA configuration
teamRouter.get('/sla', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;

    let sla = await prisma.sLAConfig.findUnique({
      where: { workspaceId }
    });

    if (!sla) {
      sla = await prisma.sLAConfig.create({
        data: {
          workspaceId,
          firstResponseTarget: 'Within 15 minutes',
          resolutionTarget: 'Within 2 hours',
          workingHours: 'Monday - Friday, 9:00 AM - 6:00 PM'
        }
      });
    }

    res.json(sla);
  } catch (error) {
    console.error('Error fetching SLA config:', error);
    res.status(500).json({ error: 'Failed to fetch SLA configuration' });
  }
});

// PUT /api/team/sla - Update SLA configuration (Admins/Owners only)
teamRouter.put('/sla', requireRole(['Owner', 'Admin']), async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { firstResponseTarget, resolutionTarget, workingHours } = req.body;

    const sla = await prisma.sLAConfig.upsert({
      where: { workspaceId },
      update: {
        firstResponseTarget,
        resolutionTarget,
        workingHours
      },
      create: {
        workspaceId,
        firstResponseTarget: firstResponseTarget || 'Within 15 minutes',
        resolutionTarget: resolutionTarget || 'Within 2 hours',
        workingHours: workingHours || 'Monday - Friday, 9:00 AM - 6:00 PM'
      }
    });

    res.json(sla);
  } catch (error) {
    console.error('Error updating SLA config:', error);
    res.status(500).json({ error: 'Failed to update SLA configuration' });
  }
});
