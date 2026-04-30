'use client'
import { useRouter } from 'next/navigation'
import {
    Avatar,
    Button,
    ButtonProps,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger
} from '@/components/ui'
import { Image } from '@/components/ui'
import { LogOut, User, Zap } from 'react-feather'
import Link from 'next/link'
import { useSessionContext } from '@/components/SessionProvider'
import {DropdownSection} from "@nextui-org/react";

export function ProfileButton(props: ButtonProps) {
    const { user } = useSessionContext()
    const { push, replace } = useRouter()

    if (!user)
        return (
            <Link href={process.env.NEXT_PUBLIC_AUTH_URL ?? '/api/auth/signin'}>
                <Button
                    size="sm"
                    variant="flat"
                    startContent={<User size={20} />}
                    {...props}
                >
                    Sign in
                </Button>
            </Link>
        )

    return (
        <Dropdown>
            <DropdownTrigger>
                <Avatar
                    isBordered
                    radius="full"
                    ImgComponent={(props) => (
                        <Image
                            src={props.src}
                            width={props.width}
                            height={props.height}
                            className="cursor-pointer"
                        />
                    )}
                    src={user?.profilePictureUrl ?? undefined}
                />
            </DropdownTrigger>
            <DropdownMenu>
                <DropdownItem
                    key="username"
                    variant="flat"
                    onPress={() => push("/profile")}
                >
                    {user.displayName}
                </DropdownItem>
                <DropdownItem
                    key="subscription-link"
                    variant="flat"
                    showDivider
                    startContent={<Zap size={16} />}
                    onPress={() => push('/subscription')}
                >
                    Subscription
                </DropdownItem>
                <DropdownItem
                    key="logout"
                    variant="flat"
                    color="danger"
                    startContent={<LogOut size={16} />}
                    onPress={() => {
                        replace('/logout')
                    }}
                >
                    Sign out
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}
