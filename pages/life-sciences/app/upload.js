// pages/life-sciences/app/upload.js

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { apiFetch } from "../../../lib/life_sciences_app_lib/api";
import { getCurrentUser, requireAuthOrRedirect, hasRole } from "../../../lib/life_sciences_app_lib/auth";

const ATTESTATION_TEXT =
  "I attest that this submission is accurate, complete, and is intended for controlled use within the validated system.";

function prettyErr(e) {
  if (!e) return null;
  if (typeof e === "string") return e;
  return e?.message || "Request failed.";
}

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [attested, setAttested] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const [documentId, setDocumentId] = useState(null);
  const [uploadKey, setUploadKey] = useState(null);

  useEffect(() => {
    const ok = requireAuthOrRedirect(router, "/life-sciences/app/upload");
    if (!ok) return;

    const u = getCurrentUser();

    // Upload is Submitter-only (demo RBAC)
    if (u && u.role !== "Submitter") {
      setError("Upload is restricted to Submitter role in demo mode. Please sign out and re-login as Submitter.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, attested, description, file]);

  const canSubmit = useMemo(() => {
    const roleOk = hasRole("Submitter");
    return Boolean(file) && Boolean(title.trim()) && attested && !busy && roleOk;
  }, [file, title, attested, busy]);

  async function initUpload() {
    setBusy(true);
    setError(null);
    setStatusMsg("Requesting secure upload URL...");

    try {
      const u = getCurrentUser();
      if (!u) throw new Error("Not signed in.");
      if (u.role !== "Submitter") throw new Error("Upload is Submitter-only in demo mode.");

      if (!file) throw new Error("Please choose a file first.");

      const data = await apiFetch(
        "/documents/upload/init",
        {
          method: "POST",
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type || "application/octet-stream",
          }),
        },
        router
      );

      const did = data?.documentId;
      const putUrl = data?.upload?.presignedUrl;
      const key = data?.upload?.key;

      if (!did || !putUrl) throw new Error("Upload init did not return documentId/presignedUrl.");

      setDocumentId(did);
      setUploadKey(key || null);

      setStatusMsg("Uploading file to controlled storage...");

      const putRes = await fetch(putUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!putRes.ok) {
        const t = await putRes.text().catch(() => "");
        throw new Error(`S3 upload failed (${putRes.status}). ${t ? t.slice(0, 200) : ""}`);
      }

      setStatusMsg("File uploaded. Submitting document...");

      await apiFetch(
        "/documents/submit",
        {
          method: "POST",
          body: JSON.stringify({
            documentId: did,
            title: title.trim(),
            description: description || "",
            comment: "",
          }),
        },
        router
      );

      setStatusMsg("Submitted successfully.");
      setTimeout(() => router.push("/life-sciences/app/submissions"), 600);
    } catch (e) {
      setError(prettyErr(e));
      setStatusMsg(null);
    } finally {
      setBusy(false);
    }
  }

  function onClickSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!file) return setError("Please choose a file.");
    if (!title.trim()) return setError("Document name (title) is required.");
    if (!attested) return setError("You must attest to the statement above before submitting.");

    initUpload();
  }

  return (
    <div>
      <h1>Upload Document</h1>
      <form onSubmit={onClickSubmit} style={{ display: "grid", gap: "1rem", maxWidth: 900 }}>
        <section style={{ padding: "1rem", border: "1px solid #ddd" }}>
          <h2 style={{ marginTop: 0 }}>File</h2>

          <input
            type="file"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setDocumentId(null);
              setUploadKey(null);
            }}
            disabled={busy}
          />

          <div style={{ marginTop: "0.5rem", color: "#444" }}>
            Selected: <strong>{file?.name || "—"}</strong>
          </div>
        </section>

        <section style={{ padding: "1rem", border: "1px solid #ddd" }}>
          <h2 style={{ marginTop: 0 }}>Metadata</h2>

          <label style={{ display: "grid", gap: "0.25rem" }}>
            Document name (required)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
              placeholder="e.g., SOP-123 Validation Plan"
            />
          </label>

          <label style={{ display: "grid", gap: "0.25rem", marginTop: "0.75rem" }}>
            Description (optional)
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={busy}
              rows={3}
              placeholder="Optional context for reviewers"
            />
          </label>
        </section>

        <section style={{ padding: "1rem", border: "1px solid #ddd" }}>
          <h2 style={{ marginTop: 0 }}>Attestation</h2>

          <div style={{ padding: "0.75rem", border: "1px solid #eee", background: "#fafafa" }}>
            {ATTESTATION_TEXT}
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.75rem" }}>
            <input
              type="checkbox"
              checked={attested}
              onChange={(e) => setAttested(e.target.checked)}
              disabled={busy}
            />
            I attest to the statement above.
          </label>
        </section>

        {error && (
          <div style={{ border: "1px solid #cc0000", color: "#990000", padding: "0.75rem" }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {statusMsg && !error && <div style={{ border: "1px solid #ccc", padding: "0.75rem" }}>{statusMsg}</div>}

        <button type="submit" disabled={!canSubmit} style={{ padding: "1rem" }}>
          {busy ? "Working..." : "Submit Document"}
        </button>

        {(documentId || uploadKey) && (
          <div style={{ marginTop: "0.5rem", color: "#666", fontSize: "0.95rem" }}>
            {documentId && (
              <div>
                <strong>Document ID:</strong> {documentId}
              </div>
            )}
            {uploadKey && (
              <div>
                <strong>S3 Key:</strong> {uploadKey}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
