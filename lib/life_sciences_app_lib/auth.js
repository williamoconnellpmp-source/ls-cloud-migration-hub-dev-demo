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

function isBrowser() {
  return typeof window !== "undefined";
}

function getPathname() {
  if (!isBrowser()) return "";
  try {
    return window.location?.pathname || "";
  } catch (e) {
    return "";
  }
}

function isOnDemoLoginPath() {
  const p = getPathname();
  return (
    p === "/life-sciences/app/demo-login" ||
    p.startsWith("/life-sciences/app/demo-login/")
  );
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
      role, // "Submitter" | "Approver"
      ts: parsed.ts || null,
    };
  } catch (e) {
    return null;
  }
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
  // This prevents wrapper/layout code from thrashing redirects.
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

export function logout(router) {
  if (isBrowser()) {
    try {
      window.localStorage.removeItem(DEMO_SESSION_KEY);
    } catch (e) {}
  }

  const dest = "/life-sciences/app/demo-login";

  try {
    if (router && typeof router.push === "function") {
      router.push(dest);
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
  return "/life-sciences/app/demo-login";
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
