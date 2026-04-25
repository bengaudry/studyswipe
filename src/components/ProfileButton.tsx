"use client";
import {useRouter} from "next/navigation";
import {
    Avatar,
    Button,
    ButtonProps,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@/components/ui";
import {Image} from "@/components/ui";
import {LogOut, User, Zap} from "react-feather";
import Link from "next/link";
import {useAuth} from "@/hooks/useAuth";

export function ProfileButton(props: ButtonProps) {
    const {session} = useAuth()
    const {push, replace} = useRouter();

    if (session === null)
        return (
            <Link href={process.env.NEXT_PUBLIC_AUTH_URL ?? "/api/auth/signin"}>
                <Button
                    size="sm"
                    variant="flat"
                    startContent={<User size={20}/>}
                    {...props}
                >
                    Sign in
                </Button>
            </Link>
        );

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
                    src={session?.user?.profilePictureUrl ?? undefined}
                />
            </DropdownTrigger>
            <DropdownMenu>
                <DropdownItem
                    key="subscription-link"
                    variant="flat"
                    showDivider
                    startContent={<Zap size={16}/>}
                    onPress={() => push("/subscription")}
                >
                    Subscription
                </DropdownItem>
                <DropdownItem
                    key="logout"
                    variant="flat"
                    color="danger"
                    startContent={<LogOut size={16}/>}
                    onPress={() => {
                        replace("/logout")
                    }}
                >
                    Sign out
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
}
