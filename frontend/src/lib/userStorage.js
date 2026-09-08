/**
 * Per-user localStorage helpers.
 *
 * Projects themselves live in MongoDB and are always re-fetched from
 * /api/dev/projects — these caches only exist so the UI can paint instantly
 * instead of showing a spinner while a cold backend wakes up.
 *
 * Because they are a cache of one account's data, they must be scoped to that
 * account and dropped at logout. Otherwise the next person to sign in on the
 * same browser is shown the previous user's projects until the API responds.
 */

const PREFIX = 'syl_dev_';

/** Email of the signed-in user, or 'default' when signed out. */
export const currentUserKey = () => {
  try {
    const raw = localStorage.getItem('sylithe_user');
    return raw ? JSON.parse(raw).email || 'default' : 'default';
  } catch {
    return 'default';
  }
};

/** Scope a storage key to the signed-in user: `syl_dev_x` -> `syl_dev_x_a@b.com`. */
export const userKey = (key) => `${key}_${currentUserKey()}`;

/** Read + JSON.parse a per-user key, returning `fallback` if absent or corrupt. */
export const readUserJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(userKey(key));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

/** JSON.stringify + write a per-user key. Silently ignores quota errors. */
export const writeUserJson = (key, value) => {
  try {
    localStorage.setItem(userKey(key), JSON.stringify(value));
  } catch {
    /* quota exceeded — the cache is optional, the API remains the source of truth */
  }
};

/**
 * Drop every cached dashboard key, for all accounts.
 *
 * Called on logout. Deliberately clears other accounts' entries too: they are
 * pure caches, re-populated from the API on next sign-in, and leaving them
 * behind is how one user's project list ends up on another user's screen.
 */
export const clearUserCaches = () => {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* storage unavailable (private mode) — nothing cached to clear */
  }
};
