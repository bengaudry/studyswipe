import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DeckPageHeader } from "@/components/pages/deck/DeckPageHeader";
import { DeckPageBody } from "@/components/pages/deck/DeckPageBody";
import { DeckDataProvider } from "@/components/pages/deck/DeckDataProvider";
import { authCache } from "@/lib/cache";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ deckid: string }>;
}) {
  const session = await authCache();

  const deck = await prisma.deck.findUnique({
    where: { id: (await params).deckid },
  });
  if (deck === null) redirect("/");

  if (session?.user?.id === null) redirect("/");
  const user = await prisma.user.findUnique({
    where: {
      id: session?.user?.id,
    },
  });

  const hasAccessToPremiumFeatures = user?.plan === "PREMIUM";

  return (
    <DeckDataProvider initialDeckState={deck}>
      <DeckPageHeader deck={deck} />

      <DeckPageBody
        deck={deck}
        hasAccessToPremiumFeatures={hasAccessToPremiumFeatures}
      />
    </DeckDataProvider>
  );
}
