// pages/life-sciences/app/approval/approvals/index.js

import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiFetch } from "../../../../lib/life_sciences_app_lib/api";
import { getCurrentUser, requireAuthOrRedirect } from "../../../../lib/life_sciences_app_lib/auth";

function prettyErr(e) {
if (!e) return null;
if (typeof e === "string") return e;
return e?.message || "Request failed.";
}

function safeStr(x, fallback = "") {
if (x === null || x === undefined) return fallback;
return String(x);
}

function normalizeText(x) {
return String(x || "").toLowerCase();
}

function truncateMiddle(s, max = 40) {
const str = String(s || "");
if (str.length <= max) return str;
const left = Math.ceil((max - 3) / 2);
const right = Math.floor((max - 3) / 2);
return `${str.slice(0, left)}...${str.slice(str.length - right)}`;
}

function filenameFromItem(it) {
return it?.filename || it?.originalFilename || it?.key || "document";
}

function pickOwner(it) {
return (
it?.submittedBy ||
it?.submittedByEmail ||
it?.ownerUsername ||
it?.ownerEmail ||
it?.ownerUserId ||
"—"
);
}

function pickVersion(it) {
const v =
it?.versionUnderReview ??
it?.version ??
it?.currentVersion ??
it?.docVersion ??
it?.revision ??
it?.rev;

if (v === null || v === undefined || v === "") return "—";
return String(v);
}

function pickSubmittedAt(it) {
return it?.submittedAt || it?.submissionTimestamp || it?.createdAt || it?.timestamp || null;
}

function formatUtc(ts) {
if (!ts) return "—";
const raw = String(ts);
const d = new Date(raw);

if (Number.isNaN(d.getTime())) {
const n = Number(raw);
if (!Number.isFinite(n)) return raw;
const d2 = new Date(n);
if (Number.isNaN(d2.getTime())) return raw;
return d2.toISOString().replace("T", " ").replace("Z", " UTC");
}

return d.toISOString().replace("T", " ").replace("Z", " UTC");
}

function normalizeStatus(it) {
const s = String(it?.status || it?.workflowStatus || it?.state || "SUBMITTED").trim();
const x = s.toLowerCase();
if (x.includes("reject")) return "Rejected";
if (x.includes("approv")) return "Approved";
if (x.includes("review") || x.includes("pending") || x.includes("under")) return "Under Review";
return "Submitted";
}

function statusTone(status) {
const s = (status || "").toLowerCase();
if (s === "approved") return "approved";
if (s === "rejected") return "rejected";
if (s === "under review") return "review";
return "submitted";
}

export default function ApprovalsIndexPage() {
const router = useRouter();

const [items, setItems] = useState([]);
const [busy, setBusy] = useState(true);
const [error, setError] = useState(null);
const [q, setQ] = useState("");

// Hydration-safe user context (don’t read localStorage on server render)
const [mounted, setMounted] = useState(false);
const [me, setMe] = useState(null);

useEffect(() => {
setMounted(true);
try {
setMe(getCurrentUser?.() || null);
} catch {
setMe(null);
}
}, []);

const navDisplayName = mounted ? (me?.displayName || "Demo User") : "Demo User";
const navRole = mounted ? safeStr(me?.role || "Demo User") : "Demo User";

async function load() {
setBusy(true);
setError(null);

try {
const u = getCurrentUser();
if (!u) throw new Error("Not signed in.");
if (u.role !== "Approver" && u.role !== "Admin") {
throw new Error("Pending approvals are restricted to Approver/Admin roles in demo mode.");
}

const data = await apiFetch("/approvals/pending", { method: "GET" }, router);
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
const ok = requireAuthOrRedirect(router, "/life-sciences/app/approval/approvals");
if (!ok) return;

load();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const rows = useMemo(() => {
const query = normalizeText(q).trim();

const mapped = (items || []).map((it) => {
const id = it?.documentId || it?.id || "";
const title = it?.title || it?.documentName || it?.name || filenameFromItem(it);
const owner = pickOwner(it);
const submittedAt = formatUtc(pickSubmittedAt(it));
const version = pickVersion(it);
const status = normalizeStatus(it);

return {
id,
title,
owner,
submittedAt,
version,
status,
statusTone: statusTone(status),
};
});

if (!query) return mapped;

return mapped.filter((r) => {
const hay = [r.id, r.title, r.owner, r.submittedAt, r.version, r.status]
.map(normalizeText)
.join(" | ");
return hay.includes(query);
});
}, [items, q]);

return (
<>
<Head>
<title>Pending Approvals - VDC Demo</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
</Head>

<div className="page">
{/* Top header (matches Upload/Submissions) */}
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
{/* App nav */}
<nav className="appNav">
<div className="navLeft">
<Link className="appNavLink" href="/life-sciences/app">Overview</Link>
<Link className="appNavLink" href="/life-sciences/app/upload">Upload</Link>
<Link className="appNavLink" href="/life-sciences/app/submissions">Submissions</Link>
<Link className="appNavLink" href="/life-sciences/app/documents">Documents</Link>
<Link className="appNavLink active" href="/life-sciences/app/approval/approvals">Pending Approvals</Link>
</div>

<div className="navUser">
<span className="userName" suppressHydrationWarning>{navDisplayName}</span>
<span className="userRole" suppressHydrationWarning>{navRole}</span>
<button className="logoutBtn" onClick={() => router.push("/life-sciences/app/login")}>
Logout
</button>
</div>
</nav>

<header className="pageHeader">
<h1 className="h1">Pending approvals</h1>
<p className="subtitle">
Documents requiring approval by the current role. Open the controlled copy, then approve or reject. Rejection requires a reason. All timestamps are recorded in UTC.
</p>
</header>

<section className="panel">
<div className="panelHeaderRow">
<div className="searchWrap">
<label className="searchLabel" htmlFor="queueSearch">Search queue</label>
<input
id="queueSearch"
value={q}
onChange={(e) => setQ(e.target.value)}
placeholder="Search by document name, submitter, status, or UTC timestamp…"
className="searchInput"
disabled={busy}
/>
</div>

<div className="rightControls">
<div className="countPill">{rows.length} item{rows.length === 1 ? "" : "s"}</div>
<button onClick={load} disabled={busy} className="secondaryButton">Refresh</button>
</div>
</div>

{error && (
<div className="errorBox">
<strong>Error:</strong> {error}
</div>
)}

{busy ? (
<div className="muted">Loading…</div>
) : rows.length === 0 ? (
<div className="muted">No pending approvals right now.</div>
) : (
<div className="tableWrap">
<table className="table">
<thead>
<tr>
<th>Document</th>
<th className="nowrap">Submitted by</th>
<th className="nowrap">Submitted (UTC)</th>
<th className="nowrap">Version</th>
<th className="nowrap">Status</th>
<th className="nowrap">Actions</th>
</tr>
</thead>
<tbody>
{rows.map((r) => (
<tr key={r.id}>
<td>
<div className="docName">{r.title}</div>
<div className="docId">Document ID: {truncateMiddle(r.id, 42)}</div>
</td>
<td className="nowrap" title={r.owner}>{truncateMiddle(r.owner, 34)}</td>
<td className="nowrap">{r.submittedAt}</td>
<td className="nowrap">{r.version}</td>
<td className="nowrap">
<span className={`badge ${r.statusTone}`}>{r.status}</span>
</td>
<td className="nowrap">
<div className="actionsStack">
{/* This is where Approve/Reject works (detail page). */}
<Link href={`/life-sciences/app/approval/${encodeURIComponent(r.id)}`} className="tableAction approve">
Approve Document
</Link>

<Link href={`/life-sciences/app/approval/${encodeURIComponent(r.id)}?action=reject`} className="tableAction reject">
Reject Document
</Link>

<Link href={`/life-sciences/app/documents/${encodeURIComponent(r.id)}`} className="tableAction secondary">
View Document
</Link>

<Link href={`/life-sciences/app/documents/${encodeURIComponent(r.id)}?view=audit`} className="tableAction secondary">
View Audit Trail
</Link>
</div>
</td>
</tr>
))}
</tbody>
</table>
</div>
)}
</section>
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
justify-content: space-between;
align-items: center;
gap: 12px;
padding: 10px 12px;
border: 1px solid rgba(255, 255, 255, 0.16);
border-radius: 14px;
background: rgba(10, 15, 30, 0.55);
margin-bottom: 12px;
}
.navLeft {
display: flex;
gap: 14px;
flex-wrap: wrap;
align-items: center;
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

.navUser {
display: flex;
align-items: center;
gap: 10px;
white-space: nowrap;
}
.userName {
color: rgba(199, 210, 254, 0.95);
font-weight: 900;
}
.userRole {
color: rgba(165, 180, 252, 0.95);
font-weight: 800;
font-size: 0.85rem;
padding: 4px 8px;
border-radius: 999px;
border: 1px solid rgba(99, 102, 241, 0.35);
background: rgba(99, 102, 241, 0.16);
}
.logoutBtn {
padding: 6px 10px;
border-radius: 10px;
border: 1px solid rgba(255, 255, 255, 0.22);
background: rgba(255, 255, 255, 0.08);
color: #fff;
cursor: pointer;
font-weight: 900;
}
.logoutBtn:hover {
background: rgba(255, 255, 255, 0.14);
}

.pageHeader {
margin: 6px 0 10px;
}
.h1 {
font-size: clamp(1.55rem, 2.8vw, 2.25rem);
font-weight: 900;
margin: 0 0 6px;
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
}

.panelHeaderRow {
display: flex;
justify-content: space-between;
align-items: flex-end;
gap: 12px;
margin-bottom: 10px;
}

.searchWrap {
flex: 1;
min-width: 260px;
}
.searchLabel {
display: block;
font-weight: 850;
font-size: 0.85rem;
color: rgba(255, 255, 255, 0.92);
margin-bottom: 6px;
}
.searchInput {
width: 100%;
padding: 10px 12px;
border-radius: 12px;
border: 1px solid rgba(255, 255, 255, 0.22);
background: rgba(10, 18, 35, 0.92);
color: #ffffff;
outline: none;
}
.searchInput::placeholder {
color: rgba(255, 255, 255, 0.6);
}

.rightControls {
display: flex;
align-items: center;
gap: 10px;
}
.countPill {
padding: 7px 10px;
border-radius: 999px;
border: 1px solid rgba(255, 255, 255, 0.16);
background: rgba(255, 255, 255, 0.06);
font-weight: 900;
white-space: nowrap;
}
.secondaryButton {
padding: 9px 12px;
border-radius: 12px;
border: 1px solid rgba(255, 255, 255, 0.18);
background: rgba(255, 255, 255, 0.06);
color: #ffffff;
font-weight: 850;
cursor: pointer;
white-space: nowrap;
}
.secondaryButton:disabled {
opacity: 0.55;
cursor: not-allowed;
}

.errorBox {
margin-top: 10px;
border: 1px solid rgba(255, 99, 99, 0.55);
background: rgba(255, 99, 99, 0.08);
border-radius: 14px;
padding: 10px 12px;
color: rgba(255, 240, 240, 0.95);
}

.muted {
color: rgba(255, 255, 255, 0.78);
margin-top: 10px;
}

.tableWrap {
margin-top: 10px;
border: 1px solid rgba(255, 255, 255, 0.14);
background: rgba(10, 18, 35, 0.55);
border-radius: 16px;
overflow: hidden;
}
.table {
width: 100%;
border-collapse: collapse;
font-size: 0.92rem;
}
thead th {
text-align: left;
font-size: 0.8rem;
letter-spacing: 0.04em;
text-transform: uppercase;
color: rgba(255, 255, 255, 0.8);
padding: 10px 12px;
background: rgba(0, 0, 0, 0.22);
border-bottom: 1px solid rgba(255, 255, 255, 0.12);
white-space: nowrap;
}
tbody td {
padding: 10px 12px;
border-bottom: 1px solid rgba(255, 255, 255, 0.1);
vertical-align: top;
color: rgba(255, 255, 255, 0.92);
}
tbody tr:last-child td {
border-bottom: none;
}

.docName {
font-weight: 900;
color: #ffffff;
line-height: 1.25;
}
.docId {
margin-top: 4px;
font-size: 0.82rem;
color: rgba(255, 255, 255, 0.74);
font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.nowrap {
white-space: nowrap;
}

.badge {
display: inline-flex;
align-items: center;
justify-content: center;
padding: 5px 10px;
border-radius: 999px;
font-weight: 900;
font-size: 0.82rem;
border: 1px solid rgba(255, 255, 255, 0.18);
background: rgba(255, 255, 255, 0.06);
}
.badge.submitted {
background: rgba(59, 130, 246, 0.16);
border-color: rgba(59, 130, 246, 0.35);
}
.badge.review {
background: rgba(245, 158, 11, 0.16);
border-color: rgba(245, 158, 11, 0.35);
}
.badge.approved {
background: rgba(34, 197, 94, 0.16);
border-color: rgba(34, 197, 94, 0.35);
}
.badge.rejected {
background: rgba(239, 68, 68, 0.16);
border-color: rgba(239, 68, 68, 0.35);
}

.actionsStack {
display: flex;
flex-direction: column;
gap: 8px;
}
.tableAction {
display: inline-flex;
align-items: center;
justify-content: center;
padding: 8px 10px;
border-radius: 12px;
border: 1px solid rgba(255, 255, 255, 0.18);
background: rgba(255, 255, 255, 0.06);
color: #ffffff;
text-decoration: none;
font-weight: 900;
white-space: nowrap;
}
.tableAction:hover {
background: rgba(255, 255, 255, 0.1);
}
.tableAction.secondary {
background: rgba(99, 102, 241, 0.14);
border-color: rgba(99, 102, 241, 0.25);
}
.tableAction.approve {
background: rgba(34, 197, 94, 0.14);
border-color: rgba(34, 197, 94, 0.25);
}
.tableAction.reject {
background: rgba(239, 68, 68, 0.14);
border-color: rgba(239, 68, 68, 0.25);
}

@media (max-width: 980px) {
.appNav {
align-items: flex-start;
flex-direction: column;
}
.navUser {
width: 100%;
justify-content: space-between;
}
.panelHeaderRow {
flex-direction: column;
align-items: stretch;
}
.rightControls {
justify-content: space-between;
}
}

@media (max-width: 900px) {
.tableWrap {
overflow-x: auto;
}
}
`}</style>
</div>
</>
);
}