import {useEffect, useState} from "react";
import axios from "axios";
import {User} from "@/db/generated/prisma";

export function useAuth() {
    const [user, setUser] = useState<User | undefined | null>(undefined);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                console.log("fetching session");
                const {data} = await axios.get("/api/auth");
                setUser(data && "session" in data && data.session ? data.session as User : null);
            } catch (_) {
                setUser(null)
            }
        }

        void fetchSession()
    }, [])

    return {session: { user }, isLoading: user === undefined, isAuthenticated: !!user}
}
