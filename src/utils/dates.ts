const MS_IN_DAY = 24 * 60 * 60 * 1000;

export const todayIso = () => toIsoDate(new Date());

export const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

export const addDays = (dateIso: string, days: number) => {
  const date = parseIsoDate(dateIso);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
};

export const addMonths = (dateIso: string, months: number) => {
  const date = parseIsoDate(dateIso);
  date.setMonth(date.getMonth() + months);
  return toIsoDate(date);
};

export const daysUntil = (dateIso: string) => {
  const today = parseIsoDate(todayIso()).getTime();
  const target = parseIsoDate(dateIso).getTime();
  return Math.round((target - today) / MS_IN_DAY);
};

export const formatDate = (dateIso: string) => {
  if (!dateIso) return 'не указана';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(parseIsoDate(dateIso));
};

export const parseIsoDate = (dateIso: string) => {
  const [year, month, day] = dateIso.split('-').map(Number);
  return new Date(year, month - 1, day);
};
