import { json, error } from '../../_shared/responses.js';
import { sessionCookieHeader } from '../../_shared/cookies.js';
import { hashPassword, generateSalt } from '../../_shared/crypto.js';
import { createSession, isValidEmail } from '../../_shared/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return error('Invalid JSON body');
  }

  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!isValidEmail(email)) return error('Enter a valid email address');
  if (password.length < 8) return error('Password must be at least 8 characters');

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first();
  if (existing) return error('An account with this email already exists', 409);

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);
  const userId = crypto.randomUUID();
  const now = Date.now();

  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, password_salt, created_at)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(userId, email, passwordHash, salt, now).run();

  const token = await createSession(env, userId);

  return json(
    { user: { id: userId, email } },
    201,
    { 'Set-Cookie': sessionCookieHeader(token, request) }
  );
}
