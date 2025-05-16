import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serverError, serverOk } from "@/lib/errorHandling/serverErrors";
import { MAX_COLLECTION_TITLE_LENGTH } from "@/lib/constants";

/** Creates a collection in the database */
export const POST = async (req: NextRequest) => {
  try {
    const session = await auth();
    if (session?.user?.id === undefined) return serverError("unauthenticated");

    const body = await req.json();

    if (!body || typeof body !== "object" || !body.title)
      return serverError("invalid-payload", "Missing property: <title>");

    if (typeof body.title !== "string")
      return serverError(
        "invalid-payload",
        "Property <title> must be of type string"
      );

    if (body.title.length > MAX_COLLECTION_TITLE_LENGTH)
      return serverError(
        "invalid-payload",
        `Property <title> exceeds the maximum number of characters (${body.title.length}/${MAX_COLLECTION_TITLE_LENGTH})`
      );

    await prisma.collection.create({
      data: {
        title: body.title,
        ownerId: session.user.id,
      },
    });

    return serverOk();
  } catch (err) {
    return serverError("internal-server-error", err);
  }
};

export const PATCH = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const action = params.get("action");
    const id = params.get("id");

    if (!action)
      return serverError("missing-parameters", "Parameter missing: <action>");
    if (!id)
      return serverError("missing-parameters", "Parameter missing: <id>");

    if (action === "rename") {
      const newtitle = params.get("newtitle");

      if (!newtitle)
        return serverError(
          "missing-parameters",
          "Parameter missing: <newtitle>"
        );

      if (typeof newtitle !== "string")
        return serverError(
          "invalid-payload",
          "Property <newtitle> must be of type string"
        );

      if (newtitle.length > MAX_COLLECTION_TITLE_LENGTH)
        return serverError(
          "invalid-payload",
          `Property <newtitle> exceeds the maximum number of characters (${newtitle.length}/${MAX_COLLECTION_TITLE_LENGTH})`
        );

      await prisma.collection.update({
        where: { id },
        data: { title: newtitle, updatedAt: new Date() },
      });

      return serverOk();
    }

    return serverError("invalid-patch-action");
  } catch (err) {
    return serverError("internal-server-error", err);
  }
};

export const DELETE = async (req: NextRequest) => {
  const params = req.nextUrl.searchParams;
  try {
    const id = params.get("id");
    if (!id)
      return serverError("missing-parameters", "Parameter missing: <id>");

    const collection = await prisma.collection.findUnique({ where: { id } });

    const session = await auth();
    if (session?.user?.id !== collection?.ownerId)
      return serverError("unauthorized");

    await prisma.collection.delete({ where: { id } });

    return serverOk();
  } catch (err) {
    return serverError("internal-server-error", err);
  }
};
