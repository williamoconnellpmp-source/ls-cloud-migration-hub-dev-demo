// pages/life-sciences/app/index.js

import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getCurrentUser, requireAuthOrRedirect, logout } from "@/lib/life_sciences_app_lib/auth";

export default function VdcOverviewPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const ok = requireAuthOrRedirect(router, "/life-sciences/app");
    if (!ok) return;

    setMounted(true);

    try {
      const u = getCurrentUser();
      setUser(u || null);
    } catch {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = user?.displayName || "Demo User";
  const role = user?.role || "—";
  const roleLower = String(role || "").toLowerCase();
  const isApprover = roleLower === "approver" || roleLower === "admin";

  function onLogout() {
    logout(router);
  }

  return (
    <>
      <Head>
        <title>VDC Demo — Overview</title>
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
          <nav className="appNav" aria-label="VDC demo navigation">
            <div className="navLeft">
              <Link href="/life-sciences/app" className="navLink active">
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
              <Link href="/life-sciences/app/approval/approvals" className="navLink">
                Pending Approvals
              </Link>
            </div>

            <div className="navRight">
              <div className="userName">{mounted ? displayName : "Loading…"}</div>
              <div className="rolePill">{mounted ? role : "—"}</div>
              <button className="logoutBtn" onClick={onLogout} type="button">
                Logout
              </button>
            </div>
          </nav>
        </div>

        <main className="content">
          <h1 className="h1">Validated Document Control (VDC) — Demo</h1>
          <div className="subtitle">
            Audit-friendly demo of controlled document lifecycle management. Demo mode (no Cognito). All timestamps are recorded in UTC.
          </div>

          {/* Summary block (GxP-style) */}
          <section className="panel">
            <div className="panelTitle">System summary</div>

            <div className="summaryGrid">
              <div className="summaryItem">
                <div className="label">Current user</div>
                <div className="value">{mounted ? displayName : "—"}</div>
              </div>

              <div className="summaryItem">
                <div className="label">Role</div>
                <div className="value">{mounted ? role : "—"}</div>
              </div>

              <div className="summaryItem">
                <div className="label">Mode</div>
                <div className="value">Demo (local session)</div>
              </div>

              <div className="summaryItem">
                <div className="label">Time standard</div>
                <div className="value">UTC</div>
              </div>

              <div className="summaryItem span2">
                <div className="label">Workflow</div>
                <div className="value">Submit → Review → Approve/Reject</div>
              </div>

              <div className="summaryItem span2">
                <div className="label">Integrity</div>
                <div className="value">SHA-256 calculated and displayed on Document Details</div>
              </div>
            </div>
          </section>

          {/* What to do next (minimal, operational) */}
          <section className="panel">
            <div className="panelTitle">Recommended next step</div>
            <div className="panelText">
              If you are a <strong>Submitter</strong>, start with <strong>Upload</strong>. If you are an <strong>Approver</strong>, go to <strong>Pending Approvals</strong>.
            </div>

            <div className="linkRow">
              <Link className="primaryLink" href="/life-sciences/app/upload">
                Go to Upload
              </Link>

              <Link className="primaryLink" href="/life-sciences/app/submissions">
                Go to Submissions
              </Link>

              <Link className="primaryLink" href="/life-sciences/app/documents">
                Go to Documents
              </Link>

              <Link
                className={`primaryLink ${isApprover ? "" : "disabledLink"}`}
                href={isApprover ? "/life-sciences/app/approval/approvals" : "/life-sciences/app"}
                aria-disabled={!isApprover}
                onClick={(e) => {
                  if (!isApprover) e.preventDefault();
                }}
              >
                Go to Pending Approvals
              </Link>

              {!isApprover ? (
                <div className="note">
                  Note: Pending Approvals requires Approver/Admin role in demo mode.
                </div>
              ) : null}
            </div>
          </section>

          {/* Roles table (GxP) */}
          <section className="panel">
            <div className="panelTitle">Role-based actions</div>

            <div className="tableWrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Permitted actions</th>
                    <th>Restricted actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="roleCell">Submitter</td>
                    <td>
                      Upload document; view own submissions; view document details & audit trail.
                    </td>
                    <td>
                      Approve/Reject; access controlled copy download (demo restricts to Approver/Admin).
                    </td>
                  </tr>
                  <tr>
                    <td className="roleCell">Approver</td>
                    <td>
                      View pending approvals; open controlled copy; approve/reject (reject requires reason); view document details & audit trail.
                    </td>
                    <td>
                      — (demo may still restrict certain administrative actions)
                    </td>
                  </tr>
                  <tr>
                    <td className="roleCell">Admin</td>
                    <td>
                      Same as Approver in this demo (role is present for extension).
                    </td>
                    <td>
                      — (demo scope)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Workflow steps (tight) */}
          <section className="panel">
            <div className="panelTitle">Workflow steps</div>
            <ol className="steps">
              <li>Submitter uploads a document with required metadata.</li>
              <li>System records submission event (actor + timestamp UTC) and status becomes SUBMITTED.</li>
              <li>Approver opens controlled copy for review.</li>
              <li>Approver approves or rejects (rejection requires comment).</li>
              <li>Status and audit trail are viewable under Document Details.</li>
            </ol>

            <div className="panelText" style={{ marginTop: 10 }}>
              Audit Trail events should include at minimum: <strong>Upload Initiated</strong>, <strong>Submitted for Review</strong>, <strong>Approved</strong>/<strong>Rejected</strong>.
            </div>
          </section>
        </main>

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

          /* Top header */
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
          }

          .headerInfo {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            font-size: 14px;
            opacity: 0.95;
          }

          .headerName {
            font-weight: 900;
          }

          .headerSep {
            opacity: 0.35;
          }

          /* App nav */
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
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .userName {
            font-weight: 900;
            opacity: 0.95;
          }

          .rolePill {
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid rgba(120, 170, 255, 0.35);
            background: rgba(30, 60, 140, 0.35);
            font-weight: 900;
            white-space: nowrap;
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

          /* Content */
          .content {
            max-width: 1180px;
            margin: 0 auto;
            padding: 18px 18px 40px 18px;
          }

          .h1 {
            margin: 16px 0 6px;
            font-size: 44px;
            font-weight: 950;
            letter-spacing: -0.02em;
          }

          .subtitle {
            margin: 0 0 14px;
            opacity: 0.88;
            line-height: 1.6;
            max-width: 110ch;
          }

          .panel {
            margin-top: 14px;
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.14);
            background: rgba(3, 10, 20, 0.55);
            padding: 16px;
            backdrop-filter: blur(10px);
          }

          .panelTitle {
            font-weight: 950;
            font-size: 18px;
            margin-bottom: 10px;
          }

          .panelText {
            opacity: 0.9;
            line-height: 1.6;
          }

          /* Summary grid */
          .summaryGrid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px;
          }

          .summaryItem {
            border: 1px solid rgba(255, 255, 255, 0.10);
            background: rgba(255, 255, 255, 0.04);
            border-radius: 14px;
            padding: 12px;
          }

          .summaryItem.span2 {
            grid-column: span 2;
          }

          .label {
            font-weight: 900;
            opacity: 0.75;
            margin-bottom: 6px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }

          .value {
            font-weight: 950;
            font-size: 16px;
          }

          /* Links row */
          .linkRow {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
            align-items: start;
          }

          .primaryLink {
            display: block;
            padding: 12px 14px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            background: rgba(255, 255, 255, 0.06);
            color: #fff;
            text-decoration: none;
            font-weight: 950;
            text-align: center;
          }

          .primaryLink:hover {
            background: rgba(255, 255, 255, 0.10);
          }

          .disabledLink {
            opacity: 0.55;
            cursor: not-allowed;
          }

          .note {
            grid-column: 1 / -1;
            margin-top: 8px;
            opacity: 0.85;
            font-weight: 800;
          }

          /* Table */
          .tableWrap {
            margin-top: 10px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            overflow: hidden;
            background: rgba(255, 255, 255, 0.03);
          }

          .table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          th,
          td {
            padding: 12px;
            text-align: left;
            vertical-align: top;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          th {
            font-weight: 950;
            background: rgba(255, 255, 255, 0.05);
            opacity: 0.95;
          }

          .roleCell {
            font-weight: 950;
            white-space: nowrap;
          }

          /* Steps */
          .steps {
            margin: 0;
            padding-left: 18px;
            line-height: 1.7;
            font-weight: 850;
            opacity: 0.92;
          }

          @media (max-width: 980px) {
            .summaryGrid {
              grid-template-columns: 1fr;
            }
            .summaryItem.span2 {
              grid-column: auto;
            }
            .linkRow {
              grid-template-columns: 1fr 1fr;
            }
            .h1 {
              font-size: 38px;
            }
          }

          @media (max-width: 560px) {
            .linkRow {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    </>
  );
}
