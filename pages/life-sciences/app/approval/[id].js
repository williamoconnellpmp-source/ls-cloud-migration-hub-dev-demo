// pages/life-sciences/app/approval/[id].js

import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../../../../lib/life_sciences_app_lib/api";
import {
  getCurrentUser,
  requireAuthOrRedirect,
  logout,
} from "../../../../lib/life_sciences_app_lib/auth";

function prettyErr(e) {
  if (!e) return null;
  if (typeof e === "string") return e;
  return e?.message || "Request failed.";
}

function roleIsApprover(role) {
  const r = String(role || "").trim().toLowerCase();
  return r === "approver" || r === "admin";
}

export default function ApprovalDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // Avoid hydration mismatch by using a stable server-rendered default,
  // then updating on client.
  const [user, setUser] = useState({ displayName: "Demo User", role: "—" });

  const [doc, setDoc] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [rejectionComment, setRejectionComment] = useState("");

  const isApprover = roleIsApprover(user?.role);

  useEffect(() => {
    const ok = requireAuthOrRedirect(router, "/life-sciences/app/approval/approvals");
    if (!ok) return;

    // client only
    const u = getCurrentUser();
    if (u?.displayName || u?.role) {
      setUser({
        displayName: u.displayName || "Demo User",
        role: u.role || "—",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setError(null);
    setBusy(true);

    try {
      const u = getCurrentUser();
      if (!u) throw new Error("Not signed in.");
      if (!roleIsApprover(u.role))
        throw new Error("Approve/Reject actions are restricted to Approver role in demo mode.");
      if (!id) return;

      const data = await apiFetch("/documents", { method: "GET" }, router);
      const list = Array.isArray(data?.items) ? data.items : [];
      const found = list.find((item) => item.documentId === id || item.id === id);

      if (!found) throw new Error("Document not found.");

      setDoc(found);
      setStatus(null);
    } catch (e) {
      setError(prettyErr(e));
      setDoc(null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    if (!isApprover) return; // don't load doc for non-approver
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isApprover]);

  async function openControlledCopy() {
    setError(null);
    setStatus("Generating controlled download link...");

    try {
      const u = getCurrentUser();
      if (!u) throw new Error("Not signed in.");
      if (!roleIsApprover(u.role))
        throw new Error("Approve/Reject actions are restricted to Approver role in demo mode.");

      const data = await apiFetch(
        `/documents/${encodeURIComponent(String(id))}/download`,
        { method: "GET" },
        router
      );
      const url = data?.downloadUrl || data?.url || data?.presignedUrl;
      if (!url) throw new Error("Download URL not returned.");

      window.open(url, "_blank", "noopener,noreferrer");
      setStatus(null);
    } catch (e) {
      setError(prettyErr(e));
      setStatus(null);
    }
  }

  async function handleApprove() {
    setError(null);

    try {
      const u = getCurrentUser();
      if (!u) throw new Error("Not signed in.");
      if (!roleIsApprover(u.role))
        throw new Error("Approve/Reject actions are restricted to Approver role in demo mode.");
      if (!id) throw new Error("Missing document id.");

      setBusy(true);
      setStatus("Approving...");

      await apiFetch(
        `/approvals/${encodeURIComponent(String(id))}/approve`,
        { method: "POST" },
        router
      );

      router.push("/life-sciences/app/approval/approvals");
    } catch (e) {
      setError(prettyErr(e));
      setStatus(null);
      setBusy(false);
    }
  }

  async function handleReject() {
    setError(null);

    try {
      const u = getCurrentUser();
      if (!u) throw new Error("Not signed in.");
      if (!roleIsApprover(u.role))
        throw new Error("Approve/Reject actions are restricted to Approver role in demo mode.");
      if (!id) throw new Error("Missing document id.");

      const comment = rejectionComment.trim();
      if (!comment) throw new Error("Rejection reason is required.");

      setBusy(true);
      setStatus("Rejecting...");

      await apiFetch(
        `/approvals/${encodeURIComponent(String(id))}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment }),
        },
        router
      );

      router.push("/life-sciences/app/approval/approvals");
    } catch (e) {
      setError(prettyErr(e));
      setStatus(null);
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Review / Approve - VDC Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true" />

        {/* Top header (matches other pages) */}
        <header className="topHeader">
          <div className="headerContainer">
            <Link href="/" className="homeLink">
              Home
            </Link>
            <div className="headerDivider">|</div>
            <div className="headerInfo">
              <span className="headerName">William O&apos;Connell</span>
              <span className="headerSep">|</span>
              <span>Seattle, WA</span>
              <span className="headerSep">|</span>
              <span>(206) 551-5524</span>
              <span className="headerSep">|</span>
              <span>WilliamOConnellPMP@gmail.com</span>
              <span className="headerSep">|</span>
              <span>LinkedIn</span>
            </div>
          </div>
        </header>

        {/* App nav + user strip */}
        <div className="navWrap">
          <nav className="appNav">
            <div className="navLeft">
              <Link href="/life-sciences/app" className="navLink">
                Overview
              </Link>
              <Link href="/life-sciences/app/upload" className="navLink">
                Upload
              </Link>
              <Link href="/life-sciences/app/submissions" className="navLink">
                Submissions
              </Link>
              <Link href="/life-sciences/app/documents" className="navLink">
                Documents
              </Link>
              <Link href="/life-sciences/app/approval/approvals" className="navLink active">
                Pending Approvals
              </Link>
            </div>

            <div className="navRight">
              <div className="userName">{user.displayName || "Demo User"}</div>
              <div className="rolePill">{String(user.role || "—")}</div>

              <button className="logoutBtn" onClick={() => logout(router)} type="button">
                Logout
              </button>
            </div>
          </nav>
        </div>

        <main className="content">
          <h1 className="h1">Review / Approve</h1>
          <div className="subtitle">
            Review the controlled copy, then approve or reject. Rejection requires a reason. All timestamps are recorded in UTC.
          </div>

          {!isApprover ? (
            <section className="panel">
              <div
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: 12,
                  padding: "24px 18px",
                  color: "#0f172a",
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "1.18rem", fontWeight: 950, marginBottom: 6 }}>
                  Review is restricted to Approvers
                </div>
                <div style={{ fontWeight: 700 }}>
                  Switch to the Approver role, then return to the approvals queue.
                </div>
                <div style={{ marginTop: 14 }}>
                  <Link href="/life-sciences/app/approval/approvals">Back to Pending Approvals</Link>
                </div>
              </div>
            </section>
          ) : (
            <>
              {/* Document summary */}
              <section className="panel">
                <div className="panelTitle">Document summary</div>
                <div className="panelSub">
                  This metadata is displayed for audit-friendly review. This page is read-only.
                </div>

                <div className="summaryGrid">
                  <div className="summaryCard">
                    <div className="label">Document name</div>
                    <div className="value">{doc?.title || doc?.filename || "—"}</div>
                    <div className="muted">Document ID: {doc?.documentId || id || "—"}</div>
                  </div>

                  <div className="summaryCard">
                    <div className="label">Submitted by</div>
                    <div className="value">{doc?.submittedBy || doc?.ownerUsername || doc?.ownerEmail || "—"}</div>
                    <div className="muted">Submitted (UTC): {doc?.submittedAt || "—"}</div>
                  </div>

                  <div className="summaryCard">
                    <div className="label">Version under review</div>
                    <div className="value">—</div>
                    <div className="muted">Controlled copy required before decision</div>
                  </div>
                </div>

                <div className="summaryActions">
                  <Link
                    href={`/life-sciences/app/documents/${encodeURIComponent(String(id || ""))}`}
                    className="ghostBtn"
                  >
                    View details
                  </Link>

                  <button
                    onClick={openControlledCopy}
                    className="ghostBtn"
                    disabled={busy || !id}
                    type="button"
                  >
                    Open controlled copy
                  </button>

                  <Link href="/life-sciences/app/approval/approvals" className="textLink">
                    Back to queue
                  </Link>
                </div>

                {status && !error ? <div className="statusBox">{status}</div> : null}
                {error ? (
                  <div className="errorBox">
                    <strong>Error:</strong> {error}
                  </div>
                ) : null}
              </section>

              {/* Decision */}
              <section className="panel">
                <div className="panelTitle">Decision</div>
                <div className="panelSub">
                  Approve does not require text. Reject requires a reason that is recorded in the audit trail.
                </div>

                <div className="fieldLabel">Rejection reason (required only if rejecting)</div>
                <textarea
                  className="textarea"
                  value={rejectionComment}
                  onChange={(e) => setRejectionComment(e.target.value)}
                  rows={4}
                  placeholder="If rejecting, enter the reason. This is recorded in the audit trail."
                  disabled={busy}
                />

                <div className="decisionRow">
                  <button
                    className="approveBtn"
                    onClick={handleApprove}
                    disabled={busy || !id}
                    type="button"
                  >
                    Approve Document
                  </button>

                  <button
                    className="rejectBtn"
                    onClick={handleReject}
                    disabled={busy || !id || !rejectionComment.trim()}
                    type="button"
                  >
                    Reject Document
                  </button>

                  <div className="decisionMeta">
                    Acting as: <strong>{user.displayName || "Demo User"}</strong> · UTC timestamps recorded
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          position: relative;
          background: radial-gradient(1100px 520px at 40% 18%, rgba(31, 83, 167, 0.22), rgba(0, 0, 0, 0)),
            linear-gradient(180deg, #050b14 0%, #071427 55%, #061326 100%);
          color: #fff;
        }

        .heroBg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .topHeader {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.10);
        }

        .headerContainer {
          max-width: 1180px;
          margin: 0 auto;
          padding: 10px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .homeLink {
          text-decoration: none;
          font-weight: 800;
          opacity: 0.95;
          color: #fff;
        }

        .headerDivider {
          opacity: 0.35;
          color: #fff;
        }

        .headerInfo {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          font-size: 14px;
          opacity: 0.95;
          color: #fff;
        }

        .headerName {
          font-weight: 900;
        }

        .headerSep {
          opacity: 0.35;
        }

        .navWrap {
          max-width: 1180px;
          margin: 14px auto 0 auto;
          padding: 0 18px;
        }

        .appNav {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(2, 8, 16, 0.45);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          backdrop-filter: blur(10px);
        }

        .navLeft {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .navLink {
          text-decoration: none;
          font-weight: 800;
          opacity: 0.92;
          color: #fff;
        }

        .navLink.active {
          text-decoration: underline;
          text-underline-offset: 6px;
        }

        .navRight {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: nowrap;
        }

        .userName {
          font-weight: 900;
          opacity: 0.95;
          color: #fff;
        }

        .rolePill {
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(120, 170, 255, 0.35);
          background: rgba(30, 60, 140, 0.35);
          font-weight: 900;
          color: #fff;
        }

        .logoutBtn {
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          font-weight: 900;
          color: #fff;
          cursor: pointer;
        }

        .content {
          max-width: 1180px;
          margin: 0 auto;
          padding: 18px 18px 30px 18px;
        }

        .h1 {
          font-size: 44px;
          line-height: 1.05;
          margin: 18px 0 8px 0;
          font-weight: 950;
          color: #fff;
        }

        .subtitle {
          font-size: 16px;
          opacity: 0.9;
          margin-bottom: 14px;
          color: #fff;
        }

        .panel {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(3, 10, 20, 0.55);
          padding: 16px;
          backdrop-filter: blur(10px);
          margin-top: 16px;
        }

        .panelTitle {
          font-weight: 950;
          font-size: 18px;
          margin-bottom: 6px;
          color: #fff;
        }

        .panelSub {
          opacity: 0.78;
          margin-bottom: 12px;
          color: #fff;
        }

        .summaryGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        @media (max-width: 980px) {
          .summaryGrid {
            grid-template-columns: 1fr;
          }
        }

        .summaryCard {
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          padding: 14px;
        }

        .label {
          font-size: 13px;
          opacity: 0.75;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin-bottom: 6px;
          color: #fff;
        }

        .value {
          font-weight: 950;
          font-size: 20px;
          margin-bottom: 6px;
          color: #fff;
        }

        .muted {
          opacity: 0.78;
          font-size: 14px;
          color: #fff;
        }

        .summaryActions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .ghostBtn {
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
          color: #fff;
        }

        .ghostBtn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .textLink {
          text-decoration: underline;
          text-underline-offset: 6px;
          font-weight: 900;
          opacity: 0.9;
          color: #fff;
        }

        .statusBox {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
          opacity: 0.95;
          color: #fff;
        }

        .errorBox {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 80, 80, 0.45);
          background: rgba(255, 30, 30, 0.12);
          color: #fff;
        }

        .fieldLabel {
          margin-top: 8px;
          font-weight: 900;
          opacity: 0.95;
          color: #fff;
        }

        .textarea {
          width: 100%;
          margin-top: 8px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.25);
          padding: 12px;
          color: #fff;
          outline: none;
          resize: vertical;
        }

        .decisionRow {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .approveBtn {
          padding: 12px 18px;
          border-radius: 999px;
          border: none;
          font-weight: 950;
          cursor: pointer;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #04140b;
        }

        .rejectBtn {
          padding: 12px 18px;
          border-radius: 999px;
          border: none;
          font-weight: 950;
          cursor: pointer;
          background: linear-gradient(135deg, #b94a5a, #8e2f3a);
          color: #fff;
        }

        .approveBtn:disabled,
        .rejectBtn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .decisionMeta {
          margin-left: auto;
          opacity: 0.85;
          font-weight: 800;
          color: #fff;
        }
      `}</style>
    </>
  );
}
