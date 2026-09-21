import { Router } from 'express';
import { prisma } from '../db';

export const contactsRouter = Router();

// GET /api/contacts - Fetch all contacts for a workspace
contactsRouter.get('/', async (req, res) => {
  try {
    // For now, hardcode the first workspace since auth isn't fully implemented
    const workspace = await prisma.workspace.findFirst();
    
    if (!workspace) {
      return res.status(404).json({ error: 'No workspace found. Please run seed script.' });
    }

    const contacts = await prisma.contact.findMany({
      where: { workspaceId: workspace.id },
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

// POST /api/contacts - Create a new contact
contactsRouter.post('/', async (req, res) => {
  try {
    const { phoneNumber, name, attributes } = req.body;
    
    // For now, hardcode the first workspace
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: { name: 'Default Workspace' }
      });
    }

    const contact = await prisma.contact.create({
      data: {
        phoneNumber,
        name,
        attributes: JSON.stringify(attributes || {}),
        workspaceId: workspace.id
      }
    });

    res.status(201).json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});
