export const ALLOWED_DATA_KEYS = new Set([
  'hub-notes',
  'hub-todos',
  'hub-colors',
  'hub-transitions-enabled',
  'hub-game-scores',
]);

export const MAX_VALUE_BYTES = 512_000;

export function isAllowedDataKey(key) {
  return ALLOWED_DATA_KEYS.has(key);
}
