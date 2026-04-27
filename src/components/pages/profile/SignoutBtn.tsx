'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { LogOut } from 'react-feather'

export function SignOutBtn() {
    const { push } = useRouter()

    const handleSignOut = async () => {
        push('/logout')
    }

    return (
        <Button
            color="danger"
            startContent={<LogOut size={20} />}
            onPress={handleSignOut}
        >
            Sign out
        </Button>
    )
}
