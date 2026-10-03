import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { io } from '../index';

export const commerceRouter = Router();

// ── PUBLIC PAYMENT CHECKOUT ENDPOINTS ──────────────────────────────────────
// GET /api/commerce/public/order/:orderNumber - Lookup order for customer checkout
commerceRouter.get('/public/order/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await prisma.order.findUnique({
      where: { orderNumber }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      orderNumber: order.orderNumber,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      items: order.items ? JSON.parse(order.items) : [{ name: 'Custom Order', price: order.amount, qty: 1 }],
      createdAt: order.createdAt,
      paidAt: order.paidAt
    });
  } catch (error) {
    console.error('Error fetching public order:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// POST /api/commerce/public/pay/:orderNumber - Complete payment (Card / UPI / NetBanking simulation)
commerceRouter.post('/public/pay/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { paymentMethod = 'stripe', cardLast4 = '4242' } = req.body;

    const order = await prisma.order.findUnique({
      where: { orderNumber }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'Paid') {
      return res.json({ success: true, message: 'Order is already paid', order });
    }

    const updatedOrder = await prisma.order.update({
      where: { orderNumber },
      data: {
        status: 'Paid',
        paymentMethod,
        paidAt: new Date()
      }
    });

    // If order was created from a conversation, post receipt message directly into chat!
    if (order.conversationId) {
      const receiptMessage = await prisma.message.create({
        data: {
          conversationId: order.conversationId,
          text: `✅ Payment Received: $${order.amount.toFixed(2)} for Order #${order.orderNumber}. Receipt generated.`,
          sender: 'bot',
          status: 'delivered',
          metadata: JSON.stringify({
            type: 'payment_receipt',
            orderNumber: order.orderNumber,
            amount: order.amount,
            currency: order.currency,
            paymentMethod,
            cardLast4,
            paidAt: new Date().toISOString()
          })
        }
      });

      await prisma.conversation.update({
        where: { id: order.conversationId },
        data: { updatedAt: new Date() }
      });

      io.emit('new_message', {
        id: receiptMessage.id,
        conversationId: order.conversationId,
        name: 'Ricoz Pay Gateway',
        text: receiptMessage.text,
        metadata: receiptMessage.metadata,
        time: receiptMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'whatsapp',
        sender: 'bot'
      });
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// ── AUTHENTICATED WORKSPACE ROUTES ─────────────────────────────────────────
commerceRouter.use(authenticate);

// GET /api/commerce/products - Fetch all products
commerceRouter.get('/products', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const products = await prisma.product.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/commerce/products - Create a product
commerceRouter.post('/products', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { name, price, stock = 10, status = 'Active', image = 'bg-brand-primary' } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        status,
        image,
        workspaceId
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/commerce/products/:id - Update product
commerceRouter.put('/products/:id', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { id } = req.params;
    const { name, price, stock, status, image } = req.body;

    const product = await prisma.product.update({
      where: { id, workspaceId },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(status !== undefined && { status }),
        ...(image !== undefined && { image })
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/commerce/products/:id - Delete product
commerceRouter.delete('/products/:id', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { id } = req.params;

    await prisma.product.delete({
      where: { id, workspaceId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// POST /api/commerce/payment-links - Generate in-chat payment link + order
commerceRouter.post('/payment-links', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;
    const { 
      amount, 
      productName = 'Omnichannel Service Order', 
      customerName, 
      customerPhone,
      conversationId,
      currency = 'USD'
    } = req.body;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const orderNumber = 'RCZ-' + Math.floor(100000 + Math.random() * 900000);
    const frontendUrl = process.env.FRONTEND_URL || 'https://ricoz-communication-74lg.vercel.app';
    const paymentUrl = `${frontendUrl}/pay/${orderNumber}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        amount: parseFloat(amount),
        currency,
        status: 'Pending',
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        items: JSON.stringify([{ name: productName, price: parseFloat(amount), qty: 1 }]),
        paymentUrl,
        conversationId: conversationId || null,
        workspaceId
      }
    });

    // If conversationId provided, automatically post the interactive payment request card into the chat!
    if (conversationId) {
      const cardMessage = await prisma.message.create({
        data: {
          conversationId,
          text: `💳 Payment Request: $${order.amount.toFixed(2)} for ${productName}. Tap below to complete payment: ${paymentUrl}`,
          sender: 'agent',
          status: 'sent',
          metadata: JSON.stringify({
            type: 'payment_request',
            orderNumber: order.orderNumber,
            productName,
            amount: order.amount,
            currency: order.currency,
            paymentUrl
          })
        }
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
      });

      io.emit('new_message', {
        id: cardMessage.id,
        conversationId,
        name: 'Ricoz Agent',
        text: cardMessage.text,
        metadata: cardMessage.metadata,
        time: cardMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'whatsapp',
        sender: 'agent'
      });
    }

    res.status(201).json({
      success: true,
      orderNumber: order.orderNumber,
      amount: order.amount,
      currency: order.currency,
      paymentUrl,
      order
    });
  } catch (error) {
    console.error('Error generating payment link:', error);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
});

// POST /api/commerce/checkout-link (legacy alias)
commerceRouter.post('/checkout-link', async (req, res) => {
  try {
    const { amount, productName } = req.body;
    const orderNumber = 'RCZ-' + Math.floor(100000 + Math.random() * 900000);
    const frontendUrl = process.env.FRONTEND_URL || 'https://ricoz-communication-74lg.vercel.app';
    const link = `${frontendUrl}/pay/${orderNumber}`;

    res.json({
      success: true,
      link,
      orderNumber
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate checkout link' });
  }
});

// GET /api/commerce/orders - Get orders and sales metrics (100% real DB calculated)
commerceRouter.get('/orders', async (req, res) => {
  try {
    const workspaceId = (req as any).user.workspaceId;

    const orders = await prisma.order.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' }
    });

    const totalSales = orders
      .filter(o => o.status === 'Paid')
      .reduce((sum, o) => sum + o.amount, 0);
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const recoveredCarts = orders.filter(o => o.status === 'Paid' && o.items?.includes('abandoned')).length;

    res.json({
      orders,
      metrics: {
        totalSales,
        pendingCount,
        recoveredCarts
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch commerce orders' });
  }
});
