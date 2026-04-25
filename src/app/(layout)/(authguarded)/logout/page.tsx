import { redirect } from 'next/navigation'
import { logout } from '@/lib/session'

export default async function LogoutPage() {
    await logout()
    redirect('/')
}
