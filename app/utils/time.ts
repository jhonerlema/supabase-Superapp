export function getTimeAgo(date: Date | string): string {
  const now = new Date();
  const parsed = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - parsed.getTime()) / 1000);

  if (seconds < 60) return "hace unos segundos";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `hace ${minutes} minuto${minutes !== 1 ? "s" : ""}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} hora${hours !== 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days !== 1 ? "s" : ""}`;
}