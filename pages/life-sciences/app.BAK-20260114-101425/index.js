import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { requireAuthOrRedirect, getCurrentUser, logout } from "../../../lib/life_sciences_app_lib/auth";

export default function LifeSciencesAppHome() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);

    requireAuthOrRedirect(router, "/life-sciences/app");

    const u = getCurrentUser();
    setUser(u);
  }, [router]);

  if (!mounted) return null;
  if (!user) return null;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.h1}>VDC Demo App</h1>
          <button style={styles.logout} onClick={() => logout(router)}>
            Log out
          </button>
        </div>

        <p style={styles.p}>
          Signed in as <strong>{user.displayName}</strong> ({user.role})
        </p>

        <div style={styles.actions}>
          <a href="/vdc" style={styles.primary}>
            Open VDC Demo
          </a>
          <a href="/life-sciences/evidence" style={styles.secondary}>
            Open Evidence Hub
          </a>
          <a
            href="/life-sciences/app/demo-login?returnTo=%2Flife-sciences%2Fapp"
            style={styles.secondary}
          >
            Switch user / role
          </a>
        </div>

        <p style={styles.note}>
          Demo auth uses <code>localStorage</code> key <code>vdc_demo_session</code>.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, rgba(5,10,20,1) 0%, rgba(10,20,35,1) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    color: "white",
  },
  card: {
    width: "100%",
    maxWidth: "720px",
    borderRadius: "16px",
    padding: "24px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  h1: { margin: 0, fontSize: "26px" },
  p: { marginTop: "10px", opacity: 0.9 },
  actions: {
    marginTop: "18px",
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primary: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.14)",
    color: "white",
    textDecoration: "none",
    display: "inline-block",
  },
  secondary: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "transparent",
    color: "white",
    textDecoration: "none",
    display: "inline-block",
  },
  logout: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
  note: { marginTop: "16px", fontSize: "12px", opacity: 0.75 },
};
