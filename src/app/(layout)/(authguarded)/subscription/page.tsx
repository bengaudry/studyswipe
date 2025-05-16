import { Button } from "@/components/ui";
import { auth } from "@/lib/auth";
import { authCache } from "@/lib/cache";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { Zap } from "react-feather";

export default function PremiumPage() {
  return (
    <>
      <form>
        <Button
          type="submit"
          color="primary"
          startContent={<Zap />}
          formAction={async () => {
            "use server";
            console.info("ici")
            const session = await authCache();
            const user = await prisma.user.findUnique({
              where: { id: session?.user?.id },
              select: { stripeCustomerId: true },
            });
            if (!user) {
              console.error("User not logged in");
              return;
            }

            const stripeCustomerId = user.stripeCustomerId ?? undefined;
            const stripeSession = await stripe.checkout.sessions.create({
              customer: stripeCustomerId,
              mode: "subscription",
              payment_method_types: ["card", "link"],
              line_items: [
                {
                  price:
                    process.env.NODE_ENV === "development"
                      ? "price_1RP5idQ6RlBHGHPYTTeUVAik"
                      : "price_1RP5idQ6RlBHGHPYTTeUVAik",
                  quantity: 1,
                },
              ],
              success_url: "http://localhost:3000/",
              cancel_url: "http://localhost:3000/?stripe_output=cancel",
            });
            redirect(stripeSession?.url ?? "/");
          }}
        >
          Upgrade to Premium Plan
        </Button>
      </form>
    </>
  );
}
