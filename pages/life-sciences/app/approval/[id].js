// pages/life-sciences/app/approval/[id].js

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiFetch } from "../../../../lib/life_sciences_app_lib/api";
import { getCurrentUser, requireAuthOrRedirect } from "../../../../lib/life_sciences_app_lib/auth";

function prettyErr(e) {
  if (!e) return null;
  if (typeof e === "string") return e;
  return e?.message || "Request failed.";
}

export default function ApprovalDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [doc, setDoc] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);

  const [decisionComment, setDecisionComment] = useState("");
  const [signed, setSigned] = useState(false);

  async function load() {
    setError(null);
    setBusy(true);

    try {
      const u = getCurrentUser();
      if (!u) throw new Error("Not signed in.");
      if (u.role !== "Approver") throw new Error("Approval actions are restricted to Approver role in demo mode.");
      if (!id) return;

      const data = await apiFetch(`/documents/${encodeURIComponent(String(id))}`, { method: "GET" }, router);
      setDoc(data || null);
      setStatus(null);
    } catch (e) {
      setError(prettyErr(e));
      setDoc(null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const ok = requireAuthOrRedirect(router, "/life-sciences/app/approval/approvals");
    if (!ok) return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!id) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function download() {
    setError(null);
    setStatus("Requesting controlled download URL...");
    try {
      const data = await apiFetch(`/documents/${encodeURIComponent(String(id))}/download`, { method: "GET" }, router);
      const url = data?.downloadUrl || data?.url || data?.presignedUrl;
      if (!url) throw new Error("Download URL not returned.");
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus(null);
    } catch (e) {
      setError(prettyErr(e));
      setStatus(null);
    }
  }

  async function decide(action) {
    setError(null);

    try {
      const u = getCurrentUser();
      if (!u) throw new Error("Not signed in.");
      if (u.role !== "Approver") throw new Error("Approval actions are restricted to Approver role in demo mode.");
      if (!signed) throw new Error("E-signature required: please check the e-signature box before submitting.");
      if (!id) throw new Error("Missing document id.");

      setBusy(true);
      setStatus(action === "approve" ? "Approving..." : "Rejecting...");

      const path =
        action === "approve"
          ? `/approvals/${encodeURIComponent(String(id))}/approve`
          : `/approvals/${encodeURIComponent(String(id))}/reject`;

      await apiFetch(
        path,
        {
          method: "POST",
          body: JSON.stringify({
            documentId: String(id),
            comment: (decisionComment || "").trim(),
            eSignature: true,
          }),
        },
        router
      );

      setStatus(action === "approve" ? "Approved." : "Rejected.");
      setTimeout(() => router.push("/life-sciences/app/approval/approvals"), 800);
    } catch (e) {
      setError(prettyErr(e));
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1>Review / Approve</h1>
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <Link href="/life-sciences/app/approval/approvals" style={linkBtn}>
            ← Back to Pending Approvals
          </Link>

          <button onClick={load} disabled={busy} style={btn}>
            Refresh
          </button>
        </div>

        {error && (
          <div style={{ border: "1px solid #cc0000", color: "#990000", padding: "0.75rem", background: "#fff5f5" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {status && !error ? (
          <div style={{ border: "1px solid #ddd", padding: "0.75rem", background: "white" }}>{status}</div>
        ) : null}

        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 18, background: "white" }}>
          {busy && !doc ? (
            <div style={{ opacity: 0.8 }}>Loading...</div>
          ) : !doc ? (
            <div style={{ opacity: 0.8 }}>No document loaded.</div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Document</div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{doc.title || doc.filename || "Untitled"}</div>
                </div>

                <div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.8 }}>
                  {doc.documentId || id}
                </div>
              </div>

              {doc.description ? <div style={{ marginTop: 10, opacity: 0.9 }}>{doc.description}</div> : null}

              <div style={{ marginTop: 14, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Link href={`/life-sciences/app/documents/${encodeURIComponent(String(id))}`} style={linkBtn}>
                  View Details
                </Link>

                <button onClick={download} style={btn}>
                  Download
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 18, background: "white" }}>
          <h2 style={{ marginTop: 0 }}>Decision</h2>

          <label style={{ display: "grid", gap: 6 }}>
            Comment (optional)
            <textarea
              value={decisionComment}
              onChange={(e) => setDecisionComment(e.target.value)}
              rows={4}
              placeholder="Optional: include a reason, reference, or note for the audit trail."
              disabled={busy}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <input type="checkbox" checked={signed} onChange={(e) => setSigned(e.target.checked)} disabled={busy} />
            <span>
              I certify this decision is accurate and I am authorized to approve/reject this controlled document
              (demo e-signature).
            </span>
          </label>

          <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
            <button onClick={() => decide("approve")} disabled={busy} style={{ ...btn, fontWeight: 900 }}>
              Approve
            </button>
            <button onClick={() => decide("reject")} disabled={busy} style={{ ...btn, fontWeight: 900 }}>
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const btn = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
};

const linkBtn = {
  ...btn,
  display: "inline-block",
  color: "#111",
  textDecoration: "none",
  fontWeight: 800,
};
