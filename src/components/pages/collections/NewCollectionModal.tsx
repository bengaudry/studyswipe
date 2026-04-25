'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Collection } from '@/db/generated/prisma'
import { MAX_COLLECTION_TITLE_LENGTH } from '@/lib/constants'
import { Button, ButtonProps, Input, useDisclosure } from '@/components/ui'
import { Modal } from '@/components/modals'
import { Plus } from 'react-feather'

export type PartialCollection = Omit<
    Collection,
    'id' | 'createdAt' | 'updatedAt' | 'ownerId'
>

export function NewCollectionModalTrigger({ color, ...props }: ButtonProps) {
    return (
        <Button
            color={color ?? 'primary'}
            size="sm"
            startContent={<Plus />}
            {...props}
        >
            New collection
        </Button>
    )
}

export function NewCollectionModal() {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
    const [loadingCreation, setLoadingCreation] = useState(false)
    const { refresh } = useRouter()

    const [data, setData] = useState<PartialCollection>({
        title: ''
    })

    const handleSubmit = async () => {
        setLoadingCreation(true)

        try {
            const response = await fetch('/api/collection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                throw new Error('Failed to add collection')
            }
        } finally {
            onClose()
            setLoadingCreation(false)
            refresh()
        }
    }

    return (
        <>
            <NewCollectionModalTrigger onPress={onOpen} />
            <Modal
                title="Create a new collection"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                onValidate={handleSubmit}
                submitButtonLabel="Create collection"
                submitButtonProps={{
                    isLoading: loadingCreation
                }}
            >
                <Input
                    label="Name"
                    labelPlacement="outside"
                    autoFocus
                    required
                    isRequired
                    maxLength={MAX_COLLECTION_TITLE_LENGTH}
                    value={data.title}
                    onChange={(e) =>
                        setData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Physics, Philosophy, Computer Science..."
                />
            </Modal>
        </>
    )
}
