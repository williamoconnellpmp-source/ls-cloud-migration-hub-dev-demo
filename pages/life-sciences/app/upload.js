import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { apiFetch } from "../../../lib/life_sciences_app_lib/api";
import { getCurrentUser } from "../../../lib/life_sciences_app_lib/auth";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [docName, setDocName] = useState("");
  const [desc, setDesc] = useState("");
  const [attested, setAttested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: string }

  const currentUserLabel = useMemo(() => {
    try {
      const u = getCurrentUser?.();
      return u?.username || u?.email || "demo-user";
    } catch {
      return "demo-user";
    }
  }, []);

  const fileMeta = useMemo(() => {
    if (!selectedFile) return { name: "None", detail: "" };
    const name = selectedFile.name || "Selected file";
    const type = selectedFile.type ? selectedFile.type : "unknown type";
    const sizeBytes = typeof selectedFile.size === "number" ? selectedFile.size : null;
    const size =
      sizeBytes == null
        ? ""
        : sizeBytes < 1024
        ? `${sizeBytes} B`
        : sizeBytes < 1024 * 1024
        ? `${Math.round((sizeBytes / 1024) * 10) / 10} KB`
        : `${Math.round((sizeBytes / (1024 * 1024)) * 10) / 10} MB`;
    const detailParts = [];
    if (type) detailParts.push(type);
    if (size) detailParts.push(size);
    return { name, detail: detailParts.join(" • ") };
  }, [selectedFile]);

  function onFileChange(e) {
    const f = e?.target?.files?.[0] || null;
    setSelectedFile(f);
  }

  // 2-step workflow:
  // 1) POST /documents/upload/init -> returns { documentId, upload: { bucket, key, contentType, presignedUrl, ... } }
  // 2) PUT file to S3 using upload.presignedUrl
  // 3) POST /documents/submit -> persist DynamoDB record (status SUBMITTED)
  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (submitting) return;

    if (!selectedFile) {
      setMessage({ type: "error", text: "Please select a file to upload." });
      return;
    }
    if (!docName.trim()) {
      setMessage({ type: "error", text: "Please enter a document name." });
      return;
    }
    if (!attested) {
      setMessage({ type: "error", text: "You must attest before submitting." });
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: init (returns documentId + presignedUrl nested under upload)
      const initRes = await apiFetch("/documents/upload/init", {
        method: "POST",
        body: {
          filename: selectedFile.name,
          contentType: selectedFile.type || "application/octet-stream",
        },
      });

      const documentId = initRes?.documentId;
      const upload = initRes?.upload || {};
      const presignedUrl = upload?.presignedUrl; // <-- correct field (nested)

      if (!documentId) {
        throw new Error("Upload init did not return documentId.");
      }
      if (!presignedUrl) {
        throw new Error("Upload init did not return a valid S3 presignedUrl.");
      }

      // Step 2: PUT file to S3
      const s3Resp = await fetch(presignedUrl, {
        method: "PUT",
        body: selectedFile,
        headers: {
          // Use the file content-type (init also includes it)
          "Content-Type": selectedFile.type || upload?.contentType || "application/octet-stream",
        },
      });

      if (!s3Resp.ok) {
        throw new Error("S3 upload failed (PUT). Check file size/type and try again.");
      }

      // Step 3: Submit (persist record)
        const submitBody = {
          documentId,
          title: docName,
        description: desc,
        originalFilename: selectedFile.name,
        bucket: upload?.bucket,
        key: upload?.key,
        contentType: upload?.contentType || selectedFile.type || "application/octet-stream",
        userIdentity: currentUserLabel,
        status: "SUBMITTED",
      };

      await apiFetch("/documents/submit", {
        method: "POST",
        body: submitBody,
      });

      setMessage({ type: "success", text: "Document uploaded and submitted successfully! Redirecting..." });

      setTimeout(() => {
        window.location.href = "/life-sciences/app";
      }, 700);
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Upload failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head>
        <title>Upload Document - VDC Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="page">
        <header className="topHeader">
          <div className="headerContainer">
            <Link href="/" className="homeLink">Home</Link>
            <div className="headerDivider">|</div>
            <div className="headerInfo">
              <span className="headerName">William O&apos;Connell</span>
              <span className="headerSep">|</span>
              <span>Seattle, WA</span>
              <span className="headerSep">|</span>
              <span>(206) 551-5524</span>
              <span className="headerSep">|</span>
              <a href="mailto:WilliamOConnellPMP@gmail.com" className="headerLink">
                WilliamOConnellPMP@gmail.com
              </a>
              <span className="headerSep">|</span>
              <a
                href="https://www.linkedin.com/in/williamoconnell/"
                target="_blank"
                rel="noopener noreferrer"
                className="headerLink"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </header>

        <main className="mainContent">
          <div className="container">
            <nav className="appNav">
              <Link className="appNavLink" href="/life-sciences/app">Overview</Link>
              <Link className="appNavLink active" href="/life-sciences/app/upload">Upload</Link>
              <Link className="appNavLink" href="/life-sciences/app/submissions">Submissions</Link>
              <Link className="appNavLink" href="/life-sciences/app/documents">Documents</Link>
              <Link className="appNavLink" href="/life-sciences/app/approval/approvals">Pending Approvals</Link>
            </nav>

            <header className="pageHeader">
              <h1 className="h1">Upload Document</h1>
              <p className="subtitle">
                Submit a document into the controlled workflow (demo). Metadata and actions are recorded in the audit trail.
              </p>
            </header>

            {message && (
              <div
                style={{
                  margin: "10px 0 14px 0",
                  padding: "10px 16px",
                  borderRadius: 10,
                  background: message.type === "success" ? "#22c55e33" : "#ef444433",
                  color: message.type === "success" ? "#16a34a" : "#b91c1c",
                  fontWeight: 700,
                  fontSize: "1rem",
                  border: message.type === "success" ? "1px solid #16a34a" : "1px solid #b91c1c",
                  textAlign: "center",
                }}
                role="alert"
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form">
              <section className="panel">
                <div className="panelHeader">
                  <h2 className="h2">File</h2>
                  <p className="helper">Select the file to upload. The original filename is captured.</p>
                </div>

                <div className="fileRow">
                  <label className="fileLabel">
                    <span className="fileButton">Choose file</span>
                    <input
                      className="fileInput"
                      type="file"
                      onChange={onFileChange}
                      disabled={submitting}
                    />
                  </label>

                  <div className="fileMeta">
                    <div className="fileMetaLine">
                      <span className="muted">Selected:</span>{" "}
                      <strong className="strongText">{fileMeta.name}</strong>
                    </div>
                    {fileMeta.detail ? (
                      <div className="fileMetaLine muted">{fileMeta.detail}</div>
                    ) : null}
                  </div>
                </div>
              </section>

              <section className="panel">
                <div className="panelHeader tightHeader">
                  <h2 className="h2">Metadata</h2>
                  <p className="helper">These fields appear in document registers and lists.</p>
                </div>

                <div className="grid2">
                  <div className="field">
                    <label className="label">
                      Document name <span className="req">(required)</span>
                    </label>
                    <input
                      className="input"
                      type="text"
                      placeholder="e.g., SOP-001: Sample Handling"
                      value={docName}
                      onChange={e => setDocName(e.target.value)}
                      disabled={submitting}
                    />
                    <div className="hint">User-entered name displayed in registers and audit trail.</div>
                  </div>

                  <div className="field">
                    <label className="label">
                      Description <span className="muted">(optional)</span>
                    </label>
                    <textarea
                      className="textarea"
                      rows={3}
                      placeholder="Optional context for reviewers"
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      disabled={submitting}
                    />
                    <div className="hint">Keep concise; avoid sensitive information.</div>
                  </div>
                </div>
              </section>

              <section className="panel">
                <div className="panelHeader tightHeader">
                  <h2 className="h2">Attestation</h2>
                  <p className="helper">Required before submission.</p>
                </div>

                <div className="attestationBox">
                  I attest that this submission is accurate, complete, and is intended for controlled use within the validated system.
                </div>

                <label className="checkRow">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={attested}
                    onChange={e => setAttested(e.target.checked)}
                    disabled={submitting}
                  />
                  <span className="checkText">I attest to the statement above.</span>
                </label>
              </section>

              <div className="actionsRow">
                <div className="actionsMeta muted">
                  Submitting as: <strong className="strongText">{currentUserLabel}</strong> • UTC timestamps recorded
                </div>

                <button type="submit" className="primaryButton" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Document"}
                </button>
              </div>
            </form>
          </div>
        </main>

        <style jsx>{`
          .page {
            min-height: 100vh;
            background: linear-gradient(180deg, #0b1220 0%, #0e1a33 55%, #0f2147 100%);
            color: #ffffff;
          }
          .topHeader {
            background: rgba(0, 0, 0, 0.35);
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
            padding: 12px 0;
          }
          .headerContainer {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            align-items: center;
            gap: 14px;
            font-size: 0.85rem;
          }
          .homeLink {
            color: #ffffff;
            text-decoration: none;
            font-weight: 700;
          }
          .homeLink:hover {
            color: rgba(139, 92, 246, 0.95);
          }
          .headerDivider,
          .headerSep {
            color: rgba(255, 255, 255, 0.35);
          }
          .headerInfo {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            color: rgba(255, 255, 255, 0.95);
          }
          .headerName {
            font-weight: 800;
            color: #ffffff;
          }
          .headerLink {
            color: #ffffff;
            text-decoration: underline;
            text-underline-offset: 2px;
          }
          .headerLink:hover {
            color: rgba(139, 92, 246, 0.95);
          }
          .mainContent {
            padding: 16px 0 26px;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 24px;
          }
          .appNav {
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
            padding: 10px 12px;
            border: 1px solid rgba(255, 255, 255, 0.16);
            border-radius: 14px;
            background: rgba(10, 15, 30, 0.55);
            margin-bottom: 12px;
          }
          .appNavLink {
            color: rgba(255, 255, 255, 0.92);
            text-decoration: none;
            font-weight: 700;
            padding: 6px 10px;
            border-radius: 10px;
          }
          .appNavLink:hover {
            background: rgba(255, 255, 255, 0.06);
            color: #ffffff;
          }
          .appNavLink.active {
            background: rgba(99, 102, 241, 0.25);
            border: 1px solid rgba(99, 102, 241, 0.35);
            color: #ffffff;
          }
          .pageHeader {
            margin: 6px 0 10px;
          }
          .h1 {
            font-size: clamp(1.55rem, 2.8vw, 2.25rem);
            font-weight: 900;
            margin: 0 0 6px;
            color: #ffffff;
          }
          .subtitle {
            margin: 0;
            color: rgba(255, 255, 255, 0.92);
            line-height: 1.45;
          }
          .panel {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 16px;
            padding: 14px;
            margin-bottom: 10px;
          }
          .panelHeader {
            margin-bottom: 10px;
          }
          .tightHeader {
            margin-bottom: 8px;
          }
          .h2 {
            margin: 0 0 4px;
            font-size: 1.02rem;
            font-weight: 850;
            color: #ffffff;
          }
          .helper {
            margin: 0;
            color: rgba(255, 255, 255, 0.88);
            font-size: 0.9rem;
          }
          .muted {
            color: rgba(255, 255, 255, 0.78);
          }
          .strongText {
            color: #ffffff;
          }
          .req {
            color: rgba(255, 255, 255, 0.95);
            font-weight: 800;
          }
          .hint {
            margin-top: 6px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.85rem;
          }
          .fileRow {
            display: flex;
            align-items: center;
            gap: 14px;
            flex-wrap: wrap;
          }
          .fileLabel {
            position: relative;
            overflow: hidden;
            display: inline-flex;
          }
          .fileButton {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 9px 13px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.16);
            color: #ffffff;
            font-weight: 800;
            cursor: pointer;
          }
          .fileButton:hover {
            background: rgba(255, 255, 255, 0.12);
          }
          .fileInput {
            position: absolute;
            inset: 0;
            opacity: 0;
            cursor: pointer;
          }
          .fileMeta {
            min-width: 260px;
          }
          .fileMetaLine {
            line-height: 1.35;
            color: #ffffff;
          }
          .grid2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .field {
            display: flex;
            flex-direction: column;
          }
          .label {
            font-weight: 800;
            color: rgba(255, 255, 255, 0.98);
            margin-bottom: 6px;
          }
          .input,
          .textarea {
            width: 100%;
            padding: 11px 13px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: rgba(10, 18, 35, 0.92);
            color: #ffffff;
            outline: none;
          }
          .input::placeholder,
          .textarea::placeholder {
            color: rgba(255, 255, 255, 0.6);
          }
          .input:focus,
          .textarea:focus {
            border-color: rgba(99, 102, 241, 0.7);
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18);
          }
          .attestationBox {
            padding: 12px 12px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            background: rgba(255, 255, 255, 0.04);
            line-height: 1.5;
            color: rgba(255, 255, 255, 0.95);
            margin-bottom: 8px;
          }
          .checkRow {
            display: flex;
            gap: 10px;
            align-items: flex-start;
            color: rgba(255, 255, 255, 0.95);
          }
          .checkText {
            color: rgba(255, 255, 255, 0.95);
          }
          .checkbox {
            margin-top: 3px;
          }
          .actionsRow {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 6px 2px 0;
          }
          .primaryButton {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 9px 14px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.22);
            background: linear-gradient(90deg, #4f46e5, #6366f1);
            color: #ffffff;
            font-weight: 900;
            cursor: pointer;
            white-space: nowrap;
          }
          .primaryButton:hover {
            filter: brightness(1.05);
          }
          .primaryButton:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            filter: grayscale(25%);
          }
          @media (max-width: 900px) {
            .grid2 {
              grid-template-columns: 1fr;
            }
            .actionsRow {
              flex-direction: column;
              align-items: stretch;
            }
            .primaryButton {
              width: 100%;
            }
            .fileMeta {
              min-width: 0;
            }
          }
        `}</style>
      </div>
    </>
  );
}
