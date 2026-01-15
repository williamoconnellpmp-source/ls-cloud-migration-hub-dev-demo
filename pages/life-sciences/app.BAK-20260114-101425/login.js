// pages/life-sciences/app/login.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Preserve optional returnTo if present
    const rt = typeof router.query.returnTo === "string" ? router.query.returnTo : "/life-sciences/app";
    router.replace(`/life-sciences/app/demo-login?returnTo=${encodeURIComponent(rt)}`);
  }, [router]);

  return null;
}
