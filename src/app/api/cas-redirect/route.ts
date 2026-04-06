import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma"
import axios from "axios";

export const GET = async (req: NextRequest, res: NextResponse) => {
    const params = req.nextUrl.searchParams;

    const serviceTicket = params.get("st")
    if (!serviceTicket) {
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const response = await axios.get(`https://cas.bengaudry.dev/api/v1/validate-ticket?st=${serviceTicket}&serviceId=studyswipe}`)
    if (response.status !== 200) {
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    const { valid, user } = response.data;
    if (!valid) {
        return NextResponse.json({ error: "Invalid ticket" }, { status: 400 });
    }

    const localUser = await prisma.user.findUnique({
        where: { email: user.email },
    })
    if (!localUser) {
        await prisma.casUser.create({
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                surname: user.surname,
                displayName: user.displayName,
                profilePictureUrl: user.profilePictureUrl,
                isEmailVerified: user.isEmailVerified,
                casCreatedAt: user.createdAt,
                plan: user.role === "ADMIN" ? "PREMIUM" : "FREE"
            },
        })
    }

    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/cas/callback?st=${serviceTicket}`;
    return NextResponse.redirect(redirectUrl);
}