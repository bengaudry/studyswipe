import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

/** Creates a collection in the database */
export const POST = auth(async (req) => {
  try {
    if (req.auth?.user?.id === undefined) {
      return NextResponse.json(
        { error: { message: "Not authenticated (no id found)" } },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body || typeof body !== "object" || !body.title) {
      return NextResponse.json(
        {
          error: {
            message: "Invalid payload. Title is required.",
          },
        },
        { status: 400 }
      );
    }

    await prisma.collection.create({
      data: {
        title: body.title,
        ownerId: req.auth.user.id,
      },
    });

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Error while adding category :\n", err);
    return NextResponse.json(
      { error: { message: "failed-adding-to-db" } },
      { status: 501 }
    );
  }
});

export const PATCH = auth(async (req) => {
  const params = req.nextUrl.searchParams;
  try {
    const action = params.get("action");
    const id = params.get("id");

    if (!action || !id) {
      return NextResponse.json(
        { error: { message: "Properties action, id are needed" } },
        { status: 400 }
      );
    }

    if (action === "rename") {
      const newtitle = params.get("newtitle");

      if (!newtitle) {
        return NextResponse.json(
          { error: { message: "Property newtitle needed" } },
          { status: 400 }
        );
      }

      await prisma.collection.update({
        where: { id },
        data: { title: newtitle },
      });
    }

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Error while deleting category :\n", err);
    return NextResponse.json(
      { error: { message: "failed-adding-to-db" } },
      { status: 501 }
    );
  }
});

export const DELETE = auth(async (req) => {
  const params = req.nextUrl.searchParams;
  try {
    const id = params.get("id");

    if (!id) {
      return NextResponse.json(
        { error: { message: "missing-parameters" } },
        { status: 400 }
      );
    }

    await prisma.collection.delete({ where: { id } });

    return NextResponse.json(null, { status: 200 });
  } catch (err) {
    console.error("Error while deleting category :\n", err);
    return NextResponse.json(
      { error: { message: "failed-adding-to-db" } },
      { status: 501 }
    );
  }
});
