export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);

  // Format as "Month Day, Year at Time" (e.g., "June 5, 2023 at 2:30 PM")
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Alternative simple version if you prefer:
export function simpleFormatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US");
}
