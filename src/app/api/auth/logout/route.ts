import { NextRequest } from 'next/server'
import { logout } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest) {
    await logout()
    redirect(process.env.NEXT_PUBLIC_APP_URL as string)
}
