/**
 * Orthodox Pascha (Easter) calculator using the Meeus Julian algorithm.
 * Computes Lent start/end, current day, and days until next Lent.
 */

function julianToGregorianOffset(year) {
  if (year >= 2100) return 14;
  if (year >= 1900) return 13;
  if (year >= 1800) return 12;
  return 11;
}

export function getPascha(year) {
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;

  const offset = julianToGregorianOffset(year);
  const date = new Date(year, month - 1, day); // JS months are 0-indexed
  date.setDate(date.getDate() + offset);
  return date;
}

export function getLentStart(year) {
  const pascha = getPascha(year);
  const start = new Date(pascha);
  start.setDate(start.getDate() - 55);
  return start;
}

export function getLentEnd(year) {
  return getPascha(year);
}

export function getCurrentLentDay() {
  const now = new Date();
  const year = now.getFullYear();
  const lentStart = getLentStart(year);
  const lentEnd = getLentEnd(year);

  // Strip time for clean day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(lentStart.getFullYear(), lentStart.getMonth(), lentStart.getDate());
  const end = new Date(lentEnd.getFullYear(), lentEnd.getMonth(), lentEnd.getDate());

  if (today >= start && today < end) {
    const diffMs = today - start;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }
  return null;
}

export function daysUntilNextLent() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const year = today.getFullYear();

  const lentStart = getLentStart(year);
  const lentEnd = getLentEnd(year);
  const start = new Date(lentStart.getFullYear(), lentStart.getMonth(), lentStart.getDate());
  const end = new Date(lentEnd.getFullYear(), lentEnd.getMonth(), lentEnd.getDate());

  // Currently in Lent
  if (today >= start && today < end) return 0;

  // Lent already passed this year
  if (today >= end) {
    const nextStart = getLentStart(year + 1);
    const ns = new Date(nextStart.getFullYear(), nextStart.getMonth(), nextStart.getDate());
    return Math.ceil((ns - today) / (1000 * 60 * 60 * 24));
  }

  // Lent hasn't started yet this year
  return Math.ceil((start - today) / (1000 * 60 * 60 * 24));
}

export function getNextPascha() {
  const now = new Date();
  const pascha = getPascha(now.getFullYear());
  if (now > pascha) {
    return getPascha(now.getFullYear() + 1);
  }
  return pascha;
}
