import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';

export const contactsRouter = Router();

// Apply auth to all contacts routes
contactsRouter.use(authenticate);

// GET /api/contacts - Fetch all contacts for the workspace
contactsRouter.get('/', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;

    const contacts = await prisma.contact.findMany({
      where: { workspaceId },
      include: { tags: true },
      orderBy: { updatedAt: 'desc' }
    });

    const parsedContacts = contacts.map(c => ({
      ...c,
      attributes: typeof c.attributes === 'string' ? JSON.parse(c.attributes) : c.attributes
    }));

    res.json(parsedContacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// POST /api/contacts - Create a new contact in the workspace
contactsRouter.post('/', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { phoneNumber, name, attributes } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const contact = await prisma.contact.upsert({
      where: {
        workspaceId_phoneNumber: {
          workspaceId,
          phoneNumber
        }
      },
      update: {
        name: name || undefined,
        attributes: JSON.stringify(attributes || {})
      },
      create: {
        phoneNumber,
        name,
        attributes: JSON.stringify(attributes || {}),
        workspaceId
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// PUT /api/contacts/:id - Update contact
contactsRouter.put('/:id', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { id } = req.params;
    const { name, phoneNumber, attributes } = req.body;

    const contact = await prisma.contact.update({
      where: { id, workspaceId },
      data: {
        ...(name !== undefined && { name }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(attributes !== undefined && { attributes: JSON.stringify(attributes) })
      }
    });

    res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

// DELETE /api/contacts/:id - Delete contact
contactsRouter.delete('/:id', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { id } = req.params;

    // Delete associated messages and conversations first
    const convs = await prisma.conversation.findMany({ where: { contactId: id } });
    for (const conv of convs) {
      await prisma.message.deleteMany({ where: { conversationId: conv.id } });
    }
    await prisma.conversation.deleteMany({ where: { contactId: id } });
    await prisma.contact.delete({ where: { id, workspaceId } });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

