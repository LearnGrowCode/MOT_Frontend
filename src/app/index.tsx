import React from "react";
import { Redirect } from "expo-router";
import { useProfileStore } from "@/store/useProfileStore";

export default function IndexGate() {
    const isAuthenticated = useProfileStore((s) => s.isAuthenticated);
    return <Redirect href={isAuthenticated ? "/home" : "/sign-in"} />;
}
