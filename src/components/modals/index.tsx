import { ReactNode } from 'react'
import * as UI from '../ui'

export type ModalProps = {
    children: ReactNode | ((onClose: () => void) => ReactNode)
    title: string
    color?:
        | 'danger'
        | 'default'
        | 'primary'
        | 'secondary'
        | 'success'
        | 'warning'
    modalProps?: UI.ModalProps
    isOpen?: boolean
    cancelButtonLabel?: string
    submitButtonLabel?: string
    submitButtonProps?: Omit<UI.ButtonProps, 'children'>
    onOpenChange?: (isOpen: boolean) => void
    onClose?: () => void
    onValidate?: (onClose: () => void) => void
}

export function Modal({
    children,
    title,
    color,
    modalProps,
    isOpen,
    onOpenChange,
    onClose,
    onValidate,
    cancelButtonLabel,
    submitButtonLabel,
    submitButtonProps
}: ModalProps) {
    return (
        <UI.Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            onClose={onClose}
            placement={modalProps?.placement || 'center'}
            {...modalProps}
        >
            <UI.ModalContent>
                {(onClose) => (
                    <>
                        <UI.ModalHeader className="flex flex-col gap-1">
                            {title}
                        </UI.ModalHeader>
                        <UI.ModalBody>
                            {typeof children === 'function'
                                ? children(onClose)
                                : children}
                        </UI.ModalBody>
                        <UI.ModalFooter>
                            <UI.Button
                                size="sm"
                                color={color ?? 'primary'}
                                variant="flat"
                                onPress={onClose}
                            >
                                {cancelButtonLabel || 'Cancel'}
                            </UI.Button>
                            <UI.Button
                                size="sm"
                                color={color ?? 'primary'}
                                onPress={() => {
                                    if (onValidate) onValidate(onClose)
                                }}
                                {...submitButtonProps}
                                startContent={
                                    submitButtonProps?.isLoading !== true
                                        ? submitButtonProps?.startContent
                                        : null
                                }
                            >
                                {submitButtonLabel || 'Submit'}
                            </UI.Button>
                        </UI.ModalFooter>
                    </>
                )}
            </UI.ModalContent>
        </UI.Modal>
    )
}
