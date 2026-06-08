import { json } from '../../_shared/responses.js';
import { getUserFromRequest } from '../../_shared/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const user = await getUserFromRequest(request, env);

  if (!user) {
    return json({ user: null });
  }

  return json({ user: { id: user.id, email: user.email } });
}
