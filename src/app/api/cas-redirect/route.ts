import {NextRequest, NextResponse} from "next/server";
import prisma from "@/lib/prisma"
import axios, { type AxiosResponse } from "axios";
import {redirect} from "next/navigation";
import {createSession} from "@/lib/session";

export const GET = async (req: NextRequest) => {
    const params = req.nextUrl.searchParams;

    const serviceTicket = params.get("st")
    if (!serviceTicket) {
        return NextResponse.json({error: "Bad request"}, {status: 400});
    }

    let response: AxiosResponse<any, any>;
    try {
        /* response = await axios.get(process.env.NODE_ENV === "development"
            ? `http://localhost:8000/api/v1/validate-ticket?st=${serviceTicket}&serviceId=studyswipe}`
            : `https://cas.bengaudry.dev/api/v1/validate-ticket?st=${serviceTicket}&serviceId=studyswipe}`) */
        response = await axios.get(`https://cas.bengaudry.dev/api/v1/validate-ticket?st=${serviceTicket}&serviceId=studyswipe}`)
    } catch (err) {
        return NextResponse.json({msg: "Could not connect with cas ticket service", error: err}, {status: 500});
    }
    if (response.status !== 200) {
        return NextResponse.json({error: "Bad request"}, {status: 400});
    }

    const {valid, user} = response.data;
    if (!valid) {
        return NextResponse.json({error: "Invalid ticket"}, {status: 400});
    }

    try {
        const localUser = await prisma.user.findUnique({
            where: {email: user.email},
        })
        if (!localUser) {
            try {
                await prisma.user.create({
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
            } catch (err) {
                console.error("Could not create user after cas redirection")
                console.error(err)
                redirect("/?err=create-user-failed")
            }
        }

        if (!process.env.NEXT_PUBLIC_APP_URL) {
            console.error("NEXT_PUBLIC_APP_URL is not defined")
            redirect("/?err=internal-server-error")
        }

        await createSession(user)

        return NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL + "/profile")
    } catch (err) {
        console.error("Error while fetching user after cas redirection")
        console.error(err)
        redirect("/?err=fetch-user-failed")
    } finally {
        redirect("/")
    }

}
