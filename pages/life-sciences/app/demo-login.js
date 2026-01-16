import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { DEMO_SESSION_KEY, getCurrentUser } from "@/lib/life_sciences_app_lib/auth";

function safeReturnTo(router) {
  const q = router?.query?.returnTo;
  if (!q) return "/life-sciences/app";
  const val = Array.isArray(q) ? q[0] : q;
  if (typeof val !== "string") return "/life-sciences/app";
  if (!val.startsWith("/")) return "/life-sciences/app";
  if (val.startsWith("//")) return "/life-sciences/app";
  if (val.startsWith("/life-sciences/app/demo-login")) return "/life-sciences/app";
  return val;
}

export default function DemoLoginPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("Submitter");
  const [mounted, setMounted] = useState(false);

  const returnTo = useMemo(
    () => safeReturnTo(router),
    [router.isReady, router.query?.returnTo]
  );

  useEffect(() => {
    if (!router.isReady) return;
    setMounted(true);

    try {
      if (typeof window === "undefined") return;
      const u = getCurrentUser();
      if (u) {
        window.location.assign(returnTo);
      }
    } catch {}
  }, [router.isReady, returnTo]);

  function onSubmit(e) {
    e.preventDefault();
    if (!mounted) return;

    const name = (displayName || "").trim();
    if (!name) return;

    const safeRole = role === "Approver" ? "Approver" : "Submitter";
    const session = { displayName: name, role: safeRole, ts: Date.now() };

    try {
      window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
      const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
      if (!raw) return;
    } catch {
      return;
    }

    window.location.assign(returnTo);
  }

  return (
    <>
      <Head>
        <title>VDC Demo Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.h1}>VDC Demo Login</h1>

          <p style={styles.sub}>
            Demo-only login (no Cognito). Enter any name and choose a role to
            simulate the workflow.
          </p>

          <form onSubmit={onSubmit}>
            <label style={styles.label}>Display name</label>
            <input
              style={styles.input}
              placeholder="e.g., William O’Connell"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <label style={{ ...styles.label, marginTop: 14 }}>Role</label>
            <select
              style={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Submitter">Submitter</option>
              <option value="Approver">Approver</option>
            </select>

            <button type="submit" style={styles.button}>
              Enter Demo
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "linear-gradient(180deg, #0b1220 0%, #16243f 100%)",
    color: "#ffffff",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    borderRadius: 18,
    padding: 28,
    background: "rgba(20,30,55,0.65)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
    color: "#ffffff",
  },
  h1: {
    margin: 0,
    fontSize: 30,
    color: "#ffffff",
  },
  sub: {
    marginTop: 10,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.9)",
  },
  label: {
    display: "block",
    marginTop: 12,
    marginBottom: 6,
    color: "rgba(255,255,255,0.95)",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(10,18,35,0.9)",
    color: "#ffffff",
    outline: "none",
  },
  button: {
    width: "100%",
    marginTop: 18,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
  },
};
