import { json } from '../../_shared/responses.js';
import { clearSessionCookieHeader, parseCookies, SESSION_COOKIE } from '../../_shared/cookies.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const token = parseCookies(request)[SESSION_COOKIE];

  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }

  return json(
    { ok: true },
    200,
    { 'Set-Cookie': clearSessionCookieHeader(request) }
  );
}
