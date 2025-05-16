import { Button } from "@/components/ui";
import { auth } from "@/lib/auth";
import { authCache } from "@/lib/cache";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { Check } from "react-feather";

const UpgradeToPremiumBtn = ({
  isAlreadyPremium,
}: {
  isAlreadyPremium: boolean;
}) => {
  const handleUpgrade = async () => {
    "use server";
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
  };

  return (
    <form>
      <Button
        type="submit"
        color="primary"
        formAction={handleUpgrade}
        isDisabled={isAlreadyPremium}
      >
        {isAlreadyPremium ? "Your current plan" : "Upgrade to Premium"}
      </Button>
    </form>
  );
};

export default async function PremiumPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
  });
  if (!user) return null;

  const userPlan = user.plan;

  const freeFeatures = [
    "Manual card creation",
    "Group decks in collections",
    "Unlimited cards",
  ];

  const premiumFeatures = [
    "Including all free features",
    "Upload images",
    "No collections limit",
    "Unlimited AI card generation",
    "Document based generation",
  ];

  return (
    <div className="max-w-screen-md mx-auto pt-8">
      <h1 className="text-4xl text-center font-bold mb-12 gap-2">
        Manage your plan
      </h1>
      <div className="flex flex-col-reverse md:flex-row gap-6">
        
        <div className="flex-1 border-1 p-2 rounded-[3rem]">
          <div className="relative h-full flex flex-col justify-between overflow-hidden rounded-[2.25rem] p-3">
            <div className="px-8 py-16">
              <h2 className="text-3xl font-semibold mb-4">Free</h2>
              <ul>
                {freeFeatures.map((ft) => (
                  <li className="flex flex-row gap-2">
                    <Check color="#888888" />
                    <span>{ft}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-20 border-1 bg-gradient-to-br from-white dark:from-neutral-900 to-neutral-100 dark:to-neutral-900/10 rounded-[1.5rem] px-8 py-8 shadow-md">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-3xl font-semibold">0€</span>
                <span className="text-medium font-medium text-neutral-400">
                  / month
                </span>
              </div>
              <Button color="default" isDisabled={userPlan === "FREE"}>
                {userPlan === "FREE" ? "Your current plan" : "Switch to free"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 border-1 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-[3rem]">
          <div className="relative flex flex-col justify-between overflow-hidden rounded-[2.25rem] light:bg-gradient-to-br from-white to-neutral-100/70  dark:bg-neutral-900 shadow-xl p-3">
            <div className="px-8 py-16">
              <h2 className="text-3xl font-semibold mb-4">Premium</h2>
              <ul>
                {premiumFeatures.map((ft) => (
                  <li className="flex flex-row gap-2">
                    <Check color="#00cf12" />
                    <span>{ft}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-20 border-1 bg-gradient-to-br from-white dark:from-neutral-800 to-neutral-100 dark:to-neutral-900 rounded-[1.5rem] px-8 py-8 shadow-md">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-3xl font-semibold">2.99€</span>
                <span className="text-medium font-medium text-neutral-400">
                  / month
                </span>
              </div>
              <UpgradeToPremiumBtn isAlreadyPremium={userPlan === "PREMIUM"} />
            </div>

            <div className="z-0 grid grid-cols-2 grid-rows-2 absolute bottom-0 right-0 rounded-full h-1/2 blur-2xl aspect-square bg-gradient-to-tr opacity-50">
              <div className="bg-blue-500"></div>
              <div className="bg-purple-500"></div>
              <div className="bg-orange-500"></div>
              <div className="bg-yellow-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
