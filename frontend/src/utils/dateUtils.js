export const parseUTCDate = (d) => {
  if(!d) return null;
  const s = String(d);
  return new Date(s.endsWith('Z') ? s : s + 'Z');
};