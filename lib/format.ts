export function formatBytes(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "")
    return "Taille inconnue";
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    return String(value);
  if (value < 1024) return `${value} o`;
  const units = ["Ko", "Mo", "Go", "To"];
  let amount = value;
  let unitIndex = -1;
  do {
    amount /= 1024;
    unitIndex += 1;
  } while (amount >= 1024 && unitIndex < units.length - 1);
  return `${amount.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ${units[unitIndex]}`;
}

export function formatDuration(
  value: number | string | null | undefined,
): string {
  if (value === null || value === undefined || value === "")
    return "Durée inconnue";
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0)
    return String(value);
  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  if (minutes > 0)
    return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
  return `${seconds} s`;
}
