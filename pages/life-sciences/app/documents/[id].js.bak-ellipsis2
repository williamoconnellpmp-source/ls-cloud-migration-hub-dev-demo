// pages/life-sciences/app/documents/[id].js

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Shell } from "../index";
import { apiFetch } from ".../lib/vdc/api";
import { requireAuthOrRedirect } from ".../lib/vdc/auth";

function filenameFromKey(s3Key) {
  if (!s3Key || typeof s3Key !== "string") return "—";
  const parts = s3Key.split("/");
  return parts[parts.length - 1];
}

function prettyJson(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
}

function pickTs(it) {
  return it?.timestampUtc || it?.createdAt || it?.details?.timestampUtc || "";
}

function pickActor(it) {
  return (
    it?.actorEmail ||
    it?.signerEmail ||
    it?.actorUsername ||
    it?.signerUsername ||
    it?.actorUserId ||
    it?.signerUserId ||
    "—"
  );
}

function pickOwner(doc) {
  return doc?.ownerEmail || doc?.ownerUsername || doc?.ownerUserId || "—";
}

function truncateMiddle(s, max = 34) {
  const str = String(s || "");
  if (str.length <= max) return str;
  const left = Math.ceil((max - 3) / 2);
  const right = Math.floor((max - 3) / 2);
  return `${str.slice(0, left)}...${str.slice(str.length - right)}`;
}

function StatusPill({ status }) {
  const s = String(status || "—").toUpperCase();
  const bg =
    s === "APPROVED"
      ? "#eef7ee"
      : s === "REJECTED"
      ? "#fdeeee"
      : s === "SUBMITTED"
      ? "#eef3ff"
      : s === "DRAFT"
      ? "#f5f5f5"
      : "#f5f5f5";
  const border =
    s === "APPROVED"
      ? "#bfe3bf"
      : s === "REJECTED"
      ? "#f0b9b9"
      : s === "SUBMITTED"
      ? "#b9cdf6"
      : s === "DRAFT"
      ? "#d9d9d9"
      : "#d9d9d9";

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

function LabelValue({ label, children }) {
  return (
    <div style={{ display: "grid", gap: "0.2rem" }}>
      <div style={{ fontSize: "0.85rem", color: "#666", fontWeight: 700 }}>{label}</div>
      <div style={{ fontWeight: 700, color: "#111" }}>{children}</div>
    </div>
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

export default function DocumentDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [doc, setDoc] = useState(null);
  const [audit, setAudit] = useState([]);

  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const [errorDoc, setErrorDoc] = useState(null);
  const [errorAudit, setErrorAudit] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // Audit filters
  const [auditQ, setAuditQ] = useState("");
  const [eventType, setEventType] = useState("ALL");

  useEffect(() => {
    const ok = requireAuthOrRedirect(router);
    if (!ok) return;
  }, []);

  // Load doc summary (via /documents list for now)
  useEffect(() => {
    if (!router.isReady || !id) return;

    const load = async () => {
      setLoadingDoc(true);
      setErrorDoc(null);
      setDoc(null);

      try {
        const data = await apiFetch("/documents", { method: "GET" });
        const items = Array.isArray(data?.items) ? data.items : [];
        const found = items.find((x) => x.documentId === id) || null;

        if (!found) {
          setErrorDoc("Document not found (not returned by /documents).");
          return;
        }

        setDoc(found);
      } catch (e) {
        setErrorDoc(e?.message || "Failed to load document.");
      } finally {
        setLoadingDoc(false);
      }
    };

    load();
  }, [router.isReady, id]);

  // Load audit trail
  useEffect(() => {
    if (!router.isReady || !id) return;

    const loadAudit = async () => {
      setLoadingAudit(true);
      setErrorAudit(null);
      setAudit([]);

      try {
        const data = await apiFetch(`/documents/${id}/audit`, { method: "GET" });

        // Support either {items:[...]} or {events:[...]} (you have both styles in lambdas right now)
        const items = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.events)
          ? data.events
          : [];

        items.sort((a, b) => String(pickTs(a)).localeCompare(String(pickTs(b))));
        setAudit(items);
      } catch (e) {
        setAudit([]);
        setErrorAudit(
          e?.message ||
            "Failed to load audit trail. Confirm API Gateway has GET /documents/{documentId}/audit."
        );
      } finally {
        setLoadingAudit(false);
      }
    };

    loadAudit();
  }, [router.isReady, id]);

  const eventTypes = useMemo(() => {
    const set = new Set();
    for (const it of audit) {
      if (it?.eventType) set.add(it.eventType);
      if (it?.signatureMeaning) set.add(`ESIG:${it.signatureMeaning}`);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [audit]);

  const filteredAudit = useMemo(() => {
    const q = String(auditQ || "").toLowerCase().trim();

    let list = audit.slice();

    if (eventType !== "ALL") {
      list = list.filter((it) => {
        if (it?.eventType && it.eventType === eventType) return true;
        if (eventType.startsWith("ESIG:") && it?.signatureMeaning) {
          return `ESIG:${it.signatureMeaning}` === eventType;
        }
        return false;
      });
    }

    if (q) {
      list = list.filter((it) => {
        const hay = [
          it?.eventType,
          it?.signatureMeaning,
          pickActor(it),
          pickTs(it),
          it?.eventId,
          it?.sk,
          prettyJson(it?.details || {}),
          prettyJson(it?.integrity || {}),
        ]
          .join(" | ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return list;
  }, [audit, auditQ, eventType]);

  async function openFile() {
    setStatusMsg(null);

    try {
      setStatusMsg("Generating controlled download link…");
      const data = await apiFetch(`/documents/${id}/download`, { method: "GET" });
      const url = data?.downloadUrl;

      if (!url) throw new Error("Download URL was not returned by the server.");

      window.open(url, "_blank", "noopener,noreferrer");
      setStatusMsg(null);
    } catch (e) {
      setStatusMsg(null);
      setErrorAudit(e?.message || "Unable to generate download link.");
    }
  }

  const ownerFull = pickOwner(doc);
  const ownerShort = ownerFull === "—" ? "—" : truncateMiddle(ownerFull, 34);
  const idFull = doc?.documentId || id;
  const idShort = idFull ? truncateMiddle(idFull, 28) : "—";
  const fileName = doc?.s3Key ? filenameFromKey(doc.s3Key) : "—";

  return (
    <Shell title="Document detail">
      <div style={{ display: "grid", gap: "1rem", maxWidth: 1100 }}>
        {/* Top nav */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <Link href="/life-sciences/app/documents">← Back to document register</Link>
          {doc?.status === "SUBMITTED" && (
            <Link href={`/life-sciences/app/approval/${doc.documentId}`}>Review</Link>
          )}
        </div>

        {/* Summary card */}
        <section
          style={{
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "white",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <h2 style={{ marginTop: 0, marginBottom: "0.25rem" }}>Summary</h2>
              <div style={{ color: "#666" }}>
                Controlled copies are downloaded via presigned URL. Audit trail is append-only.
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <StatusPill status={doc?.status} />
              <Button type="button" onClick={openFile} disabled={!doc}>
                Open controlled copy
              </Button>
            </div>
          </div>

          {loadingDoc && <div style={{ marginTop: "0.9rem" }}>Loading…</div>}

          {errorDoc && (
            <div
              style={{
                marginTop: "0.9rem",
                padding: "0.75rem",
                border: "1px solid #cc0000",
                color: "#990000",
                borderRadius: 10,
              }}
            >
              <strong>Cannot proceed:</strong> {errorDoc}
            </div>
          )}

          {!loadingDoc && !errorDoc && doc && (
            <div
              style={{
                marginTop: "0.9rem",
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "0.9rem",
              }}
            >
              <LabelValue label="Document ID">
                <span title={idFull}>{idShort}</span>
              </LabelValue>

              <LabelValue label="Owner">
                <span title={ownerFull}>{ownerShort}</span>
              </LabelValue>

              <LabelValue label="Submitted at">{doc.submittedAt || "—"}</LabelValue>

              <LabelValue label="Title">{doc.title || "—"}</LabelValue>

              <LabelValue label="File">{fileName}</LabelValue>

              <LabelValue label="SHA-256">
                <span title={doc.sha256 || ""} style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>
                  {doc.sha256 ? `${doc.sha256.slice(0, 16)}…${doc.sha256.slice(-8)}` : "—"}
                </span>
              </LabelValue>
            </div>
          )}

          {statusMsg && (
            <div style={{ marginTop: "0.9rem", padding: "0.75rem", border: "1px solid #ccc", borderRadius: 10 }}>
              {statusMsg}
            </div>
          )}
        </section>

        {/* Audit trail */}
        <section
          style={{
            padding: "1rem",
            border: "1px solid #ddd",
            borderRadius: 12,
            background: "white",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.25rem" }}>Audit trail</h2>
          <div style={{ color: "#555" }}>
            Events are immutable and recorded for submission + approval/rejection + e-signatures.
          </div>

          {/* Audit filter bar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 280px 140px",
              gap: "0.75rem",
              marginTop: "0.9rem",
              alignItems: "end",
            }}
          >
            <label style={{ display: "grid", gap: "0.25rem" }}>
              Search
              <input
                value={auditQ}
                onChange={(e) => setAuditQ(e.target.value)}
                placeholder="DOC_SUBMITTED, mfa, sha256, comment…"
                style={{ padding: "0.55rem", borderRadius: 10, border: "1px solid #ccc" }}
              />
            </label>

            <label style={{ display: "grid", gap: "0.25rem" }}>
              Event type
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{ padding: "0.55rem", borderRadius: 10, border: "1px solid #ccc" }}
              >
                <option value="ALL">All</option>
                {eventTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <Button
              type="button"
              onClick={() => {
                setAuditQ("");
                setEventType("ALL");
              }}
            >
              Reset
            </Button>
          </div>

          {loadingAudit && <div style={{ marginTop: "0.9rem" }}>Loading…</div>}

          {errorAudit && (
            <div
              style={{
                marginTop: "0.9rem",
                padding: "0.75rem",
                border: "1px solid #cc0000",
                color: "#990000",
                borderRadius: 10,
              }}
            >
              <strong>Notice:</strong> {errorAudit}
              <div style={{ marginTop: "0.5rem", color: "#770000" }}>
                Confirm API Gateway has <code>GET /documents/{`{documentId}`}/audit</code>.
              </div>
            </div>
          )}

          {!loadingAudit && !errorAudit && filteredAudit.length === 0 && (
            <div style={{ marginTop: "0.9rem", color: "#444" }}>No audit events returned.</div>
          )}

          {!loadingAudit && !errorAudit && filteredAudit.length > 0 && (
            <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.75rem" }}>
              {filteredAudit.map((it, idx) => {
                const ts = pickTs(it) || "—";
                const actor = pickActor(it);
                const event =
                  it?.eventType || (it?.signatureMeaning ? `ESIG:${it.signatureMeaning}` : "—");

                const comment =
                  (it?.details && (it.details.comment || it.details.reason)) ||
                  it?.comment ||
                  "";

                const sha = it?.integrity?.sha256 || it?.sha256 || "";

                return (
                  <div
                    key={it.eventId || it.sk || idx}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 12,
                      padding: "0.85rem",
                      background: "#fcfcfc",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontWeight: 900,
                            border: "1px solid #ddd",
                            background: "white",
                            borderRadius: 999,
                            padding: "0.15rem 0.55rem",
                          }}
                        >
                          {event}
                        </span>
                        <span style={{ color: "#555", fontWeight: 700 }}>{ts}</span>
                      </div>

                      <div style={{ color: "#555", fontWeight: 700 }} title={actor}>
                        {truncateMiddle(actor, 36)}
                      </div>
                    </div>

                    {(comment || sha) && (
                      <div style={{ marginTop: "0.55rem", display: "grid", gap: "0.35rem" }}>
                        {comment && (
                          <div>
                            <span style={{ color: "#666", fontWeight: 800 }}>Comment:</span>{" "}
                            <span style={{ color: "#111" }}>{comment}</span>
                          </div>
                        )}
                        {sha && (
                          <div style={{ fontFamily: "monospace", fontSize: "0.92rem" }} title={sha}>
                            <span style={{ color: "#666", fontWeight: 800, fontFamily: "inherit" }}>SHA-256:</span>{" "}
                            {sha.slice(0, 16)}…{sha.slice(-8)}
                          </div>
                        )}
                      </div>
                    )}

                    <details style={{ marginTop: "0.6rem" }}>
                      <summary style={{ cursor: "pointer", fontWeight: 800 }}>Raw event JSON</summary>
                      <pre
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.75rem",
                          border: "1px solid #eee",
                          background: "white",
                          overflowX: "auto",
                          maxWidth: "100%",
                          borderRadius: 10,
                        }}
                      >
                        {prettyJson(it)}
                      </pre>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div style={{ color: "#666" }}>
          Note: document summary is currently derived from <code>GET /documents</code>. If you later add{" "}
          <code>GET /documents/{`{documentId}`}</code>, we can switch to a direct lookup.
        </div>
      </div>
    </Shell>
  );
}
