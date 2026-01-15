// pages/life-sciences/app/approval/approvals/index.js

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiFetch } from "@/lib/life_sciences_app_lib/api";
import { requireAuthOrRedirect } from "@/lib/life_sciences_app_lib/auth";

function truncateMiddle(s, max = 34) {
  const str = String(s || "");
  if (str.length <= max) return str;
  const left = Math.ceil((max - 3) / 2);
  const right = Math.floor((max - 3) / 2);
  return `${str.slice(0, left)}...${str.slice(str.length - right)}`;
}

function filenameFromKey(s3Key) {
  if (!s3Key || typeof s3Key !== "string") return "â€”";
  const parts = s3Key.split("/");
  return parts[parts.length - 1];
}

function StatusPill({ status }) {
  const s = String(status || "â€”").toUpperCase();
  const bg = s === "SUBMITTED" ? "#eef3ff" : "#f5f5f5";
  const border = s === "SUBMITTED" ? "#b9cdf6" : "#d9d9d9";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.15rem 0.55rem",
        borderRadius: 999,
        border: `1px solid ${border}`,
        background: bg,
        fontSize: "0.85rem",
        fontWeight: 800,
        letterSpacing: "0.01em",
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
        padding: "0.45rem 0.7rem",
        borderRadius: 10,
        border: "1px solid #ddd",
        background: "white",
        fontWeight: 800,
        cursor: props.disabled ? "not-allowed" : "pointer",
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}

function normalizeText(x) {
  return String(x || "").toLowerCase();
}

// Owner priority: email â†’ username â†’ userId â†’ submittedByEmail â†’ submittedBy â†’ submittedBySub
function pickOwner(it) {
  return (
    it?.ownerEmail ||
    it?.ownerUsername ||
    it?.ownerUserId ||
    it?.submittedByEmail ||
    it?.submittedBy ||
    it?.submittedBySub ||
    "â€”"
  );
}

export default function PendingApprovalsPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [q, setQ] = useState("");

  // Row action state
  const [rowBusyId, setRowBusyId] = useState(null);
  const [rowMsg, setRowMsg] = useState(null);

  useEffect(() => {
    const ok = requireAuthOrRedirect(router);
    if (!ok) return;
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    setRowMsg(null);

    try {
      const data = await apiFetch("/approvals/pending", { method: "GET" });

      // support different response shapes
      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.documents)
        ? data.documents
        : [];

      setItems(list);
    } catch (e) {
      setError(e?.message || "Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
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
      setRowMsg("Generating controlled download linkâ€¦");
      const data = await apiFetch(`/documents/${documentId}/download`, { method: "GET" });
      const url = data?.downloadUrl;

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
    <div>
      <h1>Pending approvals</h1>
      <section
        style={{
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: 12,
          background: "white",
          maxWidth: 1200,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: "0.25rem" }}>Approvals queue</h2>
            <div style={{ color: "#666" }}>
              Review submitted documents. Open controlled copy, then approve/reject with e-signature.
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Button type="button" onClick={load} disabled={loading}>
              Refresh
            </Button>
            <Link href="/life-sciences/app/documents">Go to documents</Link>
          </div>
        </div>

        <div style={{ marginTop: "0.9rem", display: "grid", gridTemplateColumns: "1fr 160px", gap: "0.75rem" }}>
          <label style={{ display: "grid", gap: "0.25rem" }}>
            Search
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="title, owner email, id, shaâ€¦"
              style={{ padding: "0.55rem", borderRadius: 10, border: "1px solid #ccc" }}
            />
          </label>

          <div style={{ alignSelf: "end", color: "#666", fontWeight: 800 }}>
            {filtered.length} item{filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        {loading && <div style={{ marginTop: "0.9rem" }}>Loadingâ€¦</div>}

        {rowMsg && !error && (
          <div style={{ marginTop: "0.9rem", padding: "0.75rem", border: "1px solid #ccc", borderRadius: 10 }}>
            {rowMsg}
          </div>
        )}

        {error && (
          <div
            style={{
              marginTop: "0.9rem",
              padding: "0.75rem",
              border: "1px solid #cc0000",
              color: "#990000",
              borderRadius: 10,
            }}
          >
            <strong>Problem:</strong> {error}
            <div style={{ marginTop: "0.5rem", color: "#770000" }}>
              Confirm API Gateway has <code>GET /approvals/pending</code> and it is wired to JWT.
            </div>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ marginTop: "0.9rem", color: "#444" }}>No pending approvals.</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.9rem" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.55rem" }}>Document</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.55rem" }}>Owner</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.55rem" }}>Submitted</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.55rem" }}>Status</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: "0.55rem" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((it) => {
                const ownerFull = pickOwner(it);
                const ownerShort = ownerFull === "â€”" ? "â€”" : truncateMiddle(ownerFull, 34);

                return (
                  <tr key={it.documentId}>
                    <td style={{ padding: "0.55rem", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ display: "grid", gap: "0.2rem" }}>
                        <div style={{ fontWeight: 900 }}>{it.title || it.documentId}</div>
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>{truncateMiddle(it.documentId, 34)}</div>
                        <div style={{ fontSize: "0.9rem", color: "#666" }}>{filenameFromKey(it.s3Key)}</div>
                      </div>
                    </td>

                    <td style={{ padding: "0.55rem", borderBottom: "1px solid #f0f0f0", fontWeight: 800 }} title={ownerFull}>
                      {ownerShort}
                    </td>

                    <td style={{ padding: "0.55rem", borderBottom: "1px solid #f0f0f0" }}>{it.submittedAt || "â€”"}</td>

                    <td style={{ padding: "0.55rem", borderBottom: "1px solid #f0f0f0" }}>
                      <StatusPill status={it.status || "SUBMITTED"} />
                    </td>

                    <td style={{ padding: "0.55rem", borderBottom: "1px solid #f0f0f0" }}>
                      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center" }}>
                        <Button
                          type="button"
                          onClick={() => openFileFor(it.documentId)}
                          disabled={rowBusyId === it.documentId}
                        >
                          Open copy
                        </Button>

                        <Link href={`/life-sciences/app/approval/${it.documentId}`}>Review</Link>

                        <Link href={`/life-sciences/app/documents/${it.documentId}`}>Audit</Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <div style={{ marginTop: "1rem", color: "#666" }}>
        Note: owner display prefers <code>ownerEmail</code>. If your Lambda returns only a UUID, weâ€™ll fix the Lambda to include
        <code> ownerEmail</code> (or at least <code>submittedByEmail</code>).
      </div>
    </div>
  );
}


