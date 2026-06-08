import { json, error } from '../../_shared/responses.js';
import { requireUser } from '../../_shared/auth.js';
import { isAllowedDataKey, MAX_VALUE_BYTES } from '../../_shared/data-keys.js';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const { user, response } = await requireUser(request, env);
  if (response) return response;

  const key = params.key;
  if (!isAllowedDataKey(key)) return error('Unknown data key', 404);

  const row = await env.DB.prepare(
    'SELECT value FROM user_data WHERE user_id = ? AND data_key = ?'
  ).bind(user.id, key).first();

  return json({ key, value: row?.value ?? null });
}

export async function onRequestPut(context) {
  const { request, env, params } = context;
  const { user, response } = await requireUser(request, env);
  if (response) return response;

  const key = params.key;
  if (!isAllowedDataKey(key)) return error('Unknown data key', 404);

  let body;
  try {
    body = await request.json();
  } catch {
    return error('Invalid JSON body');
  }

  const value = String(body.value ?? '');
  if (new TextEncoder().encode(value).length > MAX_VALUE_BYTES) {
    return error('Value is too large');
  }

  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO user_data (user_id, data_key, value, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, data_key) DO UPDATE SET
       value = excluded.value,
       updated_at = excluded.updated_at`
  ).bind(user.id, key, value, now).run();

  return json({ ok: true, key });
}
