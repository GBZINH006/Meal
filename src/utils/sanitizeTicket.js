
export function sanitizeTicketCode(raw) {
  if (raw === null || raw === undefined) return "";
  let s = String(raw).trim();
  
  s = s.replace(/[^\w\-_]/g, "");
 
  if (s.length > 128) s = s.slice(0, 128);
  return s;
}
