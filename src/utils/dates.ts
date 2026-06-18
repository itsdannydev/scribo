// Date utilities — groupItemsByDate removed (no longer used)

export function startOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getDateKey(timestamp: number): string {
  return startOfDay(timestamp).toString();
}

export function formatDateLabel(timestamp: number): string {
  const today = startOfDay(Date.now());
  const day = startOfDay(timestamp);
  const diff = today - day;

  if (diff === 0) return 'Today';
  if (diff === 86400000) return 'Yesterday';

  const date = new Date(timestamp);
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}
