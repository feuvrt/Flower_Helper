const MS_IN_DAY = 24 * 60 * 60 * 1000;

export const todayIso = () => toIsoDate(new Date());

export const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export const parseIsoDate = (value?: string | Date | null) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoDateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  const date = isoDateMatch
    ? new Date(Number(isoDateMatch[1]), Number(isoDateMatch[2]) - 1, Number(isoDateMatch[3]))
    : new Date(trimmed);

  return Number.isNaN(date.getTime()) ? null : date;
};

export const addDays = (dateValue?: string | Date | null, days = 0) => {
  const date = parseIsoDate(dateValue);
  if (!date) return '';

  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

export const addMonths = (dateValue?: string | Date | null, months = 0) => {
  const date = parseIsoDate(dateValue);
  if (!date) return '';

  date.setMonth(date.getMonth() + months);
  return toIsoDate(date);
};

export const daysUntil = (dateValue?: string | Date | null) => {
  const today = parseIsoDate(todayIso());
  const target = parseIsoDate(dateValue);
  if (!today || !target) return Number.POSITIVE_INFINITY;

  return Math.round((target.getTime() - today.getTime()) / MS_IN_DAY);
};

export const formatDate = (value?: string | Date | null) => {
  const date = parseIsoDate(value);
  if (!date) return 'не указано';

  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};
