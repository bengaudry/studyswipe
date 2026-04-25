import { v4 as uuidv4 } from "uuid";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { serverError, serverOk } from "@/lib/errorHandling/serverErrors";
import {getUser} from "@/lib/session";

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

    const user = await getUser();
    if (!user || user.id !== deck.ownerId) return serverError("unauthorized");

    const cards = deck.cards as FlashCard[];
    const id = uuidv4();
    cards.push({ id, question: body.question, answer: body.answer });

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

    const cardid = params.get("cardid");
    if (!cardid)
      return serverError("missing-parameters", "Parameter missing: <cardid>");

    const body = await req.json();
    if (!body || typeof body !== "object" || !body.question || !body.answer)
      return serverError(
        "invalid-payload",
        "Properties missing: <question> <answer>"
      );

    const deck = await prisma.deck.findUnique({ where: { id: deckid } });
    if (!deck) return serverError("invalid-deckid");

    const user = await getUser();
    if (!user || user.id !== deck.ownerId) return serverError("unauthorized");

    const newCards: FlashCard[] = (deck.cards as FlashCard[]).map((card) => {
      if (card.id === cardid) {
        return { id: cardid, question: body.question, answer: body.answer };
      }
      return card;
    });

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

    const body = await req.json();
    if (!body || typeof body !== "object" || !body.cardIds)
      return serverError("invalid-payload", "Properties missing: <cardIds>");

    const cardIds = body.cardIds;
    if (
      !Array.isArray(cardIds) ||
      !cardIds.every((val) => typeof val === "string")
    )
      return serverError(
        "invalid-payload",
        "<cardIds> must be an array of string"
      );

    const deck = await prisma.deck.findUnique({ where: { id: deckid } });
    if (!deck) return serverError("invalid-deckid");

    const user = await getUser();
    if (!user || user.id !== deck.ownerId) return serverError("unauthorized");

    const newCards = (deck.cards as FlashCard[]).filter(
      (card) => !cardIds.includes(card.id)
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
