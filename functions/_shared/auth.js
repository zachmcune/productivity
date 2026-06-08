import { parseCookies, SESSION_COOKIE } from './cookies.js';
import { error } from './responses.js';

export async function getUserFromRequest(request, env) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token) return null;

  const now = Date.now();
  const row = await env.DB.prepare(
    `SELECT users.id, users.email
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ? AND sessions.expires_at > ?`
  ).bind(token, now).first();

  return row || null;
}

export async function requireUser(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return { user: null, response: error('Not signed in', 401) };
  return { user, response: null };
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createSession(env, userId) {
  const token = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + 60 * 60 * 24 * 30 * 1000;

  await env.DB.prepare(
    `INSERT INTO sessions (token, user_id, expires_at, created_at)
     VALUES (?, ?, ?, ?)`
  ).bind(token, userId, expiresAt, now).run();

  return token;
}
