import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const SESSION_KEY = "vdc_demo_session";

function safeGetReturnTo(router) {
  const q = router?.query?.returnTo;
  if (!q) return null;
  const val = Array.isArray(q) ? q[0] : q;
  if (typeof val !== "string") return null;

  // Only allow internal paths for safety
  if (!val.startsWith("/")) return null;
  if (val.startsWith("//")) return null;
  return val;
}

export default function DemoLoginPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("Submitter");
  const [mounted, setMounted] = useState(false);

  const returnTo = useMemo(() => safeGetReturnTo(router), [router]);

  useEffect(() => {
    setMounted(true);
    // If already logged in, go straight to demo (don’t force them to type again)
    try {
      if (typeof window === "undefined") return;
      const existing = window.localStorage.getItem(SESSION_KEY);
      if (existing) {
        const dest = returnTo || "/vdc-demo";
        router.replace(dest);
      }
    } catch (e) {}
  }, [router, returnTo]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!mounted) return;

    const name = (displayName || "").trim();
    if (!name) return;

    const session = {
      displayName: name,
      role,
      ts: Date.now(),
    };

    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (e) {}

    const dest = returnTo || "/vdc-demo";
    router.push(dest);
  }

  return (
    <>
      <Head>
        <title>VDC Demo Login</title>
      </Head>

      <div style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.h1}>VDC Demo Login</h1>
          <p style={styles.sub}>
            This is a demo-only login (no Cognito). Choose a role to simulate Submitter/Approver/Admin behavior.
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
            <select style={styles.input} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Submitter">Submitter</option>
              <option value="Approver">Approver</option>
              <option value="Admin">Admin</option>
            </select>

            <button type="submit" style={styles.button}>
              Enter Demo
            </button>

            <div style={styles.meta}>
              Session key: <code>{SESSION_KEY}</code> (stored in localStorage)
            </div>
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
    background: "linear-gradient(180deg, rgba(5,10,20,1) 0%, rgba(10,20,35,1) 100%)",
    color: "white",
  },
  card: {
    width: "100%",
    maxWidth: 560,
    borderRadius: 16,
    padding: 24,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },
  h1: { margin: 0, fontSize: 28 },
  sub: { marginTop: 10, opacity: 0.8, lineHeight: 1.5 },
  label: { display: "block", marginTop: 12, marginBottom: 6, opacity: 0.9 },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(15,23,42,0.35)",
    color: "white",
    outline: "none",
  },
  button: {
    width: "100%",
    marginTop: 16,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.14)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
  },
  meta: { marginTop: 12, fontSize: 12, opacity: 0.75 },
};
