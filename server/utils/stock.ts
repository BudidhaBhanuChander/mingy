import { prisma } from "../config/prisma.js";

export interface OrderLineItem {
    product: string;
    quantity: number;
    name?: string;
}

/**
 * Atomically reserve (decrement) stock for every line item inside a transaction.
 *
 * Uses a conditional `updateMany` (`stock >= quantity`) so two concurrent orders
 * can never drive stock negative — if the guard matches zero rows, the item is
 * out of stock and we throw, which rolls back the whole transaction.
 *
 * `tx` is the Prisma transaction client passed in from `prisma.$transaction`.
 */
export async function reserveStock(tx: any, items: OrderLineItem[]) {
    for (const item of items) {
        const result = await tx.product.updateMany({
            where: { id: item.product, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
            // Either the product vanished or another order took the last units.
            throw new Error(`OUT_OF_STOCK:${item.name || item.product}`);
        }
    }
}

/**
 * Give stock back to the catalogue, e.g. when a card payment fails or an order
 * is cancelled. Best-effort per item so a single missing product can't block the
 * rest of the restock.
 */
export async function restoreStock(items: OrderLineItem[]) {
    for (const item of items) {
        try {
            await prisma.product.update({
                where: { id: item.product },
                data: { stock: { increment: item.quantity } },
            });
        } catch {
            // Product may have been deleted — nothing to restore.
        }
    }
}
