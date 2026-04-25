import {NextRequest, NextResponse} from "next/server";
import {verifySession} from "@/lib/session";

export const GET = async (req: NextRequest) => {
    try {
        const sessionCookie = req.cookies.get("session");
        if (!sessionCookie) {
            console.warn("Session cookie not found")
            return NextResponse.json({session: null}, {
                status: 200,
            });
        }

        const session = await verifySession()
        if (!session) {
            return NextResponse.json({session: null}, {status: 200});
        }

        return NextResponse.json({session}, {status: 200});
    } catch (err) {
        console.error("Could not fetch session");
        console.error(err);
        return NextResponse.json({session: null}, {status: 404});
    }
}
