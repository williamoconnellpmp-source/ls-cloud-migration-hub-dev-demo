// pages/life-sciences/app/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { getCurrentUser, buildLoginUrl } from "../../../lib/life_sciences_app_lib/auth";

export default function AppIndex() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const user = getCurrentUser();

    // Not logged in => go to demo-login
    if (!user) {
      const returnTo = "/life-sciences/app";
      window.location.href = buildLoginUrl(returnTo);
      return;
    }

    // Logged in => route by role
    const role = (user.role || "").toLowerCase();

    // Pick your “home” pages here
    const dest =
      role === "approver"
        ? "/life-sciences/app/approvals"
        : "/life-sciences/app/upload";

    router.replace(dest);
  }, [router.isReady]); // IMPORTANT: not [router]

  return <div style={{ padding: 16 }}>Loading...</div>;
}
