export const DEFAULT_ADMIN_SIGNATURE = "\n\nTrân trọng,\nBan Quản trị Pomo-do\nadmin@pomo-do.com";

export function applyTextFormat(
  content: string,
  type: "bold" | "italic" | "underline" | "strike" | "quote" | "ol" | "ul" | "clear" | "h1" | "h2",
  start: number,
  end: number
): { text: string; newCursorEnd: number } {
  const selected = content.slice(start, end) || "văn bản";
  let formatted = selected;

  if (type === "bold") formatted = `**${selected}**`;
  else if (type === "italic") formatted = `*${selected}*`;
  else if (type === "underline") formatted = `<u>${selected}</u>`;
  else if (type === "strike") formatted = `~~${selected}~~`;
  else if (type === "quote") formatted = `\n> ${selected}\n`;
  else if (type === "ul") formatted = `\n• ${selected}\n`;
  else if (type === "ol") formatted = `\n1. ${selected}\n`;
  else if (type === "h1") formatted = `\n# ${selected}\n`;
  else if (type === "h2") formatted = `\n## ${selected}\n`;
  else if (type === "clear") {
    formatted = selected.replace(/[*_~`>#]/g, "").replace(/<\/?u>/g, "");
  }

  const next = content.slice(0, start) + formatted + content.slice(end);
  return {
    text: next,
    newCursorEnd: start + formatted.length,
  };
}
