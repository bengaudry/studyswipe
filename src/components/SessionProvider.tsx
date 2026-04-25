'use client'

import React, { createContext, useContext } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/db/generated/prisma'

interface SessionContextType {
    user: User | null | undefined
    isLoading: boolean
    isAuthenticated: boolean
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const { session, isLoading, isAuthenticated } = useAuth()

    return (
        <SessionContext.Provider
            value={{
                user: session?.user,
                isLoading,
                isAuthenticated
            }}
        >
            {children}
        </SessionContext.Provider>
    )
}

export function useSessionContext() {
    const context = useContext(SessionContext)
    if (context === undefined) {
        throw new Error(
            'useSessionContext must be used within a SessionProvider'
        )
    }
    return context
}
