import { NextResponse } from "next/server";

export const SERVER_ERROR = {
  "internal-server-error": {
    message: "Unknown server error, please contact the admin.",
    status: 500,
  },
  "invalid-payload": {
    message: "Invalid payload. Some required arguments are missing.",
    status: 400,
  },
  "missing-parameters": {
    message: "The request was made with missing parameters in the URI?",
    status: 400,
  },
  "invalid-collectionid": {
    message: "No collection with the provided id seem to exist",
    status: 400,
  },
  unauthorized: {
    message:
      "The user tried to access a protected resource without being owner.",
    status: 401,
  },
  unauthenticated: {
    message:
      "The user tried to access a resource that needs authentication. Please sign-in.",
    status: 401,
  },
  "invalid-patch-action": {
    message: "Invalid patch action. Please check the documentation.",
    status: 400,
  },
  "invalid-deckid": {
    message: "No collection with the provided id seem to exist",
    status: 400,
  },
};

// @ts-ignore
export type ServerErrCodes = keyof typeof SERVER_ERROR;

export function serverError(err: ServerErrCodes, details?: unknown) {
  return NextResponse.json(
    {
      error: {
        code: err,
        message: SERVER_ERROR[err].message,
        details,
      },
    },
    { status: SERVER_ERROR[err].status }
  );
}

export function serverOk(details?: unknown) {
  return NextResponse.json(
    {
      ok: true,
      details,
    },
    { status: 200 }
  );
}
