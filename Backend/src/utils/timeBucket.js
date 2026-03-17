export const getTenSecondBucket = (timestamp = Date.now()) => {
  const raw = typeof timestamp === 'number' ? timestamp : Number(new Date(timestamp));
  const safeTimestamp = Number.isFinite(raw) ? raw : Date.now();
  const bucket = Math.floor(safeTimestamp / 10000) * 10000;
  return new Date(bucket).toISOString();
};
