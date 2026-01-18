// lib/life_sciences_app_lib/auth.js
//
// DEMO AUTH (no Cognito):
// - Stores session in localStorage under key: vdc_demo_session
// - Value: { displayName, role, ts }
//
// This file intentionally keeps some Cognito-related function names as safe stubs
// so older pages that import them do not crash builds.

export const DEMO_SESSION_KEY = "vdc_demo_session";
const REDIRECT_LOCK_KEY = "vdc_demo_redirect_lock_ts";

// If you ever add more demo keys, keep them under this prefix.
const DEMO_KEY_PREFIX = "vdc_demo_";

function isBrowser() {
  return typeof window !== "undefined";
}

function safeGetLocationPathname() {
  if (!isBrowser()) return "";
  try {
    return window.location?.pathname || "";
  } catch (e) {
    return "";
  }
}

function isOnDemoLoginPath() {
  const p = safeGetLocationPathname();
  return p === "/life-sciences/app/demo-login" || p.startsWith("/life-sciences/app/demo-login/");
}

function redirectLocked() {
  if (!isBrowser()) return false;
  try {
    const raw = window.sessionStorage.getItem(REDIRECT_LOCK_KEY);
    const ts = raw ? Number(raw) : 0;
    // 1500ms cooldown to prevent thrash
    return ts && Date.now() - ts < 1500;
  } catch (e) {
    return false;
  }
}

function setRedirectLock() {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.setItem(REDIRECT_LOCK_KEY, String(Date.now()));
  } catch (e) {}
}

function clearRedirectLock() {
  if (!isBrowser()) return;
  try {
    window.sessionStorage.removeItem(REDIRECT_LOCK_KEY);
  } catch (e) {}
}

export function getCurrentUser() {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const displayName = (parsed.displayName || "").toString().trim();
    const role = (parsed.role || "").toString().trim();

    if (!displayName) return null;
    if (!role) return null;

    return {
      displayName,
      role, // "Submitter" | "Approver" | "Admin" (future)
      ts: parsed.ts || null,
    };
  } catch (e) {
    return null;
  }
}

export function setCurrentUser({ displayName, role }) {
  if (!isBrowser()) return false;

  const dn = (displayName || "").toString().trim();
  const r = (role || "").toString().trim();

  if (!dn || !r) return false;

  try {
    const payload = { displayName: dn, role: r, ts: new Date().toISOString() };
    window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(payload));
    clearRedirectLock();
    return true;
  } catch (e) {
    return false;
  }
}

export function clearDemoSession() {
  if (!isBrowser()) return;

  try {
    // Remove known key
    window.localStorage.removeItem(DEMO_SESSION_KEY);

    // Remove any other demo keys (defensive)
    // This prevents “I have to clear cache” issues.
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(DEMO_KEY_PREFIX)) {
        window.localStorage.removeItem(k);
      }
    }
  } catch (e) {}

  clearRedirectLock();
}

export function isLoggedIn() {
  return !!getCurrentUser();
}

export function getUserRole() {
  const u = getCurrentUser();
  return u?.role || null;
}

export function hasRole(requiredRoles) {
  const role = getUserRole();
  if (!role) return false;
  if (Array.isArray(requiredRoles)) return requiredRoles.includes(role);
  return role === requiredRoles;
}

// Redirect to demo-login if not logged in.
// IMPORTANT:
// - MUST NOT redirect-loop.
// - MUST allow demo-login route to render even when not logged in,
//   because shared wrappers/layouts may call this.
export function requireAuthOrRedirect(router, returnTo = "/life-sciences/app") {
  if (!isBrowser()) return false;

  // If we are already on demo-login, allow page to render.
  if (isOnDemoLoginPath()) return true;

  // If already logged in, allow.
  const u = getCurrentUser();
  if (u) return true;

  // Cooldown to prevent infinite rapid redirects.
  if (redirectLocked()) return false;

  const encoded = encodeURIComponent(returnTo || "/life-sciences/app");
  const dest = `/life-sciences/app/demo-login?returnTo=${encoded}`;

  setRedirectLock();

  try {
    if (router && typeof router.replace === "function") {
      router.replace(dest);
    } else {
      window.location.assign(dest);
    }
  } catch (e) {
    window.location.assign(dest);
  }

  return false;
}

// NEW: Role gate that redirects cleanly instead of throwing ugly page errors.
// If role fails, send user to Overview with a reason param.
export function requireRoleOrRedirect(router, requiredRoles, returnTo = "/life-sciences/app") {
  if (!isBrowser()) return false;

  const ok = requireAuthOrRedirect(router, returnTo);
  if (!ok) return false;

  if (hasRole(requiredRoles)) return true;

  // If role mismatch, redirect to Overview with a hint.
  // You can optionally read this on the Overview page later and show a friendly banner.
  const reason = encodeURIComponent("not_authorized");
  const dest = `/life-sciences/app?reason=${reason}`;

  try {
    if (router && typeof router.replace === "function") {
      router.replace(dest);
    } else {
      window.location.assign(dest);
    }
  } catch (e) {
    window.location.assign(dest);
  }

  return false;
}

export function logout(router) {
  clearDemoSession();

  // Always go to demo-login and ALWAYS provide a safe returnTo
  const dest = buildLoginUrl("/life-sciences/app");

  try {
    if (router && typeof router.replace === "function") {
      router.replace(dest);
      return;
    }
  } catch (e) {}

  if (isBrowser()) window.location.assign(dest);
}

export function buildLoginUrl(returnTo = "/life-sciences/app") {
  const encoded = encodeURIComponent(returnTo || "/life-sciences/app");
  return `/life-sciences/app/demo-login?returnTo=${encoded}`;
}

export function buildLogoutUrl() {
  // Kept for legacy callers; real logout should call logout(router)
  return buildLoginUrl("/life-sciences/app");
}

/* ---------------------------
   Safe stubs (Cognito legacy)
   --------------------------- */

export async function exchangeCodeForTokens() {
  return null;
}

export function getTokens() {
  return null;
}

export function isExpired() {
  return false;
}

export function getAccessToken() {
  return null;
}

export function clearTokens() {
  return;
}

export function getUserGroupsFromIdToken() {
  return [];
}

export function parseJwt() {
  return null;
}
