// pages/life-sciences/app/documents/index.js

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiFetch } from "../../../../lib/life_sciences_app_lib/api";
import { requireAuthOrRedirect } from "../../../../lib/life_sciences_app_lib/auth";

function prettyErr(e) {
  if (!e) return null;
  if (typeof e === "string") return e;
  return e?.message || "Request failed.";
}

function filenameFromItem(it) {
  return it?.filename || it?.originalFilename || it?.key || "document";
}

export default function DocumentsIndexPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setBusy(true);
    setError(null);

    try {
      const data = await apiFetch("/documents", { method: "GET" }, router);
      const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
      setItems(list);
    } catch (e) {
      setError(prettyErr(e));
      setItems([]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const ok = requireAuthOrRedirect(router, "/life-sciences/app/documents");
    if (!ok) return;

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1>Documents</h1>
      <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 18, background: "white" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 14, opacity: 0.75 }}>All documents in the demo system.</div>
          <button
            onClick={load}
            disabled={busy}
            style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 14, border: "1px solid #cc0000", color: "#990000", padding: "0.75rem" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {busy ? (
          <div style={{ marginTop: 14, opacity: 0.8 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ marginTop: 14, opacity: 0.8 }}>No documents found.</div>
        ) : (
          <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
            {items.map((it) => {
              const id = it.documentId || it.id;
              return (
                <div key={id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                    <div style={{ fontWeight: 800 }}>{it.title || filenameFromItem(it)}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, opacity: 0.75 }}>{id}</div>
                  </div>

                  {it.status ? (
                    <div style={{ marginTop: 8, opacity: 0.8, fontSize: 13 }}>Status: {it.status}</div>
                  ) : null}

                  <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <Link href={`/life-sciences/app/documents/${encodeURIComponent(id)}`} style={linkBtn}>
                      View
                    </Link>

                    <Link href={`/life-sciences/app/approval/${encodeURIComponent(id)}`} style={linkBtn}>
                      Approve / Reject
                    </Link>
                  </div>
                </div>
              );
            })}
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
