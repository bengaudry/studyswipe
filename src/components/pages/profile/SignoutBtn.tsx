'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { LogOut } from 'react-feather'

export function SignOutBtn() {
    const [loading, setLoading] = useState(false)

    const { forward } = useRouter()

    const handleSignOut = async () => {
        // TODO
        // forward("/signout");
    }

    return (
        <Button
            color="danger"
            isLoading={loading}
            startContent={loading ? null : <LogOut size={20} />}
            onPress={handleSignOut}
        >
            Sign out
        </Button>
    )
}
