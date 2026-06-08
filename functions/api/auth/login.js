import { json, error } from '../../_shared/responses.js';
import { sessionCookieHeader } from '../../_shared/cookies.js';
import { verifyPassword } from '../../_shared/crypto.js';
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
  if (!password) return error('Password is required');

  const user = await env.DB.prepare(
    'SELECT id, email, password_hash, password_salt FROM users WHERE email = ?'
  ).bind(email).first();

  if (!user) return error('Invalid email or password', 401);

  const valid = await verifyPassword(password, user.password_salt, user.password_hash);
  if (!valid) return error('Invalid email or password', 401);

  const token = await createSession(env, user.id);

  return json(
    { user: { id: user.id, email: user.email } },
    200,
    { 'Set-Cookie': sessionCookieHeader(token, request) }
  );
}
