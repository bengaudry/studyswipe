import 'server-only'

import {jwtVerify, SignJWT} from 'jose'
import {cookies} from "next/headers";
import {CasUser, User} from "@/db/generated/prisma";
import {redirect} from "next/navigation";
import {cache} from "react";
import prisma from "@/lib/prisma";

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
    return new SignJWT(payload)
        .setProtectedHeader({alg: 'HS256'})
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
    try {
        const {payload} = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        console.log('Failed to verify session')
    }
}

export async function createSession(user: User) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const session = await encrypt(user)
    const cookieStore = await cookies()

    cookieStore.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function deleteSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}

export async function logout() {
    await deleteSession()
    redirect("/")
}

export const verifySession = cache(async (): Promise<User | null> => {
    const cookie = (await cookies()).get('session')?.value
    const session = await decrypt(cookie)

    // TODO : real check for session type & check for expiration
    if (!session || typeof session !== 'object') {
        return null
    }

    return session as User
})

export const getUser: (() => Promise<CasUser | null>) = cache(async (): Promise<CasUser | null> => {
    const session = await verifySession()
    if (!session) {
        console.info("No session")
        return null
    }

     try {
        console.info("Retrieving session", session.id)
         return await prisma.casUser.findUnique({
             where: {id: session.id},
         })
     } catch (error) {
         console.log('Failed to fetch user')
         return null
     }
})
