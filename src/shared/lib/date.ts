/**
 * Formats a date string or Date object to Thai locale date string (e.g., "23/01/2026")
 */
export function formatThaiDate(date: string | Date | null | undefined): string {
    if (!date) return "-";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-";

    return d.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

/**
 * Formats a date string or Date object to Thai locale date-time string (e.g., "23/01/2026 07:55 น.")
 */
export function formatThaiDateTime(date: string | Date | null | undefined): string {
    if (!date) return "-/-/- -, --:-- น.";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "-/-/- -, --:-- น.";

    const dateStr = d.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

    const timeStr = d.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    return `${dateStr} ${timeStr} น.`;
}
