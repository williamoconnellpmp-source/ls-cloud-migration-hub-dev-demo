// pages/life-sciences/app/submissions.js

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiFetch } from "@/lib/life_sciences_app_lib/api";
import { getCurrentUser, requireAuthOrRedirect, logout } from "@/lib/life_sciences_app_lib/auth";

function normalizeText(x) {
  return String(x || "").toLowerCase();
}

function truncateMiddle(s, max = 38) {
  const str = String(s || "");
  if (str.length <= max) return str;
  const left = Math.ceil((max - 3) / 2);
  const right = Math.floor((max - 3) / 2);
  return `${str.slice(0, left)}...${str.slice(str.length - right)}`;
}

function filenameFromKey(s3Key) {
  if (!s3Key || typeof s3Key !== "string") return "—";
  const parts = s3Key.split("/");
  return parts[parts.length - 1] || "—";
}

// Best-effort “submitted by” display (order matters)
function pickSubmittedBy(it) {
  return (
    it?.submittedByDisplayName ||
    it?.submittedByName ||
    it?.submittedByEmail ||
    it?.submittedBy ||
    it?.ownerDisplayName ||
    it?.ownerName ||
    it?.ownerEmail ||
    it?.ownerUsername ||
    it?.ownerUserId ||
    it?.submittedBySub ||
    "—"
  );
}

// Used for filtering “my submissions”
function matchesCurrentUser(it, u) {
  if (!u) return false;

  const me = normalizeText(u.displayName);

  const candidates = [
    it?.ownerDisplayName,
    it?.ownerName,
    it?.ownerUsername,
    it?.ownerEmail,
    it?.ownerUserId,

    it?.submittedByDisplayName,
    it?.submittedByName,
    it?.submittedBy,
    it?.submittedByEmail,
    it?.submittedBySub,
  ]
    .filter(Boolean)
    .map(normalizeText);

  if (candidates.includes(me)) return true;

  // Demo-friendly fallback (still safe enough for demo mode)
  return candidates.some((c) => c.includes(me) || me.includes(c));
}

function StatusPill({ status }) {
  const s = String(status || "—").toUpperCase();
  const isSubmitted = s === "SUBMITTED";
  const isApproved = s === "APPROVED";
  const isRejected = s === "REJECTED";

  const bg = isSubmitted
    ? "rgba(99, 132, 255, 0.18)"
    : isApproved
    ? "rgba(16, 185, 129, 0.18)"
    : isRejected
    ? "rgba(239, 68, 68, 0.18)"
    : "rgba(255,255,255,0.06)";

  const border = isSubmitted
    ? "rgba(99, 132, 255, 0.45)"
    : isApproved
    ? "rgba(16, 185, 129, 0.45)"
    : isRejected
    ? "rgba(239, 68, 68, 0.45)"
    : "rgba(255,255,255,0.18)";

  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.6rem",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        fontSize: "0.85rem",
        fontWeight: 900,
        letterSpacing: "0.01em",
        color: "#fff",
        whiteSpace: "nowrap",
      }}
    >
      {s}
    </span>
  );
}

function Button({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "0.55rem 0.8rem",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.06)",
        color: "#fff",
        fontWeight: 900,
        cursor: props.disabled ? "not-allowed" : "pointer",
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}

export default function SubmissionsPage() {
  const router = useRouter();

  // IMPORTANT: avoid hydration mismatch (don’t read localStorage in render)
  const [user, setUser] = useState({ displayName: "Demo User", role: "—" });

  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");

  // Row action state
  const [rowBusyId, setRowBusyId] = useState(null);
  const [rowMsg, setRowMsg] = useState(null);

  useEffect(() => {
    const ok = requireAuthOrRedirect(router, "/life-sciences/app/submissions");
    if (!ok) return;

    const u = getCurrentUser();
    if (u?.displayName || u?.role) {
      setUser({ displayName: u.displayName || "Demo User", role: u.role || "—" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setBusy(true);
    setError(null);
    setRowMsg(null);

    try {
      const u = getCurrentUser();
      if (!u) throw new Error("Not signed in.");

      const data = await apiFetch("/documents", { method: "GET" }, router);

      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.documents)
        ? data.documents
        : Array.isArray(data)
        ? data
        : [];

      // Requirement:
      // - Approver/Admin sees ALL submissions
      // - Submitter sees only their own
      const scoped =
        u.role === "Approver" || u.role === "Admin"
          ? list
          : list.filter((it) => matchesCurrentUser(it, u));

      // Sort newest first
      const sorted = [...scoped].sort((a, b) => {
        const ta = a?.submittedAt || a?.lastActionAt || a?.createdAt || a?.updatedAt || "";
        const tb = b?.submittedAt || b?.lastActionAt || b?.createdAt || b?.updatedAt || "";
        return String(tb).localeCompare(String(ta));
      });

      setItems(sorted);
    } catch (e) {
      setError(e?.message || "Failed to load submissions.");
      setItems([]);
    } finally {
      setBusy(false);
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
        it?.title,
        it?.documentId || it?.id,
        it?.status,
        pickSubmittedBy(it),
        it?.submittedAt,
        it?.sha256,
        it?.integrityHash,
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
      setRowMsg("Generating controlled download link…");
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
        <title>Submissions - VDC Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <div className="heroBg" aria-hidden="true" />

        {/* Top header (standard) */}
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

        {/* App nav + user strip (standard) */}
        <div className="navWrap">
          <nav className="appNav">
            <div className="navLeft">
              <Link href="/life-sciences/app" className="navLink">
                Overview
              </Link>
              <Link href="/life-sciences/app/upload" className="navLink">
                Upload
              </Link>
              <Link href="/life-sciences/app/submissions" className="navLink active">
                Submissions
              </Link>
              <Link href="/life-sciences/app/documents" className="navLink">
                Documents
              </Link>
              <Link href="/life-sciences/app/approval/approvals" className="navLink">
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
          <h1 className="h1">Submissions</h1>

          <div className="subtitle">
            {(user.role === "Approver" || user.role === "Admin"
              ? "All submitted documents in the demo workspace. Status changes are reflected in the register and pending approvals queue."
              : "Documents submitted by the current demo user. Status changes are reflected in the register and pending approvals queue.") +
              " All timestamps are recorded and displayed as UTC."}
          </div>

          <section className="panel">
            <div className="panelHead">
              <div>
                <div className="panelTitle">
                  {user.role === "Approver" || user.role === "Admin" ? "All submissions" : "Your submissions"}
                </div>
                <div className="panelSub">
                  Tip: <strong>SUBMITTED</strong> means the document should appear in <strong>Pending Approvals</strong>.
                </div>
              </div>

              <div className="panelActions">
                <input
                  className="search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, submitter, id, status, hash, or UTC timestamp…"
                  disabled={busy}
                />
                <button className="ghostBtn" type="button" onClick={load} disabled={busy}>
                  Refresh
                </button>
              </div>
            </div>

            {busy && (
              <div className="muted" style={{ marginTop: 12 }}>
                Loading…
              </div>
            )}

            {rowMsg && !error ? <div className="statusBox">{rowMsg}</div> : null}

            {error ? (
              <div className="errorBox">
                <strong>Problem:</strong> {error}
                <div className="errorHint">
                  Confirm API Gateway has <code>GET /documents</code> wired correctly and returning <code>items</code>.
                </div>
              </div>
            ) : null}

            {!busy && !error && filtered.length === 0 ? (
              <div className="muted" style={{ marginTop: 12 }}>
                No submissions found.
                {user.role === "Approver" || user.role === "Admin"
                  ? " Submit a document from Upload to create more test data."
                  : " Go to Upload to submit a document."}
              </div>
            ) : null}

            {!busy && !error && filtered.length > 0 ? (
              <div className="tableWrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="colDoc">Document</th>
                      <th className="colFile">File</th>
                      <th className="colBy">Submitted by</th>
                      <th className="colWhen">Submitted (UTC)</th>
                      <th className="colStatus">Status</th>
                      <th className="colActions">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((it) => {
                      const id = it?.documentId || it?.id;
                      const title = it?.title || "Untitled";
                      const filename = it?.filename || filenameFromKey(it?.s3Key);
                      const submittedBy = pickSubmittedBy(it);
                      const submittedAt = it?.submittedAt || it?.createdAt || "—";
                      const status = String(it?.status || "").toUpperCase();

                      return (
                        <tr key={String(id)}>
                          <td className="cellDoc">
                            <div className="docTitle">{title}</div>
                            <div className="docMeta">
                              Document ID: <span className="mono">{truncateMiddle(id, 46)}</span>
                            </div>
                          </td>

                          <td className="cellWrap">
                            <span className="wrapAny">{filename}</span>
                          </td>

                          <td className="cellWrap">
                            <span className="wrapAny">{truncateMiddle(submittedBy, 42)}</span>
                          </td>

                          <td className="cellWrap">
                            <span className="wrapAny">{submittedAt}</span>
                          </td>

                          <td>
                            <StatusPill status={it?.status} />
                          </td>

                          <td>
                            <div className="actions">
                              <Button
                                type="button"
                                onClick={() => openFileFor(id)}
                                disabled={rowBusyId === id}
                                style={{ padding: "0.45rem 0.75rem" }}
                              >
                                Open file
                              </Button>

                              <Link className="link" href={`/life-sciences/app/documents/${encodeURIComponent(String(id))}`}>
                                View
                              </Link>

                              {(user.role === "Approver" || user.role === "Admin") && status === "SUBMITTED" ? (
                                <Link className="link" href={`/life-sciences/app/approval/${encodeURIComponent(String(id))}`}>
                                  Review
                                </Link>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
          </section>
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
          max-width: 110ch;
          line-height: 1.6;
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
          margin-top: 14px;
          overflow: hidden; /* no sideways scrolling */
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(6, 12, 28, 0.35);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed; /* forces fit */
        }

        th,
        td {
          text-align: left;
          padding: 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          vertical-align: top;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        th {
          color: rgba(255, 255, 255, 0.85);
          font-weight: 900;
          background: rgba(255, 255, 255, 0.03);
        }

        .colDoc {
          width: 28%;
        }
        .colFile {
          width: 18%;
        }
        .colBy {
          width: 16%;
        }
        .colWhen {
          width: 18%;
        }
        .colStatus {
          width: 10%;
        }
        .colActions {
          width: 10%;
        }

        .docTitle {
          font-weight: 950;
          font-size: 16px;
          color: #fff;
        }

        .docMeta {
          margin-top: 6px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 12px;
        }

        .mono {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }

        .wrapAny {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
        }

        .link {
          color: rgba(255, 255, 255, 0.92);
          font-weight: 900;
          text-decoration: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.25);
          padding-bottom: 2px;
        }

        .link:hover {
          border-bottom-color: rgba(255, 255, 255, 0.6);
        }

        @media (max-width: 900px) {
          .search {
            min-width: 260px;
            width: 70vw;
          }
          .h1 {
            font-size: 40px;
          }
        }

        @media (max-width: 720px) {
          /* Hide UTC column on small screens */
          .colWhen,
          td:nth-child(4) {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
