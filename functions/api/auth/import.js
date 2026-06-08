import { json, error } from '../../_shared/responses.js';
import { requireUser } from '../../_shared/auth.js';
import { isAllowedDataKey, MAX_VALUE_BYTES } from '../../_shared/data-keys.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const { user, response } = await requireUser(request, env);
  if (response) return response;

  let body;
  try {
    body = await request.json();
  } catch {
    return error('Invalid JSON body');
  }

  const items = body.items;
  if (!items || typeof items !== 'object') return error('items object is required');

  const now = Date.now();
  let imported = 0;

  for (const [key, value] of Object.entries(items)) {
    if (!isAllowedDataKey(key)) continue;
    const text = String(value ?? '');
    if (new TextEncoder().encode(text).length > MAX_VALUE_BYTES) {
      return error(`Value for ${key} is too large`);
    }

    await env.DB.prepare(
      `INSERT INTO user_data (user_id, data_key, value, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, data_key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`
    ).bind(user.id, key, text, now).run();

    imported++;
  }

  return json({ ok: true, imported });
}
