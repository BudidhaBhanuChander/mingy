import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { safeSend } from "../inngest/index.js";
import { reserveStock, restoreStock } from "../utils/stock.js";
import Stripe from "stripe";

// Create order
// POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Check if order items are empty
    if (!items || items.length === 0) {
        return res.status(400).json({ message: "No order items" });
    }

    // Look up actual prices from the database (never trust client-sent prices)
    const productIds = items.map((i: any) => i.product);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap: Record<string, (typeof products)[0]> = {};
    products.forEach((p: any) => (productMap[p.id] = p));

    // Build order line items from trusted DB data
    let orderItems;
    try {
        orderItems = items.map((item: any) => {
            const dbProduct = productMap[item.product];
            if (!dbProduct) throw new Error(`Product ${item.product} not found`);
            const quantity = Number(item.quantity);
            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw new Error(`Invalid quantity for ${dbProduct.name}`);
            }
            return {
                product: dbProduct.id,
                name: dbProduct.name,
                image: dbProduct.image,
                price: dbProduct.price,
                quantity,
                unit: dbProduct.unit,
            };
        });
    } catch (err: any) {
        return res.status(400).json({ message: err.message || "Invalid order items" });
    }

    const subtotal = Math.round(orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0) * 100) / 100;
    const deliveryFee = subtotal > 20 ? 0 : 1.99;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;

    // Reserve stock and create the order in a single atomic transaction.
    // If any item can't be reserved (concurrent buyer took the last unit),
    // the whole transaction rolls back — no order, no partial stock change.
    let order;
    try {
        order = await prisma.$transaction(async (tx: any) => {
            await reserveStock(tx, orderItems);
            return tx.order.create({
                data: {
                    userId: req.user!.id,
                    items: orderItems,
                    shippingAddress,
                    paymentMethod,
                    subtotal,
                    deliveryFee,
                    tax,
                    total,
                    statusHistory: [{ status: "Placed", note: "Order placed successfully", timestamp: new Date() }],
                },
            });
        });
    } catch (err: any) {
        if (typeof err?.message === "string" && err.message.startsWith("OUT_OF_STOCK:")) {
            const name = err.message.split("OUT_OF_STOCK:")[1];
            return res.status(409).json({ message: `Sorry, "${name}" just went out of stock.` });
        }
        throw err;
    }

    // Notify any inventory listeners that stock changed (best-effort, non-blocking)
    for (const item of orderItems) {
        await safeSend({ name: "inventory/stock.updated", data: { productId: item.product } });
    }

    if (paymentMethod === "card") {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

        try {
            const session = await stripe.checkout.sessions.create({
                success_url: `${req.headers.origin}/orders/${order.id}?clearCart=true`,
                cancel_url: `${req.headers.origin}/checkout`,
                client_reference_id: order.id,
                line_items: [
                    {
                        price_data: {
                            currency: "usd",
                            product_data: { name: "Payment Groceries" },
                            unit_amount: Math.round(total * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                metadata: { orderId: order.id },
                payment_intent_data: {
                    metadata: { orderId: order.id },
                },
            });
            return res.json({ url: session.url });
        } catch (err) {
            // Stripe failed to start a session — undo the reservation and the order
            await restoreStock(orderItems);
            await prisma.order.delete({ where: { id: order.id } }).catch(() => {});
            throw err;
        }
    }

    res.json({ order });

    await safeSend({ name: "order/placed", data: { orderId: order.id } });
};

// Get user's orders
// GET /api/orders
export const getUserOrders = async (req: Request, res: Response) => {
    const { status } = req.query;

    const where: any = {
        userId: req.user!.id,
        NOT: [{ paymentMethod: "card", isPaid: false }],
    };

    if (status && status !== "all") {
        where.status = status;
    }

    const orders = await prisma.order.findMany({
        where,
        include: { deliveryPartner: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
    });

    res.json({ orders });
};

// Get single order
// GET /api/orders/:id
export const getOrder = async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({
        where: { id: req.params.id as string, userId: req.user!.id },
        include: { deliveryPartner: { select: { name: true, phone: true, avatar: true, vehicleType: true } } },
    });

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }
    res.json({ order });
};

// Update order status (admin)
// PUT /api/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response) => {
    const { status, note } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id as string } });

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    const history = (Array.isArray(order.statusHistory) ? order.statusHistory : []) as any[];
    history.push({ status, note: note || `Order ${status.toLowerCase()}`, timestamp: new Date() });

    const updatedOrder = await prisma.order.update({
        where: { id: req.params.id as string },
        data: { status, statusHistory: history },
    });

    // If an admin cancels a previously-active order, return its reserved stock
    if (status === "Cancelled" && order.status !== "Cancelled") {
        const items = Array.isArray(order.items) ? (order.items as any[]) : [];
        await restoreStock(items);
    }

    res.json({ order: updatedOrder });
};

// Get all orders (admin)
// GET /api/orders/all
export const getAllOrders = async (req: Request, res: Response) => {
    const orders = await prisma.order.findMany({
        where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
        include: {
            user: { select: { name: true, email: true } },
            deliveryPartner: { select: { name: true, phone: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    res.json({ orders });
};

// Get Order Location
// GET /api/orders/:id/location
export const getOrderLocation = async (req: Request, res: Response) => {
    const order = await prisma.order.findFirst({
        where: { id: req.params.id as string, userId: req.user!.id },
        select: { liveLocation: true, status: true },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ liveLocation: order.liveLocation, status: order.status });
};
