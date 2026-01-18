import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { requireAuthOrRedirect, getCurrentUser, logout } from "../lib/life_sciences_app_lib/auth";

export default function VdcDemoAppPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setMounted(true);
    // If not logged in, go to demo-login and come back here
    requireAuthOrRedirect(router, "/vdc-demo");
    setUser(getCurrentUser());
  }, [router]);

  if (!mounted) return null;
  if (!user) return null;

  const isSubmitter = user.role === "Submitter";
  const isApprover = user.role === "Approver";
  const isAdmin = user.role === "Admin";

  return (
    <>
      <Head>
        <title>VDC Demo App</title>
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true" />
        <main className="main">
          <div className="container">
            <div className="topBar">
              <div className="crumbs">
                <Link href="/" className="link">Home</Link>
                <span className="sep">|</span>
                <Link href="/vdc" className="link">VDC Overview</Link>
                <span className="sep">|</span>
                <span className="here">VDC Demo</span>
              </div>

              <div className="userBox">
                <div className="userLine">
                  Signed in as <strong>{user.displayName}</strong> ({user.role})
                </div>
                <div className="actions">
                  <Link href="/life-sciences/app/demo-login?returnTo=%2Fvdc-demo" className="ghost">
                    Switch user
                  </Link>
                  <button className="ghost" onClick={() => logout(router)}>
                    Log out
                  </button>
                </div>
              </div>
            </div>

            <section className="panel">
              <h1 className="h1">Validated Document Control — Demo</h1>
              <p className="sub">
                Demo auth uses localStorage (Submitter/Approver/Admin). This page is the “working demo surface” for interviews.
              </p>

              <div className="grid">
                <div className="card">
                  <h2>Overview</h2>
                  <ul>
                    <li>Role-based actions (Submitter or Approver)</li>
                    <li>Audit trail intent (who/what/when)</li>
                    <li>Document lifecycle: draft → submitted → approved/rejected</li>
                  </ul>
                </div>

                <div className="card">
                  <h2>Upload</h2>
                  {isSubmitter ? (
                    <>
                      <p>You are a <strong>Submitter</strong>. You can upload and submit documents.</p>
                      <div className="uploadBox">
                        <p style={{ marginTop: 0 }}>
                          Upload UI placeholder (we will wire this to your existing Lambda presign/upload flow next).
                        </p>
                        <button className="primary" type="button" onClick={() => alert("Next step: wire to Lambda presign + submit API")}>
                          Upload a document
                        </button>
                      </div>
                    </>
                  ) : (
                    <p>
                      Upload is disabled for <strong>{user.role}</strong>. Switch to <strong>Submitter</strong> to upload.
                    </p>
                  )}
                </div>

                <div className="card">
                  <h2>Approvals</h2>
                  {(isApprover || isAdmin) ? (
                    <>
                      <p>You are an <strong>{user.role}</strong>. You can review and approve/reject submissions.</p>
                      <button className="primary" type="button" onClick={() => alert("Next step: wire to Lambda approvals list + decision API")}>
                        View pending approvals
                      </button>
                    </>
                  ) : (
                    <p>
                      Approvals are disabled for <strong>Submitter</strong>. Switch to <strong>Approver</strong> or <strong>Admin</strong>.
                    </p>
                  )}
                </div>
              </div>
            </section>

            <footer className="footer">
              <Link href="/vdc" className="link">← Back to VDC overview</Link>
            </footer>
          </div>
        </main>

        <style jsx>{`
          .page { min-height: 100vh; position: relative; background: #061428; color: rgba(255,255,255,0.92); }
          .heroBg { position: absolute; inset: 0; background-image: linear-gradient(180deg, rgba(5,12,22,0.96) 0%, rgba(5,12,22,0.88) 30%, rgba(5,12,22,0.7) 55%, rgba(5,12,22,0.45) 75%, rgba(5,12,22,0.3) 100%), url("/images/heroes/landing-gxp.png"); background-size: cover; background-position: 70% center; }
          .main { position: relative; z-index: 2; padding: 34px 0 60px; }
          .container { max-width: 1100px; margin: 0 auto; padding: 0 22px; }

          .topBar { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
          .crumbs { font-size: 0.9rem; color: rgba(255,255,255,0.7); display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
          .sep { color: rgba(255,255,255,0.35); }
          .link { color: rgba(255,255,255,0.85); text-decoration: underline; }
          .link:hover { color: rgba(139,92,246,0.9); }
          .here { color: rgba(255,255,255,0.9); }

          .userBox { background: rgba(7,14,24,0.65); border: 1px solid rgba(255,255,255,0.14); border-radius: 14px; padding: 12px 14px; }
          .userLine { font-size: 0.92rem; margin-bottom: 8px; color: rgba(255,255,255,0.85); }
          .actions { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }
          .ghost { display: inline-flex; padding: 8px 12px; border-radius: 999px; background: transparent; border: 1px solid rgba(255,255,255,0.22); color: #fff; font-weight: 600; text-decoration: none; cursor: pointer; }
          .ghost:hover { background: rgba(255,255,255,0.08); }

          .panel { background: rgba(7,14,24,0.7); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 22px; }
          .h1 { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 750; margin: 0 0 10px; color: #fff; }
          .sub { margin: 0 0 18px; color: rgba(255,255,255,0.75); line-height: 1.6; }

          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .card { background: rgba(15,23,42,0.55); border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 16px; }
          .card h2 { margin: 0 0 10px; font-size: 1.05rem; color: #fff; }
          .card p, .card li { color: rgba(255,255,255,0.82); line-height: 1.6; }
          .card ul { margin: 0; padding-left: 18px; }

          .uploadBox { margin-top: 10px; padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.2); }

          .primary { display: inline-flex; padding: 10px 16px; border-radius: 999px; background: rgb(99,102,241); color: #fff; font-weight: 700; border: none; cursor: pointer; }
          .primary:hover { background: rgb(79,70,229); }

          .footer { margin-top: 22px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }

          @media (max-width: 900px) {
            .grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    </>
  );
}
