export function toUtcIso(date: string, time: string): Date | undefined {
  const local = `${date}T${time}`;
  const d = new Date(local);
  return isNaN(d.getTime()) ? undefined : d;
}