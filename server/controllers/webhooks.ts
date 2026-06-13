import { Request, Response } from "express";
import Stripe from "stripe";
import { prisma } from "../config/prisma.js";
import { safeSend } from "../inngest/index.js";
import { restoreStock } from "../utils/stock.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const getOrderIdFromPaymentIntent = async (paymentIntent: Stripe.PaymentIntent) => {
    const metadataOrderId = paymentIntent.metadata?.orderId;
    if (metadataOrderId) {
        return metadataOrderId;
    }

    const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent.id,
        limit: 1,
    });

    return sessions.data[0]?.metadata?.orderId;
};

export const stripeWebhook = async (request: Request, response: Response) => {
    let event;
    if (endpointSecret) {
        const signature = request.headers["stripe-signature"];
        try {
            event = stripe.webhooks.constructEvent(request.body, signature as string, endpointSecret);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.log("Webhook signature verification failed.", message);
            return response.sendStatus(400);
        }

        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const orderId = session.metadata?.orderId || session.client_reference_id;

                if (!orderId) {
                    console.log("Checkout session completed without an order id.");
                    break;
                }

                const paidOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: { isPaid: true },
                });

                if (paidOrder) {
                    await safeSend({ name: "order/placed", data: { orderId } });
                }
                break;
            }

            case "payment_intent.created":
            case "charge.succeeded":
            case "charge.updated":
                break;

            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const orderId = await getOrderIdFromPaymentIntent(paymentIntent);

                if (!orderId) {
                    console.log(`Payment intent ${paymentIntent.id} succeeded but no order id was found.`);
                    break;
                }

                // Stock was already reserved when the order was placed, so we only
                // need to mark it paid here — no second decrement.
                const paidOrder = await prisma.order.update({
                    where: { id: orderId },
                    data: { isPaid: true },
                });

                if (paidOrder) {
                    await safeSend({ name: "order/placed", data: { orderId } });
                }
                break;
            }

            case "payment_intent.canceled":
            case "payment_intent.payment_failed": {
                const paymentIntentFailure = event.data.object as Stripe.PaymentIntent;
                const failureOrderId = await getOrderIdFromPaymentIntent(paymentIntentFailure);

                if (!failureOrderId) {
                    console.log(`Payment intent ${paymentIntentFailure.id} failed but no order id was found.`);
                    break;
                }

                // Give the reserved stock back before discarding the unpaid order
                const failedOrder = await prisma.order.findUnique({ where: { id: failureOrderId } });
                if (failedOrder) {
                    const failedItems = Array.isArray(failedOrder.items) ? (failedOrder.items as any[]) : [];
                    await restoreStock(failedItems);
                    await prisma.order.delete({ where: { id: failureOrderId } });
                }
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        response.json({ received: true });
    }
};
