"use client";
import { Button } from "@nextui-org/button";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut } from "react-feather";

export function SignOutBtn() {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      color="danger"
      isLoading={loading}
      startContent={loading ? null : <LogOut size={20} />}
      onPress={handleSignOut}
    >
      Sign out
    </Button>
  );
}
