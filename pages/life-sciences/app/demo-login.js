import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { DEMO_SESSION_KEY, getCurrentUser } from "@/lib/life_sciences_app_lib/auth";

const DEFAULT_AFTER_LOGIN = "/life-sciences/app";

function safeReturnTo(router) {
  const q = router?.query?.returnTo;

  // Default: Overview
  if (!q) return DEFAULT_AFTER_LOGIN;

  const val = Array.isArray(q) ? q[0] : q;
  if (typeof val !== "string") return DEFAULT_AFTER_LOGIN;

  // Basic safety guards
  if (!val.startsWith("/")) return DEFAULT_AFTER_LOGIN;
  if (val.startsWith("//")) return DEFAULT_AFTER_LOGIN;
  if (val.startsWith("/life-sciences/app/demo-login")) return DEFAULT_AFTER_LOGIN;

  // If someone passes app root or any weird thing, normalize to Overview
  if (val === "/life-sciences/app") return DEFAULT_AFTER_LOGIN;

  return val;
}

export default function DemoLoginPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("Submitter");

  const [existing, setExisting] = useState(null);
  const [msg, setMsg] = useState(null);

  const returnTo = useMemo(
    () => safeReturnTo(router),
    [router.isReady, router.query?.returnTo]
  );

  useEffect(() => {
    if (!router.isReady) return;
    setMounted(true);

    // IMPORTANT: do NOT auto-redirect if a session exists.
    // Instead show a friendly panel so users can switch roles/users without clearing cache.
    try {
      const u = getCurrentUser();
      setExisting(u);
    } catch (e) {
      setExisting(null);
    }
  }, [router.isReady]);

  function clearSession() {
    if (!mounted) return;

    try {
      window.localStorage.removeItem(DEMO_SESSION_KEY);
    } catch (e) {}

    setExisting(null);
    setMsg("Session cleared. You can enter a new name and role now.");
  }

  function goToOverview() {
    if (!mounted) return;
    window.location.assign(DEFAULT_AFTER_LOGIN);
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!mounted) return;

    const name = (displayName || "").trim();
    if (!name) {
      setMsg("Please enter a display name.");
      return;
    }

    // Only allow roles you actually support in the demo
    const safeRole =
      role === "Approver" ? "Approver" :
      role === "Admin" ? "Admin" :
      "Submitter";

    const session = { displayName: name, role: safeRole, ts: Date.now() };

    try {
      window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
      const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
      if (!raw) {
        setMsg("Unable to save demo session (localStorage blocked).");
        return;
      }
    } catch (e) {
      setMsg("Unable to save demo session (localStorage blocked).");
      return;
    }

    // Refresh existing panel state (optional)
    try {
      setExisting(getCurrentUser());
    } catch (e) {}

    // Land on Overview (or safe returnTo)
    window.location.assign(returnTo || DEFAULT_AFTER_LOGIN);
  }

  return (
    <>
      <Head>
        <title>VDC Demo Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={styles.page}>
        {/* Top header (matches app pages) */}
        <header style={styles.topHeader}>
          <div style={styles.headerContainer}>
            <Link href="/" style={styles.homeLink}>Home</Link>
            <div style={styles.headerDivider}>|</div>
            <div style={styles.headerInfo}>
              <span style={styles.headerName}>William O&apos;Connell</span>
              <span style={styles.headerSep}>|</span>
              <span>Seattle, WA</span>
              <span style={styles.headerSep}>|</span>
              <span>(206) 551-5524</span>
              <span style={styles.headerSep}>|</span>
              <span>WilliamOConnellPMP@gmail.com</span>
              <span style={styles.headerSep}>|</span>
              <span>LinkedIn</span>
            </div>
          </div>
        </header>

        <div style={styles.centerWrap}>
          <div style={styles.card}>
            <h1 style={styles.h1}>VDC Demo Login</h1>

            <p style={styles.sub}>
              Demo-only login (no Cognito). Enter a name and choose a role to simulate the workflow.
            </p>

            {existing ? (
              <div style={styles.sessionPanel}>
                <div style={styles.sessionTitle}>Existing demo session detected</div>
                <div style={styles.sessionText}>
                  Signed in as <strong>{existing.displayName}</strong> ({existing.role})
                </div>

                <div style={styles.sessionBtns}>
                  <button type="button" onClick={goToOverview} style={styles.smallBtn}>
                    Go to Overview
                  </button>
                  <button type="button" onClick={clearSession} style={{ ...styles.smallBtn, ...styles.dangerBtn }}>
                    Clear session
                  </button>
                </div>
              </div>
            ) : null}

            {msg ? <div style={styles.msg}>{msg}</div> : null}

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
                <option value="Admin">Admin</option>
              </select>

              <button type="submit" style={styles.button}>
                Enter Demo
              </button>

              <button type="button" onClick={clearSession} style={styles.clearBtn}>
                Clear session (if login feels “stuck”)
              </button>
            </form>

            <div style={styles.footerNote}>
              Tip: Submissions shows only documents submitted by the current demo user.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #071023 0%, #0b1a35 100%)",
    color: "#ffffff",
  },

  // Top header (simple + consistent with app pages)
  topHeader: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "rgba(0, 0, 0, 0.35)",
    backdropFilter: "blur(8px)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.10)",
  },
  headerContainer: {
    maxWidth: 1180,
    margin: "0 auto",
    padding: "10px 18px",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  homeLink: {
    textDecoration: "none",
    fontWeight: 800,
    color: "#fff",
    opacity: 0.95,
  },
  headerDivider: {
    opacity: 0.35,
    color: "#fff",
  },
  headerInfo: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    fontSize: 14,
    color: "#fff",
    opacity: 0.95,
  },
  headerName: {
    fontWeight: 900,
  },
  headerSep: {
    opacity: 0.35,
  },

  // Center login card UNDER the header
  centerWrap: {
    minHeight: "calc(100vh - 52px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    width: "100%",
    maxWidth: 720,
    borderRadius: 18,
    padding: 28,
    background: "rgba(10, 20, 40, 0.72)",
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: "0 25px 70px rgba(0,0,0,0.45)",
    color: "#ffffff",
  },
  h1: {
    margin: 0,
    fontSize: 34,
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "-0.02em",
  },
  sub: {
    marginTop: 10,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.9)",
  },
  sessionPanel: {
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
  },
  sessionTitle: {
    fontWeight: 900,
    marginBottom: 6,
  },
  sessionText: {
    color: "rgba(255,255,255,0.92)",
  },
  sessionBtns: {
    marginTop: 12,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  smallBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.08)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },
  dangerBtn: {
    background: "rgba(185, 28, 28, 0.25)",
    border: "1px solid rgba(255, 80, 80, 0.35)",
  },
  msg: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.92)",
  },
  label: {
    display: "block",
    marginTop: 14,
    marginBottom: 6,
    color: "rgba(255,255,255,0.95)",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(6, 12, 28, 0.75)",
    color: "#ffffff",
    outline: "none",
  },
  button: {
    width: "100%",
    marginTop: 18,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "linear-gradient(90deg, #5b6cff, #8b5cf6)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  clearBtn: {
    width: "100%",
    marginTop: 10,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    fontWeight: 800,
    cursor: "pointer",
  },
  footerNote: {
    marginTop: 14,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
};
