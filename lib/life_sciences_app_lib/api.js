// lib/life_sciences_app_lib/api.js
//
// DEMO mode API client (no Cognito):
// - Uses demo session from localStorage (vdc_demo_session)
// - Sends identity to backend via headers:
//    x-demo-user, x-demo-role
//
// Your DEV Lambdas can accept these headers.
// (When you reintroduce Cognito in PROD, you'll swap this back.)

import { CONFIG } from "./config";
import { getCurrentUser, requireAuthOrRedirect } from "./auth";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    (value.constructor === Object || Object.getPrototypeOf(value) === Object.prototype)
  );
}

export async function apiFetch(path, options = {}, router = null) {
  // Prevent accidental server-side calls (should only be used in effects / handlers).
  if (typeof window === "undefined") {
    throw new ApiError("apiFetch is client-only in demo mode.", 500);
  }

  // Require demo login
  const ok = requireAuthOrRedirect(router, window.location.pathname || "/life-sciences/app");
  if (!ok) throw new ApiError("Not signed in.", 401);

  const user = getCurrentUser();
  const url = `${CONFIG.apiBaseUrl}${path}`;

  const headers = new Headers(options.headers || {});

  // Body handling:
  // - FormData: send as-is, do NOT set JSON content-type
  // - Plain object: JSON.stringify and set application/json
  // - String/Blob/etc: send as-is; caller controls headers
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;

  let body = options?.body;

  if (isFormData) {
    // let browser set multipart boundary
  } else if (isPlainObject(body)) {
    headers.set("Content-Type", headers.get("Content-Type") || "application/json");
    body = JSON.stringify(body);
  } else if (typeof body === "string") {
    // assume caller knows what they're doing
  } else if (body == null) {
    // no body
  } else {
    // For other body types (Blob/ArrayBuffer/etc), do not force JSON
    // but if caller didn't set anything and it's not FormData, default JSON is NOT safe here.
  }

  // Demo identity headers for DEV Lambdas
  headers.set("x-demo-user", user?.displayName || "anonymous");
  headers.set("x-demo-role", user?.role || "Submitter");

  const res = await fetch(url, { ...options, body, headers });

  let bodyText = "";
  try {
    bodyText = await res.text();
  } catch {
    bodyText = "";
  }

  let data = null;
  try {
    data = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    data = bodyText || null;
  }

  if (!res.ok) {
    const msg =
      (data && data.error) ||
      (typeof data === "string" ? data : null) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data;
}
