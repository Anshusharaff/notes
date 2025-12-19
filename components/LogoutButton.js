"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (response.ok) {
                router.push("/auth");
                router.refresh();
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return <Button onClick={handleLogout}>Logout</Button>;
}
