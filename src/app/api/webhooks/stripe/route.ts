import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  const body = (await req.json()) as Stripe.Event;

  switch (body.type) {
    case "checkout.session.completed": {
      const session = body.data.object as Stripe.Checkout.Session;
      const stripeCustomerId = session.customer;
      const user = await findUserFromStripeCustomerId(stripeCustomerId);
      if (!user?.id) break;
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: "PREMIUM",
        },
      });
      break;
    }

    case "invoice.paid": {
      const invoice = body.data.object as Stripe.Invoice;
      const stripeCustomerId = invoice.customer;
      const user = await findUserFromStripeCustomerId(stripeCustomerId);
      if (!user?.id) break;
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: "PREMIUM",
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = body.data.object as Stripe.Invoice;
      const stripeCustomerId = invoice.customer;
      const user = await findUserFromStripeCustomerId(stripeCustomerId);
      if (!user?.id) break;
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: "FREE",
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = body.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer;
      const user = await findUserFromStripeCustomerId(stripeCustomerId);
      if (!user?.id) break;
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          plan: "FREE",
        },
      });
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ ok: true }, { status: 200 })
};

const findUserFromStripeCustomerId = async (
  stripeCustomerId: unknown
) => {
  if (typeof stripeCustomerId !== "string") return null;

  return await prisma.user.findFirst({
    where: {
      stripeCustomerId,
    },
  });
};
