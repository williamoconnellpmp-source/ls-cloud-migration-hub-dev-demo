// pages/life-sciences/app/approval/approvals/index.js

import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../../../../../lib/life_sciences_app_lib/api";
import {
  getCurrentUser,
  requireAuthOrRedirect,
  logout,
} from "../../../../../lib/life_sciences_app_lib/auth";

function truncateMiddle(s, max = 34) {
  const str = String(s || "");
  if (str.length <= max) return str;
  const left = Math.ceil((max - 3) / 2);
  const right = Math.floor((max - 3) / 2);
  return `${str.slice(0, left)}...${str.slice(str.length - right)}`;
}

function filenameFromKey(s3Key) {
  if (!s3Key || typeof s3Key !== "string") return "—";
  const parts = s3Key.split("/");
  return parts[parts.length - 1];
}

function prettyUtc(ts) {
  if (!ts) return "—";
  // If server already returns a UTC string, keep it.
  return String(ts).includes("UTC") ? String(ts) : `${String(ts)} UTC`;
}

function normalizeText(x) {
  return String(x || "").toLowerCase();
}

function roleIsApprover(role) {
  const r = String(role || "").trim().toLowerCase();
  return r === "approver" || r === "admin";
}

// Owner priority: email → username → userId → submittedByEmail → submittedBy → submittedBySub
function pickOwner(it) {
  return (
    it?.ownerEmail ||
    it?.ownerUsername ||
    it?.ownerUserId ||
    it?.submittedByEmail ||
    it?.submittedBy ||
    it?.submittedBySub ||
    "—"
  );
}

function shortHash(x) {
  const s = String(x || "").trim();
  if (!s) return "—";
  return s.length > 12 ? `${s.slice(0, 12)}...` : s;
}

export default function PendingApprovalsPage() {
  const router = useRouter();

  // Avoid hydration mismatch: render stable default on server, set real user on client.
  const [user, setUser] = useState({ displayName: "Demo User", role: "—" });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");

  // Row action state
  const [rowBusyId, setRowBusyId] = useState(null);
  const [rowMsg, setRowMsg] = useState(null);

  useEffect(() => {
    const ok = requireAuthOrRedirect(
      router,
      "/life-sciences/app/approval/approvals"
    );
    if (!ok) return;

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
    setLoading(true);
    setError(null);
    setRowMsg(null);

    try {
      const u = getCurrentUser();
      if (!u) throw new Error("Not signed in.");
      if (!roleIsApprover(u.role))
        throw new Error(
          "Pending approvals are restricted to Approver role in demo mode."
        );

      const data = await apiFetch(
        "/approvals/pending",
        { method: "GET" },
        router
      );

      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.documents)
        ? data.documents
        : Array.isArray(data)
        ? data
        : [];

      setItems(list);
    } catch (e) {
      setItems([]);
      setError(e?.message || "Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const query = normalizeText(q).trim();
    if (!query) return items;

    return items.filter((it) => {
      const hay = [
        it?.documentId,
        it?.title,
        it?.status,
        pickOwner(it),
        it?.submittedAt,
        it?.sha256,
        filenameFromKey(it?.s3Key),
      ]
        .map(normalizeText)
        .join(" | ");

      return hay.includes(query);
    });
  }, [items, q]);

  async function openFileFor(documentId) {
    setRowMsg(null);
    setError(null);
    setRowBusyId(documentId);

    try {
      setRowMsg("Generating controlled download link...");
      const data = await apiFetch(
        `/documents/${encodeURIComponent(String(documentId))}/download`,
        { method: "GET" },
        router
      );
      const url = data?.downloadUrl || data?.url || data?.presignedUrl;

      if (!url) throw new Error("Download URL was not returned by the server.");

      window.open(url, "_blank", "noopener,noreferrer");
      setRowMsg(null);
    } catch (e) {
      setRowMsg(null);
      setError(e?.message || "Unable to generate download link.");
    } finally {
      setRowBusyId(null);
    }
  }

  return (
    <>
      <Head>
        <title>Pending Approvals - VDC Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true" />

        {/* Top header */}
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
              <Link
                href="/life-sciences/app/approval/approvals"
                className="navLink active"
              >
                Pending Approvals
              </Link>
            </div>

            <div className="navRight">
              <div className="userName">{user.displayName || "Demo User"}</div>
              <div className="rolePill">{String(user.role || "—")}</div>
              <button
                className="logoutBtn"
                onClick={() => logout(router)}
                type="button"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>

        <main className="content">
          <h1 className="h1">Pending Approvals</h1>
          <div className="subtitle">
            Documents requiring approval for the current role. Open the
            controlled copy, then review and approve or reject. All timestamps
            are recorded in UTC.
          </div>

          {/* Only show table UI if user is Approver; else show callout */}
          {roleIsApprover(user.role) ? (
            <section className="panel">
              <div className="panelHead">
                <div>
                  <div className="panelTitle">Documents awaiting approval</div>
                  <div className="panelSub">
                    Approve/Reject actions (and rejection reason) are performed
                    on the Review page.
                  </div>
                </div>

                <div className="panelActions">
                  <input
                    className="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search by document, submitter, id, hash, status, or UTC timestamp..."
                    disabled={loading}
                  />
                  <button className="ghostBtn" onClick={load} disabled={loading}>
                    Refresh
                  </button>
                </div>
              </div>

              {rowMsg && !error && <div className="statusBox">{rowMsg}</div>}

              {error && (
                <div className="errorBox">
                  <strong>Problem:</strong> {error}
                  <div className="errorHint">
                    Confirm API Gateway has <code>GET /approvals/pending</code>{" "}
                    and it is wired to JWT.
                  </div>
                </div>
              )}

              {loading ? (
                <div className="muted" style={{ marginTop: 10 }}>
                  Loading...
                </div>
              ) : !error && filtered.length === 0 ? (
                <div className="muted" style={{ marginTop: 10 }}>
                  No pending approvals.
                </div>
              ) : !error ? (
                <div className="tableWrap">
                  <div className="tableHeader">
                    <div>Document</div>
                    <div>File</div>
                    <div>Submitted by</div>
                    <div>Submitted (UTC)</div>
                    <div>Integrity</div>
                    <div>Actions</div>
                  </div>

                  {filtered.map((it) => {
                    const docId = it?.documentId || it?.id;
                    const title = it?.title || "—";
                    const file = it?.filename || filenameFromKey(it?.s3Key);
                    const owner = pickOwner(it);
                    const ownerShort =
                      owner === "—" ? "—" : truncateMiddle(owner, 24);
                    const submittedUtc = prettyUtc(it?.submittedAt);
                    const integrity = shortHash(it?.sha256);
                    const busyRow = rowBusyId === docId;

                    return (
                      <div className="tableRow" key={docId}>
                        <div className="docCell">
                          <div className="docTitle">{title}</div>
                          <div className="docMeta">
                            <span className="docMetaLabel">Document ID:</span>{" "}
                            {truncateMiddle(docId, 44)}
                          </div>
                        </div>

                        <div className="cell">{file}</div>

                        <div className="cell" title={owner}>
                          {ownerShort}
                        </div>

                        <div className="cell">{submittedUtc}</div>

                        <div className="cell mono">{integrity}</div>

                        <div className="actionsCell">
                          <button
                            className="miniBtn"
                            onClick={() => openFileFor(docId)}
                            disabled={busyRow}
                          >
                            {busyRow ? "Working..." : "Open file"}
                          </button>
                          <Link
                            className="reviewLink"
                            href={`/life-sciences/app/approval/${encodeURIComponent(
                              String(docId)
                            )}`}
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </section>
          ) : (
            <section className="panel">
              <div
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: 12,
                  padding: "24px 18px",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  textAlign: "center",
                  margin: "10px 0 10px 0",
                }}
              >
                <div
                  style={{
                    fontSize: "1.18rem",
                    fontWeight: 900,
                    marginBottom: 6,
                  }}
                >
                  Approvals are available to Approvers
                </div>
                <div>
                  Switch to the Approver role to review and approve submitted
                  documents.
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          position: relative;
          background: radial-gradient(
              1100px 520px at 40% 18%,
              rgba(31, 83, 167, 0.22),
              rgba(0, 0, 0, 0)
            ),
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
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
          color: #fff;
          opacity: 0.95;
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
          color: #fff;
          opacity: 0.95;
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
          color: #fff;
          opacity: 0.92;
        }

        .navLink.active {
          text-decoration: underline;
          text-underline-offset: 6px;
        }

        .navRight {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .userName {
          font-weight: 900;
          color: #fff;
          opacity: 0.95;
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

        .logoutBtn:hover {
          background: rgba(255, 255, 255, 0.1);
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
          color: #fff;
          margin-bottom: 14px;
        }

        .panel {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(3, 10, 20, 0.55);
          padding: 16px;
          backdrop-filter: blur(10px);
        }

        .panelHead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .panelTitle {
          font-weight: 950;
          font-size: 18px;
          margin-bottom: 6px;
          color: #fff;
        }

        .panelSub {
          opacity: 0.78;
          color: #fff;
        }

        .panelActions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .search {
          min-width: 360px;
          max-width: 520px;
          width: 42vw;
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.22);
          color: #fff;
          outline: none;
        }

        .ghostBtn {
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          font-weight: 900;
          color: #fff;
          cursor: pointer;
        }

        .ghostBtn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .statusBox {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          opacity: 0.95;
        }

        .errorBox {
          margin-top: 12px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 80, 80, 0.45);
          background: rgba(255, 30, 30, 0.12);
          color: #fff;
        }

        .errorHint {
          margin-top: 8px;
          opacity: 0.85;
          color: #fff;
        }

        .muted {
          opacity: 0.8;
          color: #fff;
        }

        .tableWrap {
          margin-top: 12px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          overflow: hidden;
        }

        .tableHeader {
          display: grid;
          grid-template-columns: 2.2fr 1.1fr 1fr 1.25fr 0.8fr 0.9fr;
          gap: 0;
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 12px;
          font-weight: 950;
          color: #fff;
        }

        .tableRow {
          display: grid;
          grid-template-columns: 2.2fr 1.1fr 1fr 1.25fr 0.8fr 0.9fr;
          padding: 14px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          align-items: start;
        }

        .docCell {
          display: grid;
          gap: 6px;
        }

        .docTitle {
          font-weight: 950;
          font-size: 18px;
          color: #fff;
        }

        .docMeta {
          opacity: 0.82;
          color: #fff;
        }

        .docMetaLabel {
          opacity: 0.8;
        }

        .cell {
          color: #fff;
          opacity: 0.95;
        }

        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        }

        .actionsCell {
          display: grid;
          gap: 10px;
          justify-items: start;
        }

        .miniBtn {
          padding: 8px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          font-weight: 900;
          cursor: pointer;
        }

        .miniBtn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .reviewLink {
          color: #fff;
          font-weight: 900;
          text-decoration: underline;
          text-underline-offset: 6px;
          opacity: 0.95;
        }

        @media (max-width: 980px) {
          .tableHeader {
            display: none;
          }
          .tableRow {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .actionsCell {
            grid-auto-flow: column;
            justify-items: start;
            align-items: center;
          }
          .search {
            min-width: 260px;
            width: 70vw;
          }
        }
      `}</style>
    </>
  );
}