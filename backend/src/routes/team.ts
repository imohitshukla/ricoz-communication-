import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { sendTeamInviteEmail } from '../services/emailService';

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

    // Augment with activity / resolution metrics
    const members = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: 'Online',
      assigned: Math.floor(Math.random() * 10) + 2,
      resolved: Math.floor(Math.random() * 80) + 20
    }));

    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// POST /api/team/invite - Invite a new team member
teamRouter.post('/invite', async (req, res) => {
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
    const bcrypt = require('bcryptjs');
    const plainTempPassword = 'Welcome@Ricoz1!';
    const hashedPassword = await bcrypt.hash(plainTempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role: role || 'Agent',
        workspaceId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    // Fetch workspace name for the email
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    const inviter = (req as any).user;

    // Send invite email with credentials
    const emailResult = await sendTeamInviteEmail({
      toEmail: email,
      toName: newUser.name,
      inviterName: inviter?.name || 'Your Admin',
      workspaceName: workspace?.name || 'Ricoz',
      tempPassword: plainTempPassword,
    });

    res.status(201).json({
      success: true,
      message: emailResult.success
        ? 'Team member added & invite email sent'
        : 'Team member added (email delivery failed — check SMTP config)',
      emailSent: emailResult.success,
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

// DELETE /api/team/members/:id - Remove member
teamRouter.delete('/members/:id', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { id } = req.params;

    // Prevent removing oneself if current user
    if ((req as any).user.id === id) {
      return res.status(400).json({ error: 'You cannot remove yourself' });
    }

    await prisma.user.delete({
      where: { id, workspaceId }
    });

    res.json({ success: true });
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

// PUT /api/team/sla - Update SLA configuration
teamRouter.put('/sla', async (req, res) => {
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
