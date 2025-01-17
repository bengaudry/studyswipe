import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { serverError, serverOk } from "@/lib/errorHandling/serverErrors";
import { auth } from "@/lib/auth";

/** Creates a collection in the database */
export const POST = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const deckid = params.get("deckid");
    if (!deckid)
      return serverError("missing-parameters", "Parameter missing: <deckid>");

    const body = await req.json();

    if (!body || typeof body !== "object" || !body.question || !body.answer)
      return serverError(
        "invalid-payload",
        "Missing properties: <question> <answer>"
      );

    const deck = await prisma.deck.findUnique({ where: { id: deckid } });
    if (!deck) return serverError("invalid-deckid");

    const session = await auth();
    if (session?.user?.id !== deck.ownerId) return serverError("unauthorized");

    const cards = deck.cards as FlashCard[];
    cards.push({ question: body.question, answer: body.answer });

    await prisma.deck.update({
      where: { id: deckid },
      data: { ...deck, cards, updatedAt: new Date() },
    });

    return serverOk();
  } catch (err) {
    return serverError("internal-server-error", err);
  }
};

export const PATCH = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const deckid = params.get("deckid");
    if (!deckid)
      return serverError("missing-parameters", "Parameter missing: <deckid>");

    const cardindex = params.get("cardindex");
    if (!cardindex)
      return serverError(
        "missing-parameters",
        "Parameter missing: <cardindex>"
      );

    const body = await req.json();
    if (!body || typeof body !== "object" || !body.question || !body.answer)
      return serverError(
        "invalid-payload",
        "Properties missing: <question> <answer>"
      );

    const deck = await prisma.deck.findUnique({ where: { id: deckid } });
    if (!deck) return serverError("invalid-deckid");

    const session = await auth();
    if (session?.user?.id !== deck.ownerId) return serverError("unauthorized");

    const newCards: FlashCard[] = (deck.cards as FlashCard[]).map(
      (card, idx) => {
        if (idx === parseInt(cardindex)) {
          return { question: body.question, answer: body.answer };
        }
        return card;
      }
    );

    await prisma.deck.update({
      where: { id: deck.id },
      data: { ...deck, cards: newCards, updatedAt: new Date() },
    });

    return serverOk();
  } catch (err) {
    return serverError("internal-server-error", err);
  }
};

export const DELETE = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const deckid = params.get("deckid");
    if (!deckid)
      return serverError("missing-parameters", "Parameter missing: <deckid>");

    const cardindex = params.get("cardindex");
    if (!cardindex)
      return serverError(
        "missing-parameters",
        "Parameter missing: <cardindex>"
      );

    const deck = await prisma.deck.findUnique({ where: { id: deckid } });
    if (!deck) return serverError("invalid-deckid");

    const session = await auth();
    if (session?.user?.id !== deck.ownerId) return serverError("unauthorized");

    const newCards = deck.cards as FlashCard[];
    newCards.splice(parseInt(cardindex), 1);

    await prisma.deck.update({
      where: { id: deck.id },
      data: { ...deck, cards: newCards, updatedAt: new Date() },
    });

    return serverOk();
  } catch (err) {
    return serverError("internal-server-error", err);
  }
};
