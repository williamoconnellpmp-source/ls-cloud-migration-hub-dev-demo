// pages/life-sciences/app/documents/[id].js

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiFetch } from "../../../../lib/life_sciences_app_lib/api";
import { requireAuthOrRedirect, getCurrentUser } from "../../../../lib/life_sciences_app_lib/auth";

function prettyErr(e) {
  if (!e) return null;
  if (typeof e === "string") return e;
  return e?.message || "Request failed.";
}

function asString(val) {
  if (!val) return null;
  if (Array.isArray(val)) return val[0] || null;
  return typeof val === "string" ? val : null;
}

export default function DocumentDetailsPage() {
  const router = useRouter();
  const id = asString(router.query?.id);

  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(null);

  const [doc, setDoc] = useState(null);
  const [audit, setAudit] = useState([]);

  async function load(docId) {
    if (!docId) return;

    setBusy(true);
    setError(null);

    try {
      // 1) Get doc metadata from existing route: GET /documents
      const listResp = await apiFetch("/documents", { method: "GET" }, router);
      const items = Array.isArray(listResp?.items) ? listResp.items : [];
      const found = items.find((x) => x?.documentId === docId);

      if (!found) {
        setDoc(null);
        setAudit([]);
        setError("Document not found in /documents list.");
        return;
      }

      setDoc(found);

      // 2) Get audit trail from existing route: GET /documents/{id}/audit
      const auditResp = await apiFetch(`/documents/${encodeURIComponent(docId)}/audit`, { method: "GET" }, router);
      const auditItems = Array.isArray(auditResp?.items) ? auditResp.items : [];
      setAudit(auditItems);
    } catch (e) {
      setError(prettyErr(e));
      setDoc(null);
      setAudit([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    // Wait for router + id to be ready before doing anything
    if (!router.isReady) return;
    if (!id) return;

    const ok = requireAuthOrRedirect(router, `/life-sciences/app/documents/${encodeURIComponent(id)}`);
    if (!ok) return;

    load(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, id]);

  async function onDownload() {
    if (!id) return;
    setError(null);

    try {
      const data = await apiFetch(`/documents/${encodeURIComponent(id)}/download`, { method: "GET" }, router);
      const url = data?.downloadUrl;
      if (!url) {
        setError("Download URL missing from response.");
        return;
      }
      window.location.href = url;
    } catch (e) {
      setError(prettyErr(e));
    }
  }

  const user = getCurrentUser();
  const role = (user?.role || "").toLowerCase();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0 }}>Document Details</h1>
          <div style={{ marginTop: 6, fontFamily: "monospace", fontSize: 12, opacity: 0.8 }}>{id || ""}</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => load(id)}
            disabled={busy || !id}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/life-sciences/app/submissions" style={linkBtn}>
          ← Back to Submissions
        </Link>

        <button onClick={onDownload} disabled={!doc} style={btn}>
          Download
        </button>

        {doc?.status ? <span style={{ fontSize: 12, opacity: 0.75, alignSelf: "center" }}>Status: {doc.status}</span> : null}
        {role ? <span style={{ fontSize: 12, opacity: 0.75, alignSelf: "center" }}>Role: {role}</span> : null}
      </div>

      {error && (
        <div style={{ marginTop: 14, border: "1px solid #cc0000", color: "#990000", padding: "0.75rem" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ marginTop: 14, border: "1px solid #eee", borderRadius: 14, padding: 18, background: "white" }}>
        {busy ? (
          <div style={{ opacity: 0.8 }}>Loading...</div>
        ) : !doc ? (
          <div style={{ opacity: 0.8 }}>No document loaded.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{doc.title || "document"}</div>
            {doc.description ? <div style={{ opacity: 0.9 }}>{doc.description}</div> : null}

            <div style={{ display: "grid", gap: 6, fontSize: 13, opacity: 0.9 }}>
              <div>
                <strong>Owner:</strong> {doc.ownerUsername || doc.ownerEmail || doc.ownerUserId || "—"}
              </div>
              <div>
                <strong>Submitted By:</strong> {doc.submittedBy || doc.submittedByEmail || "—"}
              </div>
              <div>
                <strong>Created:</strong> {doc.createdAt || "—"}
              </div>
              <div>
                <strong>Updated:</strong> {doc.updatedAt || "—"}
              </div>
              <div>
                <strong>S3 Key:</strong> <span style={{ fontFamily: "monospace" }}>{doc.s3Key || "—"}</span>
              </div>
              <div>
                <strong>SHA256:</strong> <span style={{ fontFamily: "monospace" }}>{doc.sha256 || "—"}</span>
              </div>
              <div>
                <strong>Version:</strong> <span style={{ fontFamily: "monospace" }}>{doc.s3VersionId || "—"}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, border: "1px solid #eee", borderRadius: 14, padding: 18, background: "white" }}>
        <h2 style={{ marginTop: 0 }}>Audit Snapshot (demo)</h2>

        {busy ? (
          <div style={{ opacity: 0.8 }}>Loading audit…</div>
        ) : audit.length === 0 ? (
          <div style={{ opacity: 0.8 }}>No audit records found.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {audit.map((a) => (
              <div key={a.sk || a.eventId} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>{a.eventType || "EVENT"}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.75 }}>{a.timestampUtc || ""}</div>
                </div>
                <div style={{ marginTop: 6, fontSize: 13, opacity: 0.9 }}>
                  Actor: {a.actorUsername || a.actorEmail || a.actorUserId || "—"}
                </div>
                {a.details?.comment ? <div style={{ marginTop: 6, opacity: 0.9 }}>Comment: {a.details.comment}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const linkBtn = {
  display: "inline-block",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  color: "#111",
  textDecoration: "none",
  fontWeight: 800,
};

const btn = {
  display: "inline-block",
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  color: "#111",
  textDecoration: "none",
  fontWeight: 800,
  cursor: "pointer",
};
